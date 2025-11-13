export interface CvAnalysis {
  id: number;
  resume: string;
  experiences: Experience[];
  skills: Skill[];
  score?: number;
  matchingScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
}

export interface Experience {
  company: string;
  role: string;
  year: string;
  duration: string;
  competences: string[];
}

export interface Skill {
  id: number;
  name: string;
  level: string;
  type: string; // "hardSkills" ou "softSkills"
}
