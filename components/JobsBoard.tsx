import React, { useState } from 'react';
import { Job } from '../types';

interface JobsBoardProps {
  onApply: (job: Job) => void;
}

export const JobsBoard: React.FC<JobsBoardProps> = ({ onApply }) => {
  const [filter, setFilter] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugLog, setDebugLog] = useState<string[]>([]);

  // Helper to handle mixed JSON/SSE responses from MCP
  const parseResponse = async (response: Response, context: string) => {
      const text = await response.text();
      
      // 1. Try standard JSON
      try {
          return JSON.parse(text);
      } catch (e) {
          // 2. Try SSE (Server-Sent Events) extraction
          // The server sends "data: {...json...}"
          const lines = text.split('\n');
          for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data:')) {
                  try {
                      const jsonStr = trimmed.substring(5).trim();
                      const payload = JSON.parse(jsonStr);
                      // Check for JSON-RPC properties
                      if (payload.result || payload.error || payload.id) {
                          return payload;
                      }
                  } catch (inner) {
                      // Continue searching other lines
                  }
              }
          }
          
          console.error(`[${context}] Parse Error. Raw text:`, text);
          throw new Error(`Received invalid response format. Raw: ${text.substring(0, 50)}...`);
      }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    setDebugLog([]);
    
    // N8N MCP Configuration
    const mcpUrl = "https://osavelyev.app.n8n.cloud/mcp-server/http";
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMzFmMThhYS1mM2U2LTQ0MzYtYjAxYi1kYTZkMzNkM2I3ZWIiLCJpc3MiOiJuOG4iLCJhdWQiOiJtY3Atc2VydmVyLWFwaSIsImp0aSI6IjA3NGM0ZWM3LTIzMmQtNGQ4ZC04ZTQxLTc5OGY5ODJhYTBhYiIsImlhdCI6MTc2NTQ1NjUyOH0.M_Hb9uedFBvDnv8C3wm3I2PiBnPPXml18Wp96Uc7N-U";
    
    // Use CORS Proxy to bypass browser restrictions
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(mcpUrl)}`;

    try {
        setDebugLog(prev => [...prev, "Connecting to MCP Server..."]);
        
        // STEP 1: List available tools
        // The server requires accepting event-stream even for list
        const listResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream', 
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/list",
                id: 1
            })
        });

        if (!listResponse.ok) {
            const errText = await listResponse.text().catch(() => '');
            throw new Error(`MCP Connection Failed (${listResponse.status}): ${errText}`);
        }

        const listData = await parseResponse(listResponse, "List Tools");
        
        if (listData.error) {
            throw new Error(`MCP Error: ${listData.error.message}`);
        }

        const tools = listData.result?.tools || [];
        if (tools.length === 0) {
            throw new Error("Connected to server, but no tools/workflows were found.");
        }

        // Find the specific tool for DOU scraping
        const targetToolName = "This workflow scraps DOU page for Project management jobs in Ukraine";
        let targetTool = tools.find((t: any) => t.name === targetToolName);
        
        if (!targetTool) {
            setDebugLog(prev => [...prev, `Specific tool not found, looking for partial match...`]);
            targetTool = tools.find((t: any) => t.name.includes("DOU") || t.name.includes("scraps"));
        }
        
        // Fallback to first tool if still not found
        if (!targetTool) {
             setDebugLog(prev => [...prev, `No matching tool found, defaulting to first available tool.`]);
             targetTool = tools[0];
        }

        setDebugLog(prev => [...prev, `Found Tool: "${targetTool.name}"`]);
        setDebugLog(prev => [...prev, "Triggering Workflow..."]);

        // STEP 2: Call the tool
        // N8N often streams the execution result, so we accept text/event-stream
        const callResponse = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/event-stream',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                id: 2,
                params: {
                    name: targetTool.name,
                    arguments: {}
                }
            })
        });

        if (!callResponse.ok) {
             const errText = await callResponse.text().catch(() => '');
             throw new Error(`Tool Execution Failed (${callResponse.status}): ${errText}`);
        }

        const callData = await parseResponse(callResponse, "Call Tool");
        
        if (callData.error) {
             throw new Error(`Tool Error: ${callData.error.message}`);
        }

        // STEP 3: Parse the content
        const contentItems = callData.result?.content || [];
        // Concatenate all text content pieces
        const rawText = contentItems.map((c: any) => c.text).join('');
        
        setDebugLog(prev => [...prev, "Parsing results..."]);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
             setDebugLog(prev => [...prev, "Complex response format, attempting cleanup..."]);
             // Sometimes the tool returns text surrounding the JSON
             try {
                 const match = rawText.match(/\[.*\]/s);
                 if (match) {
                     data = JSON.parse(match[0]);
                 } else {
                     throw new Error("Could not find JSON array in response");
                 }
             } catch (e) {
                 console.error("Parse error", e);
                 // As a last resort, assume the whole text isn't JSON and we got nothing
                 data = []; 
             }
        }

        // Normalize the data structure (it might be wrapped in { result: ... } or { data: ... })
        let items: any[] = [];
        
        if (Array.isArray(data)) {
            items = data;
        } else if (data && typeof data === 'object') {
             if (Array.isArray(data.data)) items = data.data;
             else if (Array.isArray(data.items)) items = data.items;
             else if (Array.isArray(data.result)) items = data.result;
             else if (Array.isArray(data.jobs)) items = data.jobs;
             else if (data.title || data.company) items = [data]; // Single item
        }

        if (items.length === 0) {
             setDebugLog(prev => [...prev, "Workflow executed but returned 0 items."]);
             console.log("Debug Raw Data:", data);
        }

        // Map to internal Job type
        const parsedJobs: Job[] = items.map((item: any, index: number) => {
            // Field mapping based on likely scraper output
            const titleRaw = item.title || item.position || item.name || 'Untitled Role';
            const link = item.link || item.url || item.href || '';
            const rawDesc = item.description || item.summary || item.details || item.snippet || 'No description provided.';
            
            let title = titleRaw;
            let company = item.company || 'Unknown Company';

            // Heuristic: If company isn't separate, it might be "Role at Company"
            if (company === 'Unknown Company') {
                const parts = titleRaw.split(/ at | @ | in /i);
                if (parts.length > 1) {
                    title = parts[0].trim();
                    company = parts[parts.length - 1].trim();
                }
            }

            // Simple HTML strip for description
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = rawDesc;
            const plainDesc = tempDiv.textContent || '';
            const shortDesc = plainDesc.length > 150 ? plainDesc.substring(0, 150) + '...' : plainDesc;

            // Determine type (Remote/Office)
            let type = item.type || 'Office';
            const lowerContent = (title + plainDesc + (item.location || '')).toLowerCase();
            
            if (lowerContent.includes('remote') || lowerContent.includes('віддалено')) type = 'Remote';
            else if (lowerContent.includes('hybrid')) type = 'Hybrid';
            
            // Normalize Location
            let location = item.location || 'Ukraine';
            if (lowerContent.includes('kyiv')) location = 'Kyiv';
            else if (lowerContent.includes('lviv')) location = 'Lviv';

            return {
                id: link || `job-${index}-${Date.now()}`,
                title,
                company,
                location,
                salary: item.salary || 'Open',
                type,
                tags: Array.isArray(item.tags) ? item.tags : [],
                description: shortDesc,
                link,
                pubDate: new Date()
            };
        });

        // Filter out empty/invalid entries
        const validJobs = parsedJobs.filter(j => j.title !== 'Untitled Role' || j.link);

        if (validJobs.length > 0) {
            setJobs(validJobs);
            setDebugLog(prev => [...prev, `Success! Loaded ${validJobs.length} jobs.`]);
        } else {
            setDebugLog(prev => [...prev, "No valid job entries found in parsed data."]);
        }

    } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to fetch jobs");
        setDebugLog(prev => [...prev, `Error: ${err.message}`]);
    } finally {
        setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(filter.toLowerCase()) || 
    job.company.toLowerCase().includes(filter.toLowerCase())
  );

  const getStickyColor = (index: number) => {
      const colors = ['bg-[#fef9c3]', 'bg-[#dbeafe]', 'bg-[#fee2e2]', 'bg-[#dcfce7]', 'bg-[#f3e8ff]']; 
      return colors[index % colors.length];
  }
  
  const getRotation = (index: number) => {
      const rots = ['rotate-1', '-rotate-2', 'rotate-2', '-rotate-1', 'rotate-0'];
      return rots[index % rots.length];
  }

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-ink pb-6">
        <div>
          <h2 className="font-serif text-5xl text-ink mb-2 italic">Ukraine PM <br/><span className="font-hand not-italic text-4xl text-gray-600">Sticky Board</span></h2>
          <p className="text-sm font-hand text-pencil mt-2">DOU Scraper • Project Management</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative w-full md:w-64">
                <input 
                    type="text" 
                    placeholder="Filter notes..." 
                    className="w-full pl-0 pr-8 py-2 bg-transparent border-b-2 border-gray-400 focus:border-ink outline-none text-xl font-hand text-ink transition-colors placeholder-gray-400"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                <svg className="w-5 h-5 text-ink absolute right-0 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* FETCH BUTTON */}
            <button 
                onClick={fetchJobs}
                disabled={loading}
                className={`
                    group relative px-6 py-2 font-serif font-bold text-lg tracking-widest uppercase transition-all duration-200
                    border-4 border-ink text-ink hover:bg-ink hover:text-white disabled:opacity-50 disabled:cursor-not-allowed
                    shadow-[4px_4px_0px_0px_rgba(26,26,26,0.3)] hover:shadow-[2px_2px_0px_0px_rgba(26,26,26,0.3)] hover:translate-x-[2px] hover:translate-y-[2px]
                    active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
                `}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                         <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Scraping DOU...
                    </span>
                ) : (
                    "SCRAPE DOU JOBS"
                )}
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
          
          {/* Debug/Loading Info */}
          {loading && (
             <div className="flex flex-col items-center justify-center py-10">
                 <div className="w-full max-w-md text-xs font-mono bg-gray-50 p-2 border border-gray-200 text-gray-500 rounded shadow-sm">
                    {debugLog.map((log, i) => <div key={i}>{log}</div>)}
                 </div>
             </div>
          )}

          {/* Error State */}
          {error && (
             <div className="flex flex-col items-center justify-center py-10">
                <div className="text-center bg-red-50 border-2 border-red-100 p-6 rounded-lg max-w-lg transform rotate-1 shadow-sketch">
                    <p className="font-hand text-2xl text-red-500 mb-2 font-bold">Connection Failed</p>
                    <p className="font-sans text-gray-600 mb-4">{error}</p>
                    <div className="text-xs font-mono text-left bg-white p-2 border border-gray-200 max-h-32 overflow-y-auto mb-4">
                        {debugLog.map((log, i) => <div key={i}>&gt; {log}</div>)}
                    </div>
                    <button onClick={fetchJobs} className="underline text-red-500 font-bold hover:text-red-700">Try Again</button>
                </div>
             </div>
          )}

          {/* Data State */}
          {!loading && jobs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 p-4">
              {filteredJobs.map((job, idx) => (
                <div 
                    key={job.id} 
                    className={`group p-6 transition-transform duration-300 relative flex flex-col justify-between h-[340px] shadow-lg hover:z-20 hover:scale-105 hover:shadow-2xl ${getStickyColor(idx)} ${getRotation(idx)}`}
                >
                  {/* Tape Effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-white/40 rotate-1 backdrop-blur-sm shadow-sm border border-white/40"></div>

                  <div className="font-hand text-ink flex-1 overflow-hidden mt-2">
                    <div className="flex justify-between items-start mb-2 opacity-60 border-b border-black/5 pb-1">
                        <span className="text-sm font-bold uppercase tracking-wider">{job.type}</span>
                        <span className="text-sm">{job.pubDate?.toLocaleDateString()}</span>
                    </div>
                    
                    <h3 className="text-2xl font-bold leading-none mb-1 line-clamp-2 mt-2">
                       <a href={job.link} target="_blank" rel="noreferrer" className="hover:underline decoration-2 underline-offset-2">{job.title}</a>
                    </h3>
                    <p className="text-lg font-bold text-gray-600 mb-4">{job.company}</p>
                    
                    <p className="text-lg leading-snug line-clamp-4 text-gray-800 opacity-90">
                        {job.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-dashed border-black/10 flex items-center justify-between font-hand">
                     <span className="text-base text-gray-600 truncate max-w-[50%]">{job.location}</span>
                     <button 
                      onClick={() => onApply(job)}
                      className="px-5 py-1 border-2 border-ink rounded-full bg-white hover:bg-ink hover:text-white transition-colors text-lg font-bold shadow-sm"
                     >
                       Details
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Empty State (Initial) */}
          {!loading && !error && jobs.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                 <div className="w-32 h-32 border-4 border-dashed border-gray-300 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 </div>
                 <h3 className="font-hand text-3xl text-gray-400 mb-2">Ready to scrape.</h3>
                 <p className="font-sans text-gray-400">Hit "Scrape DOU Jobs" to trigger N8N Workflow.</p>
             </div>
          )}
      </div>
    </div>
  );
};