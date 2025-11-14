interface TestResult {
    totalScore: number;
    scorePercentage: number;
    correctAnswers: number;
    totalQuestions: number;
    questionResults: QuestionResult[];
    feedback: string;
    problemResult: ProblemResult;
    problemMaxScore: number;
}

interface QuestionResult {
    questionId: number;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
}

interface ProblemResult {
    userSolution: string;
    explanation: string;
    score: number;
    isGood: boolean;
}
