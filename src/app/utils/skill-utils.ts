export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const LEVEL_SCORES: Record<Level, number> = {
    expert: 100,
    advanced: 75,
    intermediate: 50,
    beginner: 25,
};

export function normalizeLevel(level?: string): Level {
    if (!level) return 'beginner';
    const l = level.toString().toLowerCase();
    switch (l) {
        case 'expert':
            return 'expert';
        case 'advanced':
            return 'advanced';
        case 'intermediate':
            return 'intermediate';
        case 'beginner':
            return 'beginner';
        default:
            return 'beginner';
    }
}

export function calculateAverageScore(skills: Array<{ level?: string }>): number {
    if (!skills || skills.length === 0) return 0;
    const total = skills.reduce((sum, s) => {
        const lvl = normalizeLevel(s.level);
        return sum + (LEVEL_SCORES[lvl] || 0);
    }, 0);
    return Math.round(total / skills.length);
}
