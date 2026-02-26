import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { analyzeImage } from '../services/openai';
import { apiGetHistory, apiSaveHistory, apiDeleteHistory, apiGetStats, apiSimplify, apiGetGoals, apiUpdateGoals, apiLogReadingTime } from '../services/api';
import { AuthContext } from './AuthContext';

export const AIContext = createContext({});

export const AIProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalScans: 0, totalSaved: 0, todayScans: 0 });
  const [goals, setGoals] = useState({
    dailyLessons: 3, dailyMinutes: 15,
    todayLessons: 0, todayReadingMinutes: 0, totalReadingMinutes: 0,
  });

  const refreshGoals = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await apiGetGoals(user.id);
      if (res.success) setGoals(res.goals);
    } catch (error) {
      console.error('Goals refresh error:', error);
    }
  }, [user?.id]);

  const refreshHistory = useCallback(async () => {
    if (!user?.id) return;
    try {
      const histRes = await apiGetHistory(user.id);
      if (histRes.success) {
        setHistory(histRes.items);
      }
      const statsRes = await apiGetStats(user.id);
      if (statsRes.success) {
        setStats(statsRes.stats);
      }
    } catch (error) {
      console.error('Refresh error:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      refreshHistory();
      refreshGoals();
    } else {
      setHistory([]);
      setStats({ totalScans: 0, totalSaved: 0, todayScans: 0 });
      setGoals({ dailyLessons: 3, dailyMinutes: 15, todayLessons: 0, todayReadingMinutes: 0, totalReadingMinutes: 0 });
    }
  }, [user?.id, refreshHistory, refreshGoals]);

  const processImage = async (uri) => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeImage(uri, user?.id);
      setAnalysisResult(result);
      refreshHistory().catch(() => {}); // refresh stats in background, don't block result
      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!analysisResult || !image || !user?.id) return null;
    try {
      const res = await apiSaveHistory(user.id, image, analysisResult);
      if (res.success) {
        await refreshHistory();
        return res.item;
      }
      return null;
    } catch (error) {
      console.error('Save error:', error);
      return null;
    }
  };

  const simplifyResult = async (currentResult) => {
    try {
      const res = await apiSimplify({
        summary: currentResult.summary,
        visualExplanation: currentResult.visualExplanation,
        realWorldExamples: currentResult.realWorldExamples,
        extractedText: currentResult.extractedText,
        solutionSteps: currentResult.solutionSteps || null,
      });
      if (res.success && res.result) {
        return {
          ...currentResult,
          summary: res.result.summary || currentResult.summary,
          visualExplanation: res.result.visualExplanation || currentResult.visualExplanation,
          realWorldExamples: res.result.realWorldExamples || currentResult.realWorldExamples,
          solutionSteps: res.result.solutionSteps || currentResult.solutionSteps,
        };
      }
      return null;
    } catch (error) {
      console.error('Simplify error:', error);
      return null;
    }
  };

  const removeHistoryItem = async (id) => {
    try {
      await apiDeleteHistory(id);
      await refreshHistory();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const updateDailyGoals = async (dailyLessons, dailyMinutes) => {
    if (!user?.id) return false;
    try {
      const res = await apiUpdateGoals(user.id, { dailyLessons, dailyMinutes });
      if (res.success) {
        setGoals(prev => ({ ...prev, dailyLessons, dailyMinutes }));
        await refreshGoals();
        return true;
      }
      console.error('Update goals failed:', res.error);
      return false;
    } catch (error) {
      console.error('Update goals error:', error);
      return false;
    }
  };

  const logReadingTime = async (seconds) => {
    if (!user?.id || seconds < 3) return;
    try {
      await apiLogReadingTime(user.id, Math.round(seconds));
      await refreshGoals();
    } catch (error) {
      console.error('Log reading time error:', error);
    }
  };

  return (
    <AIContext.Provider
      value={{
        image,
        setImage,
        analysisResult,
        setAnalysisResult,
        loading,
        history,
        stats,
        goals,
        processImage,
        saveResult,
        simplifyResult,
        removeHistoryItem,
        refreshHistory,
        refreshGoals,
        updateDailyGoals,
        logReadingTime,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
