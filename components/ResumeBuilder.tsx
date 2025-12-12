import React, { useState } from 'react';
import { ResumeData } from '../types';
import { reviewResume, ResumeSuggestions } from '../services/geminiService';

interface ResumeBuilderProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
}

type SectionType = 'skills' | 'summary' | 'experience' | 'education' | 'certifications';

type FontOption = 'Arial' | 'Times New Roman' | 'Calibri' | 'Georgia' | 'Roboto';

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resumeData, setResumeData }) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const [suggestions, setSuggestions] = useState<ResumeSuggestions | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedFont, setSelectedFont] = useState<FontOption>('Arial');
  const [sectionOrder, setSectionOrder] = useState<SectionType[]>(['skills', 'summary', 'experience', 'education', 'certifications']);
  const [draggedSection, setDraggedSection] = useState<SectionType | null>(null);

  const handleChange = (field: keyof ResumeData, value: string) => {
    setResumeData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddExperience = () => {
    const newExperience = {
      id: `exp-${Date.now()}`,
      title: '',
      content: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      description: '',
      bulletPoints: []
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const handleDeleteExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const handleAddEducation = () => {
    const newEducation = {
      id: `edu-${Date.now()}`,
      institution: '',
      degree: '',
      startDate: '',
      endDate: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...(prev.education || []), newEducation]
    }));
  };

  const handleDeleteEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: (prev.education || []).filter(edu => edu.id !== id)
    }));
  };

  const handleAddCertification = () => {
    const newCertification = {
      id: `cert-${Date.now()}`,
      name: '',
      dateReceived: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...(prev.certifications || []), newCertification]
    }));
  };

  const handleDeleteCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter(cert => cert.id !== id)
    }));
  };

  const handleDragStart = (e: React.DragEvent, section: SectionType) => {
    setDraggedSection(section);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSection: SectionType) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSection) return;

    const newOrder = [...sectionOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);
    const targetIndex = newOrder.indexOf(targetSection);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSection);

    setSectionOrder(newOrder);
    setDraggedSection(null);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('resume-preview');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore - html2pdf is loaded via CDN
    if (window.html2pdf) {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save();
    } else {
      // Fallback to print
      window.print();
    }
  };

  const handleReviewResume = async () => {
    setIsReviewing(true);
    setShowReviewModal(true);
    setSuggestions(null);
    try {
      const review = await reviewResume(resumeData);
      setSuggestions(review);
    } catch (error) {
      console.error("Failed to generate review:", error);
      setSuggestions({ reviewText: "Error generating review. Please try again." });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleApplySuggestions = () => {
    if (!suggestions) return;

    const updatedData = { ...resumeData };

    if (suggestions.improvedSummary) {
      updatedData.summary = suggestions.improvedSummary;
    }

    if (suggestions.improvedSkills) {
      updatedData.skills = suggestions.improvedSkills;
    }

    if (suggestions.improvedExperience && suggestions.improvedExperience.length > 0) {
      // Map improved experience to existing experience by ID
      const updatedExperience = resumeData.experience.map(exp => {
        const improved = suggestions.improvedExperience?.find(imp => imp.id === exp.id);
        return improved ? { ...exp, title: improved.title, content: improved.content } : exp;
      });
      updatedData.experience = updatedExperience;
    }

    setResumeData(updatedData);
    setShowReviewModal(false);
  };

  const getFontFamily = (font: FontOption): string => {
    const fontMap: Record<FontOption, string> = {
      'Arial': 'Arial, sans-serif',
      'Times New Roman': '"Times New Roman", serif',
      'Calibri': 'Calibri, sans-serif',
      'Georgia': 'Georgia, serif',
      'Roboto': '"Roboto", sans-serif'
    };
    return fontMap[font];
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#fef9c3] relative">
      {/* Notepad Binding Effect - Spiral Holes */}
      <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 z-30 pointer-events-none bg-[#fef9c3]">
        <div className="h-full w-full relative">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: `${(i * 5.26) + 1}%`,
                left: '0px',
              }}
            >
              {/* Light gray line extending left with gradient */}
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-[1.5px]"
                style={{
                  background: 'linear-gradient(to left, rgba(209, 213, 219, 0.8), rgba(209, 213, 219, 0.3))'
                }}
              ></div>
              {/* Black horizontally elongated oval (wider than tall) */}
              <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-black rounded-full"
                style={{
                  width: '18px',
                  height: '10px',
                  filter: 'blur(0.5px)',
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor Panel - "The Sketchbook" */}
      <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-[#fef9c3] transition-all duration-500 relative" style={{ paddingLeft: 'calc(2rem + 48px)' }}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-hand text-3xl font-bold text-ink flex items-center gap-2">
            <span className="text-2xl">✏️</span> Draft Details
          </h2>
            <button 
            onClick={handleReviewResume}
            disabled={isReviewing}
            className="px-4 py-2 text-sm font-hand font-bold border-2 border-purple-900 text-purple-900 hover:bg-purple-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center gap-2"
          >
            {isReviewing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Reviewing...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Review CV</span>
              </>
            )}
            </button>
        </div>

        <div className="space-y-8 font-hand text-lg">
          <div className="relative group">
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Full Name</label>
            <input 
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-2xl text-ink focus:border-ink outline-none transition-colors placeholder-gray-300"
              placeholder="Your Name"
              value={resumeData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
            />
            <div className="absolute bottom-0 left-0 h-0.5 bg-ink w-0 group-focus-within:w-full transition-all duration-300"></div>
          </div>
          
          <div className="relative group">
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Title</label>
            <input 
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-xl text-ink focus:border-ink outline-none transition-colors"
              placeholder="e.g. Architect"
              value={resumeData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
             <div className="absolute bottom-0 left-0 h-0.5 bg-ink w-0 group-focus-within:w-full transition-all duration-300"></div>
          </div>

          <div className="pt-4 border-t border-dashed border-gray-200">
            <label className="block text-sm font-sans text-gray-400 mb-3 uppercase tracking-wider">Contact Information</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <label className="block text-xs font-sans text-gray-400 mb-1">Phone</label>
                <input 
                  className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-sm text-ink focus:border-ink outline-none transition-colors"
                  placeholder="+1234567890"
                  value={resumeData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="relative group">
                <label className="block text-xs font-sans text-gray-400 mb-1">Email</label>
                <input 
                  className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-sm text-ink focus:border-ink outline-none transition-colors"
                  placeholder="your.email@example.com"
                  value={resumeData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="relative group">
                <label className="block text-xs font-sans text-gray-400 mb-1">LinkedIn</label>
                <input 
                  className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-sm text-ink focus:border-ink outline-none transition-colors"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={resumeData.linkedin || ''}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                />
              </div>
              <div className="relative group">
                <label className="block text-xs font-sans text-gray-400 mb-1">Location</label>
                <input 
                  className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-sm text-ink focus:border-ink outline-none transition-colors"
                  placeholder="City, Country"
                  value={resumeData.location || ''}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Skills</label>
            <input 
              className="w-full bg-transparent border-b-2 border-gray-300 py-2 text-ink focus:border-ink outline-none transition-colors"
              placeholder="List your tools..."
              value={resumeData.skills}
              onChange={(e) => handleChange('skills', e.target.value)}
            />
             <div className="absolute bottom-0 left-0 h-0.5 bg-ink w-0 group-focus-within:w-full transition-all duration-300"></div>
          </div>

          <div>
            <label className="block text-sm font-sans text-gray-400 mb-1 uppercase tracking-wider">Summary</label>
            <div className="relative">
              {/* Ruled paper background effect */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 32px)' }}></div>
              <textarea 
                className="w-full bg-transparent py-1 leading-8 text-ink focus:outline-none min-h-[160px] resize-none -mt-1"
                style={{ lineHeight: '32px' }}
                value={resumeData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
              />
            </div>
          </div>
          
          <div className="pt-8 border-t-2 border-dashed border-gray-300">
             <label className="block text-sm font-sans text-gray-400 mb-6 uppercase tracking-wider">Experience</label>
             {resumeData.experience.map((exp, idx) => (
               <div key={exp.id} className="mb-8 pl-4 border-l-4 border-gray-200 hover:border-ink transition-colors group relative pb-4">
                 {/* Delete Button */}
                 <button
                   onClick={() => handleDeleteExperience(exp.id)}
                   className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                   title="Delete experience"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
                 
                 <div className="space-y-3 pr-10">
                   <div className="grid grid-cols-2 gap-2">
                 <input 
                       className="w-full bg-transparent text-lg font-bold text-ink outline-none border-b border-transparent focus:border-gray-300"
                       placeholder="Job Title"
                       value={exp.title || ''}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                      newExp[idx].title = e.target.value;
                      setResumeData({...resumeData, experience: newExp});
                    }}
                 />
                     <input 
                       className="w-full bg-transparent text-sm text-ink outline-none border-b border-transparent focus:border-gray-300"
                       placeholder="Company Name"
                       value={exp.company || ''}
                       onChange={(e) => {
                         const newExp = [...resumeData.experience];
                         newExp[idx].company = e.target.value;
                         setResumeData({...resumeData, experience: newExp});
                       }}
                     />
                   </div>
                   
                   <div className="grid grid-cols-3 gap-2">
                     <input 
                       className="w-full bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                       placeholder="Start Date (MM/YYYY)"
                       value={exp.startDate || ''}
                       onChange={(e) => {
                         const newExp = [...resumeData.experience];
                         newExp[idx].startDate = e.target.value;
                         setResumeData({...resumeData, experience: newExp});
                       }}
                     />
                     <input 
                       className="w-full bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                       placeholder="End Date (MM/YYYY or Present)"
                       value={exp.endDate || ''}
                       onChange={(e) => {
                         const newExp = [...resumeData.experience];
                         newExp[idx].endDate = e.target.value;
                         setResumeData({...resumeData, experience: newExp});
                       }}
                     />
                     <input 
                       className="w-full bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                       placeholder="Location"
                       value={exp.location || ''}
                       onChange={(e) => {
                         const newExp = [...resumeData.experience];
                         newExp[idx].location = e.target.value;
                         setResumeData({...resumeData, experience: newExp});
                       }}
                     />
                   </div>
                   
                   <textarea 
                     className="w-full bg-transparent text-sm text-gray-600 outline-none resize-none h-16 leading-relaxed"
                     placeholder="Job description paragraph..."
                     value={exp.description || ''}
                     onChange={(e) => {
                       const newExp = [...resumeData.experience];
                       newExp[idx].description = e.target.value;
                       setResumeData({...resumeData, experience: newExp});
                     }}
                   />
                   
                   <div>
                     <label className="block text-xs font-sans text-gray-400 mb-1">Bullet Points (one per line)</label>
                 <textarea 
                       className="w-full bg-transparent text-xs text-gray-600 outline-none resize-none h-20 leading-relaxed"
                       placeholder="• First achievement&#10;• Second achievement&#10;• Third achievement"
                       value={(exp.bulletPoints || []).join('\n')}
                    onChange={(e) => {
                      const newExp = [...resumeData.experience];
                         newExp[idx].bulletPoints = e.target.value.split('\n').filter(b => b.trim());
                      setResumeData({...resumeData, experience: newExp});
                    }}
                 />
                   </div>
                 </div>
               </div>
             ))}
             <button
               onClick={handleAddExperience}
               className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-ink hover:bg-gray-50 transition-all rounded-lg flex items-center justify-center gap-2 font-hand text-lg text-gray-500 hover:text-ink group"
             >
               <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
               </svg>
               <span>Add Experience</span>
             </button>
          </div>

          {/* Education Section */}
          <div className="pt-8 border-t-2 border-dashed border-gray-300">
            <label className="block text-sm font-sans text-gray-400 mb-6 uppercase tracking-wider">Education</label>
            {(resumeData.education || []).map((edu, idx) => (
              <div key={edu.id} className="mb-8 pl-4 border-l-4 border-gray-200 hover:border-ink transition-colors group relative pb-4">
                <button
                  onClick={() => handleDeleteEducation(edu.id)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete education"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="space-y-3 pr-10">
                  <input 
                    className="w-full bg-transparent text-lg font-bold text-ink outline-none border-b border-transparent focus:border-gray-300"
                    placeholder="Institution Name"
                    value={edu.institution || ''}
                    onChange={(e) => {
                      const newEdu = [...(resumeData.education || [])];
                      newEdu[idx].institution = e.target.value;
                      setResumeData({...resumeData, education: newEdu});
                    }}
                  />
                  <input 
                    className="w-full bg-transparent text-sm text-ink outline-none border-b border-transparent focus:border-gray-300"
                    placeholder="Degree"
                    value={edu.degree || ''}
                    onChange={(e) => {
                      const newEdu = [...(resumeData.education || [])];
                      newEdu[idx].degree = e.target.value;
                      setResumeData({...resumeData, education: newEdu});
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      className="w-full bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                      placeholder="Start Date (MM/YYYY)"
                      value={edu.startDate || ''}
                      onChange={(e) => {
                        const newEdu = [...(resumeData.education || [])];
                        newEdu[idx].startDate = e.target.value;
                        setResumeData({...resumeData, education: newEdu});
                      }}
                    />
                    <input 
                      className="w-full bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                      placeholder="End Date (MM/YYYY or Present)"
                      value={edu.endDate || ''}
                      onChange={(e) => {
                        const newEdu = [...(resumeData.education || [])];
                        newEdu[idx].endDate = e.target.value;
                        setResumeData({...resumeData, education: newEdu});
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={handleAddEducation}
              className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-ink hover:bg-gray-50 transition-all rounded-lg flex items-center justify-center gap-2 font-hand text-lg text-gray-500 hover:text-ink group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Education</span>
            </button>
          </div>

          {/* Certifications Section */}
          <div className="pt-8 border-t-2 border-dashed border-gray-300">
            <label className="block text-sm font-sans text-gray-400 mb-6 uppercase tracking-wider">Certifications</label>
            {(resumeData.certifications || []).map((cert, idx) => (
              <div key={cert.id} className="mb-8 pl-4 border-l-4 border-gray-200 hover:border-ink transition-colors group relative pb-4">
                <button
                  onClick={() => handleDeleteCertification(cert.id)}
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                  title="Delete certification"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <div className="space-y-3 pr-10">
                  <input 
                    className="w-full bg-transparent text-lg font-bold text-ink outline-none border-b border-transparent focus:border-gray-300"
                    placeholder="Certification Name"
                    value={cert.name || ''}
                    onChange={(e) => {
                      const newCerts = [...(resumeData.certifications || [])];
                      newCerts[idx].name = e.target.value;
                      setResumeData({...resumeData, certifications: newCerts});
                    }}
                  />
                  <input 
                    className="w-full bg-transparent text-xs text-gray-500 outline-none border-b border-transparent focus:border-gray-300"
                    placeholder="Date Received (MM/YYYY)"
                    value={cert.dateReceived || ''}
                    onChange={(e) => {
                      const newCerts = [...(resumeData.certifications || [])];
                      newCerts[idx].dateReceived = e.target.value;
                      setResumeData({...resumeData, certifications: newCerts});
                    }}
                  />
                </div>
              </div>
            ))}
            <button
              onClick={handleAddCertification}
              className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-ink hover:bg-gray-50 transition-all rounded-lg flex items-center justify-center gap-2 font-hand text-lg text-gray-500 hover:text-ink group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Certification</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel - "The Final Print" - Always Visible */}
      <div 
        className="w-full md:w-1/2 relative transition-all duration-500 flex flex-col shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.1)] bg-[#fef9c3]"
        style={{ 
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Paper texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

        {/* Download PDF Button and Font Selector */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
          {/* Font Selector */}
          <div className="relative">
            <select
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value as FontOption)}
              className="px-3 py-2 bg-white border-2 border-ink text-ink font-hand font-bold text-sm hover:bg-gray-50 transition-all shadow-sm appearance-none cursor-pointer pr-8"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
              <option value="Georgia">Georgia</option>
              <option value="Roboto">Roboto</option>
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
             </div>

                <button 
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-ink text-white font-hand font-bold text-sm hover:bg-gray-800 transition-all shadow-sketch active:shadow-none active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
                </button>
             </div>

        <div 
          className="p-16 h-full overflow-y-auto relative z-10" 
          id="resume-preview"
          style={{ 
            backgroundColor: '#f8f9fa',
            color: '#1e293b',
            fontFamily: getFontFamily(selectedFont)
          }}
        >
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 
                  className="text-5xl font-bold mb-2 uppercase tracking-tight"
                  style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}
                >
                  {resumeData.fullName.toUpperCase()}
                </h1>
                <p 
                  className="text-xl uppercase tracking-wide font-bold mb-3"
                  style={{ color: '#2563eb', fontFamily: getFontFamily(selectedFont) }}
                >
                  {resumeData.title.toUpperCase()}
                </p>
                {(resumeData.phone || resumeData.email || resumeData.linkedin || resumeData.location) && (
                  <div className="flex flex-wrap gap-4 text-sm" style={{ color: '#2563eb', fontFamily: getFontFamily(selectedFont) }}>
                    {resumeData.phone && <span>Phone: {resumeData.phone}</span>}
                    {resumeData.email && <span>Email: {resumeData.email}</span>}
                    {resumeData.linkedin && <span>LinkedIn: {resumeData.linkedin}</span>}
                    {resumeData.location && <span>{resumeData.location}</span>}
                  </div>
                )}
              </div>
              <div 
                className="w-32 h-24 flex items-center justify-center overflow-hidden flex-shrink-0 ml-4"
                style={{ border: '2px solid #475569' }}
              >
                 {resumeData.profilePicture ? (
                     <img src={resumeData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                  <span className="italic text-3xl font-bold" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                    {resumeData.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                 )}
              </div>
            </div>
          </div>

          {/* Draggable Sections */}
          <div className="space-y-8">
            {sectionOrder.map((sectionType, index) => {
              const isDragging = draggedSection === sectionType;
              
              return (
                <div
                  key={sectionType}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sectionType)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sectionType)}
                  className={`relative group cursor-move transition-all ${isDragging ? 'opacity-50' : 'hover:shadow-lg'} mb-8 p-6 rounded-lg border-2 border-dashed border-transparent hover:border-gray-300`}
                  style={{
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  {/* Drag Handle */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>

                  {/* Skills Section */}
                  {sectionType === 'skills' && (
                    <div>
                      <h4 
                        className="text-xl mb-4 pb-2 italic"
                        style={{ 
                      borderBottom: '1px solid #475569',
                      color: '#1e293b',
                      fontFamily: getFontFamily(selectedFont)
                        }}
                      >
                        Skills & Tools
                      </h4>
                    <div className="flex flex-col gap-2">
                      {resumeData.skills.split(',').map((skill, i) => (
                          <span 
                            key={i} 
                            className="text-sm"
                            style={{ color: '#1e293b', opacity: 0.7, fontFamily: getFontFamily(selectedFont) }}
                          >
                            • {skill.trim()}
                          </span>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Summary Section */}
                  {sectionType === 'summary' && (
                    <div>
                      <h4 
                        className="text-2xl mb-4 pb-2 font-bold uppercase"
                        style={{ 
                      borderBottom: '2px solid #1e293b',
                      color: '#1e293b',
                      fontFamily: getFontFamily(selectedFont)
                        }}
                      >
                        SUMMARY
                      </h4>
                      <p 
                        className="text-base leading-relaxed"
                        style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}
                      >
                      {resumeData.summary}
                    </p>
                  </div>
                  )}

                  {/* Experience Section */}
                  {sectionType === 'experience' && (
                  <div>
                      <h4 
                        className="text-2xl mb-6 pb-2 font-bold uppercase"
                        style={{ 
                      borderBottom: '2px solid #1e293b',
                      color: '#1e293b',
                      fontFamily: getFontFamily(selectedFont)
                        }}
                      >
                        EXPERIENCE
                      </h4>
                    {resumeData.experience.map(exp => (
                        <div key={exp.id} className="mb-8">
                          {/* Dates and Location */}
                          <div className="mb-2">
                            <span className="font-bold text-sm" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                              {exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : exp.startDate || exp.endDate || ''}
                            </span>
                            {exp.location && (
                              <span className="text-sm ml-2" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                                {exp.location}
                              </span>
                            )}
                          </div>
                          
                          {/* Role and Company */}
                          <div className="mb-2">
                            <span className="font-bold text-base" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                              {exp.title}
                            </span>
                            {exp.company && (
                              <span className="text-base ml-2 font-bold uppercase" style={{ color: '#2563eb', fontFamily: getFontFamily(selectedFont) }}>
                                {exp.company}
                              </span>
                            )}
                          </div>
                          
                          {/* Description */}
                          {exp.description && (
                            <p 
                              className="text-sm mb-3 leading-relaxed"
                              style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}
                            >
                              {exp.description}
                            </p>
                          )}
                          
                          {/* Bullet Points */}
                          {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                            <ul className="list-none pl-0 space-y-1">
                              {exp.bulletPoints.map((bullet, idx) => (
                                <li 
                                  key={idx}
                                  className="text-sm leading-relaxed"
                                  style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}
                                >
                                  {bullet.trim() && `• ${bullet.trim()}`}
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          {/* Fallback to content if no description/bullets */}
                          {!exp.description && (!exp.bulletPoints || exp.bulletPoints.length === 0) && exp.content && (
                            <p 
                              className="text-sm leading-relaxed"
                              style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}
                            >
                          {exp.content}
                        </p>
                          )}
                      </div>
                    ))}
                    </div>
                  )}

                  {/* Education Section */}
                  {sectionType === 'education' && (
                    <div>
                      <h4 
                        className="text-2xl mb-6 pb-2 font-bold uppercase"
                        style={{ 
                      borderBottom: '2px solid #1e293b',
                      color: '#1e293b',
                      fontFamily: getFontFamily(selectedFont)
                        }}
                      >
                        EDUCATION
                      </h4>
                      {(resumeData.education || []).map(edu => (
                        <div key={edu.id} className="mb-6">
                          <div className="mb-2">
                            <span className="font-bold text-base" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                              {edu.institution}
                            </span>
                            {edu.degree && (
                              <span className="text-base ml-2" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                                - {edu.degree}
                              </span>
                            )}
                          </div>
                          {(edu.startDate || edu.endDate) && (
                            <div className="text-sm" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                              {edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : edu.startDate || edu.endDate || ''}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications Section */}
                  {sectionType === 'certifications' && (
                    <div>
                      <h4 
                        className="text-2xl mb-6 pb-2 font-bold uppercase"
                        style={{ 
                      borderBottom: '2px solid #1e293b',
                      color: '#1e293b',
                      fontFamily: getFontFamily(selectedFont)
                        }}
                      >
                        CERTIFICATIONS
                      </h4>
                      {(resumeData.certifications || []).map(cert => (
                        <div key={cert.id} className="mb-4">
                          <div className="mb-1">
                            <span className="font-bold text-base" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                              {cert.name}
                            </span>
                          </div>
                          {cert.dateReceived && (
                            <div className="text-sm" style={{ color: '#1e293b', fontFamily: getFontFamily(selectedFont) }}>
                              {cert.dateReceived}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border-2 border-ink">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-ink flex items-center justify-between">
              <div>
                <h3 className="font-serif text-3xl italic text-ink mb-1">CV Review</h3>
                <p className="font-hand text-gray-500 text-sm">Powered by Gemini 3 Pro</p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-ink transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isReviewing ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <svg className="animate-spin h-12 w-12 text-purple-900 mb-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-hand text-xl text-gray-600">Analyzing your CV...</p>
                </div>
              ) : suggestions?.reviewText ? (
                <div className="prose prose-sm max-w-none text-ink font-serif whitespace-pre-wrap leading-7">
                  {suggestions.reviewText}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <p className="font-hand text-xl">No review available</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t-2 border-ink flex justify-between items-center gap-4">
              <div className="text-sm text-gray-500 font-sans">
                {suggestions && (suggestions.improvedSummary || suggestions.improvedExperience || suggestions.improvedSkills) && (
                  <span className="text-green-600 font-bold">✓ Suggestions available to apply</span>
                )}
              </div>
              <div className="flex gap-4">
                {suggestions && (suggestions.improvedSummary || suggestions.improvedExperience || suggestions.improvedSkills) && (
                  <button
                    onClick={handleApplySuggestions}
                    className="px-6 py-2 bg-purple-900 text-white font-hand font-bold hover:bg-purple-800 transition-all shadow-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Apply Suggestions
                  </button>
                )}
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-2 border-2 border-ink text-ink font-hand font-bold hover:bg-ink hover:text-white transition-all shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};









