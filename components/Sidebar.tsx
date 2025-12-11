import React, { useState } from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userName: string;
  userRole: string;
  onRoleUpdate: (role: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, userName, userRole, onRoleUpdate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    )},
    { id: 'resume', label: 'Resume Draft', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
    )},
    { id: 'picture-edit', label: 'Picture Studio', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { id: 'jobs', label: 'Job Board', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    )},
  ];

  const [editingRole, setEditingRole] = useState<boolean>(!userRole || userRole === 'Role not set');
  const [roleDraft, setRoleDraft] = useState<string>(userRole || '');

  return (
    <aside className="w-full md:w-64 bg-paper border-r-2 border-ink flex-shrink-0 flex flex-col h-screen sticky top-0 shadow-[4px_0px_0px_0px_rgba(0,0,0,0.05)] z-20">
      <div className="p-6 border-b-2 border-dashed border-gray-300 flex flex-row items-center gap-4">
        <div className="relative w-12 h-24 flex-shrink-0 transform -rotate-6 hover:rotate-0 transition-transform duration-300 origin-bottom">
           {/* Custom SVG of the cute yellow pencil */}
           <svg viewBox="0 0 100 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
             {/* Eraser */}
             <path d="M10 20C10 14.4772 14.4772 10 20 10H80C85.5228 10 90 14.4772 90 20V50H10V20Z" fill="#FF85B3" stroke="#000" strokeWidth="4"/>
             <path d="M20 20H80" stroke="#000" strokeWidth="2" strokeLinecap="round" opacity="0.3"/>
             
             {/* Metal Band (Ferrule) */}
             <rect x="10" y="50" width="80" height="40" fill="#D1D5DB" stroke="#000" strokeWidth="4"/>
             <line x1="10" y1="60" x2="90" y2="60" stroke="#000" strokeWidth="2"/>
             <line x1="10" y1="70" x2="90" y2="70" stroke="#000" strokeWidth="2"/>
             <line x1="10" y1="80" x2="90" y2="80" stroke="#000" strokeWidth="2"/>
             
             {/* Body */}
             <rect x="10" y="90" width="80" height="110" fill="#FFE01B" stroke="#000" strokeWidth="4"/>
             <line x1="30" y1="90" x2="30" y2="200" stroke="#EAB308" strokeWidth="2"/>
             <line x1="70" y1="90" x2="70" y2="200" stroke="#EAB308" strokeWidth="2"/>
             
             {/* Face */}
             <circle cx="35" cy="130" r="4" fill="black"/>
             <circle cx="65" cy="130" r="4" fill="black"/>
             <path d="M25 145C25 145 35 165 50 165C65 165 75 145 75 145" stroke="black" strokeWidth="3" strokeLinecap="round"/>
             
             {/* Wood Tip */}
             <path d="M10 200L50 245L90 200H10Z" fill="#E8C39E" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
             
             {/* Lead Tip */}
             <path d="M36 229L50 245L64 229" fill="#1A1A1A"/>
           </svg>
        </div>
        <div>
          <h1 className="font-hand text-xl font-bold text-ink leading-tight">
            Your career <br/>
            <span className="text-pencil text-2xl">architect</span>
          </h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full group flex items-center space-x-3 px-4 py-3 text-lg font-hand transition-all duration-200 rounded-lg border-2 ${
              activeTab === item.id
                ? 'border-ink bg-white shadow-sketch transform -translate-y-1'
                : 'border-transparent text-gray-600 hover:text-ink hover:border-gray-300 hover:bg-white'
            }`}
          >
            <span className={`${activeTab === item.id ? 'text-ink' : 'text-gray-400 group-hover:text-ink'}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t-2 border-ink bg-white m-4 shadow-sketch border-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full border-2 border-ink bg-gray-100 flex items-center justify-center font-serif italic text-xl">
            {userName?.[0] || 'A'}
          </div>
          <div>
            <p className="text-base font-bold font-hand text-ink">{userName}</p>
            {editingRole ? (
              <div className="flex items-center gap-2">
                <input
                  value={roleDraft}
                  onChange={(e) => setRoleDraft(e.target.value)}
                  placeholder="Set your role"
                  className="text-xs font-sans text-gray-700 border border-gray-300 px-2 py-1 rounded-sm focus:outline-none focus:border-ink"
                />
                <button
                  onClick={() => {
                    const newRole = roleDraft.trim() || 'Role not set';
                    onRoleUpdate(newRole);
                    setEditingRole(false);
                  }}
                  className="text-xs font-bold text-ink underline"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingRole(true)}
                className="text-xs font-sans text-gray-500 uppercase tracking-widest hover:text-ink"
                title="Edit role"
              >
                {userRole}
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};