export interface Skill {
    name: string;
    level: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface Experience {
    company: string;
    role: string;
    year: string;
    duration?: string;
    competences: string[];
}

export interface CvAnalysis {
    resume: string;
    skills: Skill[];
    experience: Experience[];
    score?: number;
    ownerName?: string;
}