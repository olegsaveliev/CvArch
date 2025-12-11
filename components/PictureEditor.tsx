import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface PictureEditorProps {
  onAddToResume: (imgData: string) => void;
}

export const PictureEditor: React.FC<PictureEditorProps> = ({ onAddToResume }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Make this professional, studio lighting, wearing a suit');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setOriginalImage(event.target.result);
          setGeneratedImage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openApiKeySelector = async () => {
      const win = window as any;
      if (win.aistudio) {
          try {
              await win.aistudio.openSelectKey();
          } catch (e) {
              console.error("Failed to open key selector", e);
          }
      } else {
          alert("API Key selection helper is not available. Please check your environment configuration.");
      }
  };

  // Resolve API key from multiple sources: AI Studio helper, env variables
  const resolveApiKey = () => {
    const envKey = (process.env.API_KEY || process.env.GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY) as string | undefined;
    return envKey;
  };

  const handleGenerate = async () => {
    if (!originalImage) return;

    setLoading(true);
    setError('');

    try {
        // Enforce API Key selection for paid service (required for image models)
        try {
            const win = window as any;
            if (win.aistudio) {
                const hasKey = await win.aistudio.hasSelectedApiKey();
                if (!hasKey) {
                    await win.aistudio.openSelectKey();
                }
            }
        } catch (e) {
            console.warn("AIStudio check failed, proceeding with env key if available", e);
        }

        // Initialize API with key from env (or AI Studio helper)
        const apiKey = resolveApiKey();
        if (!apiKey) {
            setError("API key is missing. Please add GEMINI_API_KEY to .env.local and restart the dev server, or use Configure API Key.");
            return;
        }
        const ai = new GoogleGenAI({ apiKey });

        // Extract base64 data without header
        const base64Data = originalImage.split(',')[1];
        const mimeType = originalImage.split(';')[0].split(':')[1];

        const response = await ai.models.generateContent({
            // Use faster image-capable model; swap to 'gemini-3-pro-image-preview' if preferred
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Data
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }
        });

        // Parse response for image
        let foundImage = false;
        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imgUrl = `data:image/png;base64,${part.inlineData.data}`;
                    setGeneratedImage(imgUrl);
                    foundImage = true;
                    break;
                }
            }
        }

        if (!foundImage) {
            setError("No image generated. The model might have returned text only.");
        }

    } catch (err: any) {
        console.error(err);
        let msg = err.message || "Failed to generate image.";
        
        // Handle 403 Permission Denied specifically
        if (JSON.stringify(err).includes("403") || msg.includes("403") || msg.includes("PERMISSION_DENIED")) {
            msg = "Permission denied: This model requires a paid API key from a Google Cloud Project with billing enabled.";
            // Attempt to re-prompt for key
            const win = window as any;
            if (win.aistudio) {
                await win.aistudio.openSelectKey();
            }
        }
        
        setError(msg);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col pb-20">
       <div className="mb-8 border-b-2 border-ink pb-6 flex justify-between items-end">
          <div>
            <h2 className="font-serif text-5xl text-ink mb-2 italic">Picture <span className="not-italic font-hand text-purple-900">Studio</span></h2>
            <p className="text-sm font-hand text-pencil mt-2">Powered by Nana Banana Pro (Gemini 3 Pro Image)</p>
          </div>
          <button 
             onClick={openApiKeySelector}
             className="text-xs font-sans font-bold uppercase tracking-widest text-gray-500 hover:text-ink underline decoration-dotted"
          >
             Configure API Key
          </button>
       </div>

       <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
           {/* Left Control Panel */}
           <div className="flex flex-col gap-6">
               
               {/* Upload Section */}
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="cursor-pointer border-4 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-white hover:bg-gray-50 transition-colors hover:border-ink group min-h-[300px] relative overflow-hidden"
               >
                  {originalImage ? (
                      <img src={originalImage} alt="Original" className="w-full h-full object-contain absolute inset-0 p-4" />
                  ) : (
                      <div className="text-center">
                          <svg className="w-16 h-16 mx-auto text-gray-300 group-hover:text-ink mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="font-hand text-xl text-gray-400 group-hover:text-ink">Click to load a picture</p>
                      </div>
                  )}
                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     className="hidden" 
                     accept="image/*"
                  />
                  {originalImage && (
                      <div className="absolute top-2 right-2 bg-white/80 backdrop-blur px-3 py-1 text-xs font-bold uppercase tracking-wider border border-gray-200">Original</div>
                  )}
               </div>

               {/* Prompt Section */}
               <div className="bg-white p-6 border-2 border-ink shadow-sketch relative">
                  <div className="absolute -top-3 left-6 bg-purple-100 px-3 border border-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider">AI Instructions</div>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 resize-none outline-none font-hand text-xl leading-relaxed bg-transparent"
                    placeholder="Describe how to edit the image..."
                  />
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200">
                      <span className="text-xs text-gray-400 uppercase tracking-widest">Gemini 3 Pro</span>
                      <button 
                        onClick={handleGenerate}
                        disabled={!originalImage || loading}
                        className="bg-purple-900 text-white px-6 py-2 font-bold font-sans uppercase tracking-wider hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:translate-y-1"
                      >
                          {loading ? 'Processing...' : 'Enhance'}
                      </button>
                  </div>
               </div>
               
               {error && (
                   <div className="p-4 bg-red-50 border border-red-200 text-red-600 font-hand text-lg">
                       <p className="font-bold">Error Occurred:</p>
                       <p>{error}</p>
                       {error.includes("Permission denied") && (
                           <button onClick={openApiKeySelector} className="mt-2 text-sm underline font-bold">
                               Select Paid API Key
                           </button>
                       )}
                   </div>
               )}
           </div>

           {/* Right Result Panel */}
           <div className="relative border-4 border-ink bg-white shadow-sketch p-4 flex flex-col">
               <div className="flex-1 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 relative overflow-hidden">
                   {generatedImage ? (
                       <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
                   ) : (
                       <div className="text-center opacity-40">
                           <div className="w-20 h-20 border-4 border-gray-300 rounded-full mx-auto mb-4 border-t-purple-900 animate-spin" style={{ animationDuration: '3s' }}></div>
                           <p className="font-hand text-2xl">Result will appear here</p>
                       </div>
                   )}
                   
                   {generatedImage && (
                       <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                           <button 
                             onClick={() => onAddToResume(generatedImage!)}
                             className="bg-green-600 text-white px-8 py-3 font-bold font-serif text-xl italic hover:bg-green-700 shadow-lg hover:scale-105 transition-all flex items-center gap-2 border-2 border-green-800"
                           >
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                               Add to CV
                           </button>
                       </div>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
};