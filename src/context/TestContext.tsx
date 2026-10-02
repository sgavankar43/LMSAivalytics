'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Quiz, QuizQuestion, StudentQuizAttempt, QuizStats } from '@/types';
import { initialQuizzes, initialQuizAttempts } from '@/data/quizMockData';

interface CreateQuizFromCsvParams {
  title: string;
  courseCode: string;
  courseName: string;
  timeLimitMinutes: number;
  passingPercentage: number;
  description?: string;
  csvContent: string;
}

interface TestContextType {
  quizzes: Quiz[];
  attempts: StudentQuizAttempt[];
  stats: QuizStats;
  addQuiz: (quiz: Quiz) => void;
  createQuizFromCsv: (params: CreateQuizFromCsvParams) => { success: boolean; error?: string; quiz?: Quiz };
  submitQuizAttempt: (attemptData: Omit<StudentQuizAttempt, 'id' | 'completedAt'>) => StudentQuizAttempt;
  deleteQuiz: (quizId: string) => void;
  getAttemptsByQuiz: (quizId: string) => StudentQuizAttempt[];
  getAttemptsByStudent: (studentEmail: string) => StudentQuizAttempt[];
  getQuizById: (quizId: string) => Quiz | undefined;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

const QUIZZES_STORAGE_KEY = 'aivalytics_lms_quizzes_v1';
const ATTEMPTS_STORAGE_KEY = 'aivalytics_lms_attempts_v1';

export const TestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [attempts, setAttempts] = useState<StudentQuizAttempt[]>(initialQuizAttempts);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted state from localStorage on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedQuizzes = localStorage.getItem(QUIZZES_STORAGE_KEY);
        const storedAttempts = localStorage.getItem(ATTEMPTS_STORAGE_KEY);

