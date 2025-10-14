export interface Skill {
    skill: string;
    level: 'Débutant' | 'Intermédiaire' | 'Avancé'; 
}

export interface Experience {
    year: string;
    role: string;
    company: string;
    duration?: string; 
    competencies: string[];
}

export interface CvAnalysis {
    score: number; 
    skills: Skill[];
    experiences: Experience[]; 
    summary?: string; 
}