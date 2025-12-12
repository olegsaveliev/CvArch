import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ResumeBuilder } from './components/ResumeBuilder';
import { CoverLetter } from './components/CoverLetter';
import { JobsBoard } from './components/JobsBoard';
import { SavedJobs } from './components/SavedJobs';
import { PictureEditor } from './components/PictureEditor';
// import { Login } from './components/Login'; // Commented out for future use
import { AppStatus, ApplicationStats, Job, ResumeData } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Login functionality commented out for future use
  // const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  // const handleRoleUpdate = (role: string) => {
  //   setUser(prev => (prev ? { ...prev, role } : prev));
  // };
  
  // Stats State
  const [stats, setStats] = useState<ApplicationStats[]>([
    { status: AppStatus.APPLIED, count: 12, color: '#1a1a1a' },
    { status: AppStatus.REJECTED, count: 5, color: '#9ca3af' }, // Gray-400
    { status: AppStatus.APPROVED, count: 2, color: '#4a4a4a' }, // Sketch Gray
  ]);

  // Resume State
  const [resumeData, setResumeData] = useState<ResumeData>({
    fullName: 'Oleg Saveliev',
    title: 'Program and Portfolio Manager',
    summary: 'Results-driven leader with extensive experience in business strategy, development approaches, and value-driven program execution.',
    skills: 'Program Management, Strategic Planning, Team Leadership, Process Optimization',
    phone: '+380506415777',
    email: 'osavelyev@gmail.com',
    linkedin: 'https://www.linkedin.com/in/oleg-savelyev/',
    location: 'Kiev',
    experience: [
      { 
        id: '1', 
        title: 'Delivery Lead', 
        company: 'SQUAD',
        location: 'Kyiv, Ukraine',
        startDate: '03/2022',
        endDate: 'Present',
        description: 'Program Manager leading high-impact initiatives within Amazon\'s Ring division.',
        content: 'Program Portfolio & Technical Program Management (TPM) Leadership',
        bulletPoints: [
          'Program Portfolio & Technical Program Management (TPM) Leadership',
          'Strategic Forecasting aligned with company objectives',
          'Process Optimization & PMO Improvements for operational efficiency'
        ]
      },
      { 
        id: '2', 
        title: 'Technical Program Manager', 
        company: 'Ring Ukraine',
        location: 'Kyiv, Ukraine',
        startDate: '07/2019',
        endDate: '03/2022',
        description: 'Experienced Program Manager leading high-impact initiatives within Amazon\'s Ring division.',
        content: 'Managed complex, high-visibility projects',
        bulletPoints: [
          'Managed complex, high-visibility projects with competing priorities.',
          'Developed and executed detailed project plans, securing resources, driving schedules, and facilitating cross-team collaboration.',
          'Led stakeholder communication, ensuring transparency on project goals, timelines, and deliverables.'
        ]
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'National Technical University of Ukraine',
        degree: 'Master of Science in Computer Science',
        startDate: '09/2010',
        endDate: '06/2015'
      }
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'Certified Scrum Master (CSM)',
        dateReceived: '03/2020'
      },
      {
        id: 'cert-2',
        name: 'Project Management Professional (PMP)',
        dateReceived: '08/2021'
      }
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
    // Login check commented out for future use
    // if (!user) {
    //   return <Login onLogin={setUser} />;
    // }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'resume':
        return <ResumeBuilder resumeData={resumeData} setResumeData={setResumeData} />;
      case 'cover-letter':
        return <CoverLetter resumeData={resumeData} />;
      case 'picture-edit':
        return <PictureEditor onAddToResume={handleAddToResume} />;
      case 'jobs':
        return <JobsBoard onApply={handleApply} />;
      case 'saved-jobs':
        return <SavedJobs />;
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f9f9f7] text-[#1a1a1a]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={'Guest'} // Default value - login commented out for future use
        userRole={'Role not set'} // Default value - login commented out for future use
        onRoleUpdate={() => {}} // Placeholder - login commented out for future use
      />
      <main className="flex-1 h-screen overflow-y-auto relative">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;