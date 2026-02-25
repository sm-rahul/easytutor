import React, { createContext, useState, useCallback, useContext } from 'react';
import {
  apiGenerateQuiz,
  apiGetQuiz,
  apiSubmitQuiz,
  apiGetQuizHistory,
  apiGetQuizPerformance,
} from '../services/api';
import { AuthContext } from './AuthContext';

export const QuizContext = createContext({});

export const QuizProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [performance, setPerformance] = useState(null);

  const generateQuiz = useCallback(async (historyId, analysisResult) => {
    if (!user?.id) return null;
    setQuizLoading(true);
    setQuizResult(null);
    setCurrentQuiz(null);
    setCurrentQuestions([]);
    try {
      const res = await apiGenerateQuiz({
        userId: user.id,
        historyId,
        extractedText: analysisResult.extractedText,
        summary: analysisResult.summary,
        keyWords: analysisResult.keyWords,
        type: analysisResult.type,
        solutionSteps: analysisResult.solutionSteps,
        finalAnswer: analysisResult.finalAnswer,
      });
      if (res.success) {
        const quizRes = await apiGetQuiz(res.quizId);
        if (quizRes.success) {
          setCurrentQuiz(quizRes.quiz);
          setCurrentQuestions(quizRes.questions);
          return quizRes;
        }
      }
      return null;
    } catch (error) {
      console.error('Generate quiz error:', error);
      return null;
    } finally {
      setQuizLoading(false);
    }
  }, [user?.id]);

  const submitQuiz = useCallback(async (quizId, answers, timeTakenSeconds) => {
    if (!user?.id) return null;
    try {
      const res = await apiSubmitQuiz(quizId, {
        userId: user.id,
        answers,
        timeTakenSeconds,
      });
      if (res.success) {
        setQuizResult(res.result);
        return res.result;
      }
      return null;
    } catch (error) {
      console.error('Submit quiz error:', error);
      return null;
    }
  }, [user?.id]);

  const refreshQuizHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiGetQuizHistory(user.id);
      if (res.success) setQuizHistory(res.attempts);
    } catch (error) {
      console.error('Quiz history error:', error);
    }
  }, [user?.id]);

  const refreshPerformance = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiGetQuizPerformance(user.id);
      if (res.success) setPerformance(res.performance);
    } catch (error) {
      console.error('Quiz performance error:', error);
    }
  }, [user?.id]);

  const clearCurrentQuiz = useCallback(() => {
    setCurrentQuiz(null);
    setCurrentQuestions([]);
    setQuizResult(null);
  }, []);

  return (
    <QuizContext.Provider
      value={{
        currentQuiz,
        currentQuestions,
        quizLoading,
        quizResult,
        quizHistory,
        performance,
        generateQuiz,
        submitQuiz,
        refreshQuizHistory,
        refreshPerformance,
        clearCurrentQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
