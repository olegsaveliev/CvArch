
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Remote' | 'Hybrid' | 'Office' | string;
  description: string;
  tags: string[];
  link?: string;
  pubDate?: Date;
}

export enum AppStatus {
  APPLIED = 'Applied',
  REJECTED = 'Rejected',
  APPROVED = 'Approved', // Interview/Offer
  INTERVIEWING = 'Interviewing'
}

export interface ApplicationStats {
  status: AppStatus;
  count: number;
  color: string;
}

export interface ResumeSection {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  fullName: string;
  title: string;
  summary: string;
  skills: string;
  experience: ResumeSection[];
  profilePicture?: string;
}
