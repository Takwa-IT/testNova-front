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

export interface SkillsGroup {
    hardSkills: Skill[];
    softSkills: Skill[];
}

// Accept either an array of skills (legacy) or a grouped object (new backend)
export interface CvAnalysis {
    resume: string;
    skills: Skill[] | SkillsGroup;
    experience: Experience[];
    score?: number;
    ownerName?: string;
}