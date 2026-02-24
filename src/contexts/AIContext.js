import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { analyzeImage } from '../services/openai';
import { apiGetHistory, apiSaveHistory, apiDeleteHistory, apiGetStats, apiSimplify } from '../services/api';
import { AuthContext } from './AuthContext';

export const AIContext = createContext({});

export const AIProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [image, setImage] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ totalScans: 0, totalSaved: 0, todayScans: 0 });

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
    } else {
      setHistory([]);
      setStats({ totalScans: 0, totalSaved: 0, todayScans: 0 });
    }
  }, [user?.id, refreshHistory]);

  const processImage = async (uri) => {
    setLoading(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeImage(uri, user?.id);
      setAnalysisResult(result);
      await refreshHistory(); // refresh stats after scan
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
        processImage,
        saveResult,
        simplifyResult,
        removeHistoryItem,
        refreshHistory,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
