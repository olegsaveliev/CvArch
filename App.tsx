import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { JobsBoard } from './components/JobsBoard';
import { PictureEditor } from './components/PictureEditor';
import { Login } from './components/Login';
import { AppStatus, ApplicationStats, Job, ResumeData } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const handleRoleUpdate = (role: string) => {
    setUser(prev => (prev ? { ...prev, role } : prev));
  };
  
  // Stats State
  const [stats, setStats] = useState<ApplicationStats[]>([
    { status: AppStatus.APPLIED, count: 12, color: '#1a1a1a' },
    { status: AppStatus.REJECTED, count: 5, color: '#9ca3af' }, // Gray-400
    { status: AppStatus.APPROVED, count: 2, color: '#4a4a4a' }, // Sketch Gray
  ]);

  // Resume State
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: 'Alexander Kovalenko',
    title: 'Senior Frontend Engineer',
    summary: 'Dedicated and efficient full stack developer with 6+ years experience in application layers, presentation layers, and databases. Certified Scrum Master.',
    skills: 'React, TypeScript, Node.js, Tailwind CSS, PostgreSQL, AWS, Docker',
    experience: [
      { id: '1', title: 'Senior Developer at TechSoft UA', content: 'Led a team of 5 developers. Improved load times by 40%.' },
      { id: '2', title: 'Frontend Dev at StartUp Inc', content: 'Built the MVP from scratch using React Native.' }
    ]
  });

  const handleApply = (job: Job) => {
    // If job has a link, open it
    if (job.link) {
        window.open(job.link, '_blank');
        // Optimistic stat update
        const newStats = stats.map(s => {
            if (s.status === AppStatus.APPLIED) {
              return { ...s, count: s.count + 1 };
            }
            return s;
          });
          setStats(newStats);
        return;
    }

    // Fallback for internal jobs (if any)
    const newStats = stats.map(s => {
      if (s.status === AppStatus.APPLIED) {
        return { ...s, count: s.count + 1 };
      }
      return s;
    });
    setStats(newStats);
    alert(`Application submitted to ${job.company} for ${job.title}!`);
  };

  const handleAddToResume = (imgData: string) => {
    setResumeData(prev => ({ ...prev, profilePicture: imgData }));
    setActiveTab('resume');
  };

  const renderContent = () => {
    if (!user) {
      return <Login onLogin={setUser} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'resume':
        return <ResumeBuilder resumeData={resumeData} setResumeData={setResumeData} />;
      case 'picture-edit':
        return <PictureEditor onAddToResume={handleAddToResume} />;
      case 'jobs':
        return <JobsBoard onApply={handleApply} />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f9f9f7] text-[#1a1a1a]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={user?.name || 'Guest'}
        userRole={user?.role || 'Role not set'}
        onRoleUpdate={handleRoleUpdate}
      />
      <main className="flex-1 h-screen overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;