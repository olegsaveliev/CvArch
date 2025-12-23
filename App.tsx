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
    fullName: 'John Smith',
    title: 'Program and Portfolio Manager',
    summary: 'Results-driven leader with extensive experience in business strategy, development approaches, and value-driven program execution.',
    skills: 'Program Management, Strategic Planning, Team Leadership, Process Optimization',
    phone: '+1-555-123-4567',
    email: 'john.smith@example.com',
    linkedin: 'https://www.linkedin.com/in/john-smith-test/',
    location: 'Kiev',
    experience: [
      { 
        id: '1', 
        title: 'Senior Software Engineer', 
        company: 'Tech Solutions Inc',
        location: 'San Francisco, CA',
        startDate: '01/2021',
        endDate: 'Present',
        description: 'Lead developer working on cloud-based applications and microservices architecture.',
        content: 'Full Stack Development & Architecture',
        bulletPoints: [
          'Developed and maintained scalable web applications using React and Node.js',
          'Led a team of 5 developers in agile development practices',
          'Improved application performance by 40% through optimization and refactoring'
        ]
      },
      { 
        id: '2', 
        title: 'Software Developer', 
        company: 'Digital Innovations LLC',
        location: 'New York, NY',
        startDate: '06/2018',
        endDate: '12/2020',
        description: 'Full-stack developer responsible for building and maintaining client-facing applications.',
        content: 'Web Application Development',
        bulletPoints: [
          'Built responsive web applications using modern JavaScript frameworks',
          'Collaborated with cross-functional teams to deliver high-quality software solutions',
          'Implemented automated testing and CI/CD pipelines'
        ]
      }
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'State University',
        degree: 'Bachelor of Science in Computer Science',
        startDate: '09/2014',
        endDate: '05/2018'
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