export interface CvAnalysis {
  id?: number;
  resume: string;
  experiences: Experience[];
  skills: Skill[];
  score?: number;
  matchingScore?: number;
  matchedSkills?: string[];
  missingSkills?: string[];
  dateAnalyse?: Date | string;
  matching?: {
    score?: number;
    matchedSkills?: string[];
    missingSkills?: string[];
  };
}

// Structure de la réponse API qui contient analysis
export interface CvAnalysisResponse {
  id?: number;
  analysis: CvAnalysis;
  dateAnalyse?: Date | string;
  userId?: number;
}

export interface Experience {
  company: string;
  role: string;
  year: string;
  duration?: string;
  competences?: string[];
}

export interface Skill {
  id?: number;
  name: string;
  level: string;
  type?: string; // "hardSkills" ou "softSkills"
}
