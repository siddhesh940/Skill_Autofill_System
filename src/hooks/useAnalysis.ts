'use client';

import type {
  FullAnalysisResponse,
  LearningRoadmap,
  ParsedJobDescription,
  SkillGapAnalysis,
  UserSkillProfile
} from '@/types';
import { useCallback, useState } from 'react';

interface UseAnalysisState {
  isLoading: boolean;
  error: string | null;
  jobData: ParsedJobDescription | null;
  profileData: UserSkillProfile | null;
  skillGap: SkillGapAnalysis | null;
  roadmap: LearningRoadmap | null;
  fullAnalysis: FullAnalysisResponse | null;
}

interface UseAnalysisReturn extends UseAnalysisState {
  extractJD: (jdText: string) => Promise<ParsedJobDescription | null>;
  analyzeProfile: (resumeText?: string, githubUsername?: string) => Promise<UserSkillProfile | null>;
  analyzeSkillGap: (jobData: ParsedJobDescription, userSkills: string[]) => Promise<SkillGapAnalysis | null>;
  generateRoadmap: (missingSkills: any[], hoursPerWeek?: number) => Promise<LearningRoadmap | null>;
  runFullAnalysis: (jdText: string, resumeText?: string, githubUsername?: string, hoursPerWeek?: number) => Promise<FullAnalysisResponse | null>;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    isLoading: false,
    error: null,
    jobData: null,
    profileData: null,
    skillGap: null,
    roadmap: null,
    fullAnalysis: null,
  });

  const setLoading = (isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading, error: isLoading ? null : prev.error }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  };

  const extractJD = useCallback(async (jdText: string): Promise<ParsedJobDescription | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/extract-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: jdText }),
      });

      if (!response) {
        throw new Error('NETWORK_ERROR');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('JD extraction error:', { status: response.status, error: data.error });
        throw new Error(response.status >= 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      }

      setState(prev => ({ ...prev, jobData: data.data, isLoading: false }));
      return data.data;
    } catch (err) {
      console.error('JD extraction failed:', err);
      
      let userMessage = 'Failed to process job description. Please try again.';
      if (err instanceof Error) {
        switch (err.message) {
          case 'NETWORK_ERROR':
          case 'Failed to fetch':
            userMessage = 'Connection issue. Please check your internet and try again.';
            break;
          case 'SERVER_ERROR':
            userMessage = 'Our servers are having issues. Please try again in a moment.';
            break;
          case 'VALIDATION_ERROR':
            userMessage = 'Please check your job description and try again.';
            break;
        }
      }
      
      setError(userMessage);
      return null;
    }
  }, []);

  const analyzeProfile = useCallback(async (
    resumeText?: string, 
    githubUsername?: string
  ): Promise<UserSkillProfile | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: resumeText, github_username: githubUsername }),
      });

      if (!response) {
        throw new Error('NETWORK_ERROR');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Profile analysis error:', { status: response.status, error: data.error });
        throw new Error(response.status >= 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      }

      setState(prev => ({ ...prev, profileData: data.data, isLoading: false }));
      return data.data;
    } catch (err) {
      console.error('Profile analysis failed:', err);
      
      let userMessage = 'Failed to analyze your profile. Please try again.';
      if (err instanceof Error) {
        switch (err.message) {
          case 'NETWORK_ERROR':
          case 'Failed to fetch':
            userMessage = 'Connection issue. Please check your internet and try again.';
            break;
          case 'SERVER_ERROR':
            userMessage = 'Our servers are having issues. Please try again in a moment.';
            break;
          case 'VALIDATION_ERROR':
            userMessage = 'Please check your resume or GitHub username and try again.';
            break;
        }
      }
      
      setError(userMessage);
      return null;
    }
  }, []);

  const analyzeSkillGap = useCallback(async (
    jobData: ParsedJobDescription, 
    userSkills: string[]
  ): Promise<SkillGapAnalysis | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/skill-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_data: jobData, user_skills: userSkills }),
      });

      if (!response) {
        throw new Error('NETWORK_ERROR');
      }

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Skill gap analysis error:', { status: response.status, error: data.error });
        throw new Error(response.status >= 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR');
      }

      setState(prev => ({ ...prev, skillGap: data.data, isLoading: false }));
      return data.data;
    } catch (err) {
      console.error('Skill gap analysis failed:', err);
      
      let userMessage = 'Failed to analyze skill gap. Please try again.';
      if (err instanceof Error) {
        switch (err.message) {
          case 'NETWORK_ERROR':
          case 'Failed to fetch':
            userMessage = 'Connection issue. Please check your internet and try again.';
            break;
          case 'SERVER_ERROR':
            userMessage = 'Our servers are having issues. Please try again in a moment.';
            break;
          case 'VALIDATION_ERROR':
            userMessage = 'Please check your inputs and try again.';
            break;
        }
      }
      
      setError(userMessage);
      return null;
    }
  }, []);

  const generateRoadmap = useCallback(async (
    missingSkills: any[], 
    hoursPerWeek: number = 10
  ): Promise<LearningRoadmap | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missing_skills: missingSkills, available_hours_per_week: hoursPerWeek }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setState(prev => ({ ...prev, roadmap: data.data, isLoading: false }));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap');
      return null;
    }
  }, []);

  const runFullAnalysis = useCallback(async (
    jdText: string,
    resumeText?: string,
    githubUsername?: string,
    hoursPerWeek: number = 10
  ): Promise<FullAnalysisResponse | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd_text: jdText,
          resume_text: resumeText,
          github_username: githubUsername,
          available_hours_per_week: hoursPerWeek,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setState(prev => ({ 
        ...prev, 
        fullAnalysis: data.data, 
        isLoading: false 
      }));
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run full analysis');
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      jobData: null,
      profileData: null,
      skillGap: null,
      roadmap: null,
      fullAnalysis: null,
    });
  }, []);

  return {
    ...state,
    extractJD,
    analyzeProfile,
    analyzeSkillGap,
    generateRoadmap,
    runFullAnalysis,
    reset,
  };
}