        if (storedQuizzes) {
          setQuizzes(JSON.parse(storedQuizzes));
        }
        if (storedAttempts) {
          setAttempts(JSON.parse(storedAttempts));
        }
      } catch (err) {
        console.error('Failed to load quizzes from localStorage', err);
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(quizzes));
        localStorage.setItem(ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
    }
  }, [quizzes, attempts, isLoaded]);

  // Derived Quiz Statistics
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScore =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        )
      : 85;
  const passedAttempts = attempts.filter((a) => a.passed).length;
  const passRate =
    attempts.length > 0
      ? Math.round((passedAttempts / attempts.length) * 100)
      : 90;

  const stats: QuizStats = {
    totalQuizzes,
    totalAttempts,
    avgScore,
    passRate,
  };

  const addQuiz = (newQuiz: Quiz) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
  };

  // Helper function to parse CSV lines into questions
  const parseQuizCsv = (csvText: string): { questions: QuizQuestion[]; error?: string } => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) {
      return { questions: [], error: 'CSV file must contain a header and at least one question row.' };
    }

    // Header validation
    const header = lines[0].toLowerCase();
    if (
      !header.includes('questiontext') ||
      !header.includes('optiona') ||
      !header.includes('correctoption')
    ) {
      return {
        questions: [],
        error: 'Invalid CSV header format. Expected headers: questionNumber,questionText,optionA,optionB,optionC,optionD,correctOption,explanation',
      };
    }

    const questions: QuizQuestion[] = [];

    // Parse CSV rows safely with quoted strings support
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];

      // Regex matching comma-separated values respecting quotes
      const rowMatches: string[] = [];
      let currentVal = '';
      let insideQuotes = false;

      for (let c = 0; c < line.length; c++) {
        const char = line[c];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          rowMatches.push(currentVal.trim().replace(/^"|"$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      rowMatches.push(currentVal.trim().replace(/^"|"$/g, ''));

      if (rowMatches.length < 7) {
        continue; // Skip malformed rows
      }

      const [qNumRaw, qText, optA, optB, optC, optD, correctRaw, explanation] = rowMatches;
      const cleanCorrect = (correctRaw || 'A').toUpperCase().trim();
      const validCorrect = ['A', 'B', 'C', 'D'].includes(cleanCorrect)
        ? (cleanCorrect as 'A' | 'B' | 'C' | 'D')
        : 'A';

      questions.push({
        id: `csv_q_${Date.now()}_${i}`,
        questionNumber: parseInt(qNumRaw, 10) || i,
        questionText: qText || `Question ${i}`,
        options: {
          A: optA || 'Option A',
          B: optB || 'Option B',
          C: optC || 'Option C',
          D: optD || 'Option D',
        },
        correctOption: validCorrect,
        explanation: explanation || 'Refer to course curriculum documentation.',
        points: 5,
      });
    }

    if (questions.length === 0) {
      return { questions: [], error: 'Could not extract any valid questions from the CSV file.' };
    }

    return { questions };
  };

  const createQuizFromCsv = ({
    title,
    courseCode,
    courseName,
    timeLimitMinutes,
    passingPercentage,
    description,
    csvContent,
  }: CreateQuizFromCsvParams) => {
    const { questions, error } = parseQuizCsv(csvContent);
    if (error || questions.length === 0) {
      return { success: false, error: error || 'Failed to parse questions from CSV.' };
    }

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      title,
      description: description || `Assessment covering key concepts in ${courseName}.`,
      courseCode,
      courseName,
      timeLimitMinutes: Number(timeLimitMinutes) || 15,
      passingPercentage: Number(passingPercentage) || 70,
      totalPoints,
      questions,
      createdAt: 'Just now',
      status: 'Published',
      totalAttempts: 0,
      avgScore: 0,
      passRate: 0,
    };

    setQuizzes((prev) => [newQuiz, ...prev]);
    return { success: true, quiz: newQuiz };
  };

  const submitQuizAttempt = (attemptData: Omit<StudentQuizAttempt, 'id' | 'completedAt'>) => {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    })} • ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const newAttempt: StudentQuizAttempt = {
      ...attemptData,
      id: `att_${Date.now()}`,
      completedAt: formattedDate,
    };

    setAttempts((prev) => [newAttempt, ...prev]);

    // Recalculate quiz-level stats
    setQuizzes((prevQuizzes) =>
      prevQuizzes.map((quiz) => {
        if (quiz.id === attemptData.quizId) {
          const relevantAttempts = [...attempts.filter((a) => a.quizId === quiz.id), newAttempt];
          const newTotal = relevantAttempts.length;
          const newAvg = Math.round(
            relevantAttempts.reduce((sum, a) => sum + a.score, 0) / newTotal
          );
          const passedCount = relevantAttempts.filter((a) => a.passed).length;
          const newPassRate = Math.round((passedCount / newTotal) * 100);

          return {
            ...quiz,
            totalAttempts: newTotal,
            avgScore: newAvg,
            passRate: newPassRate,
          };
        }
        return quiz;
      })
    );

    return newAttempt;
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    setAttempts((prev) => prev.filter((a) => a.quizId !== quizId));
  };

  const getAttemptsByQuiz = (quizId: string) => {
    return attempts.filter((a) => a.quizId === quizId);
  };

  const getAttemptsByStudent = (studentEmail: string) => {
    return attempts.filter((a) => a.studentEmail.toLowerCase() === studentEmail.toLowerCase());
  };

  const getQuizById = (quizId: string) => {
    return quizzes.find((q) => q.id === quizId);
  };

  return (
    <TestContext.Provider
      value={{
        quizzes,
        attempts,
        stats,
        addQuiz,
        createQuizFromCsv,
        submitQuizAttempt,
        deleteQuiz,
        getAttemptsByQuiz,
        getAttemptsByStudent,
        getQuizById,
      }}
    >
      {children}
    </TestContext.Provider>
  );
};

export const useTests = (): TestContextType => {
  const context = useContext(TestContext);
  if (!context) {
    throw new Error('useTests must be used within a TestProvider');
  }
  return context;
};
