'use client';

import { resilientFetch } from '@/lib/api-client';
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
    
    const result = await resilientFetch<{ data: ParsedJobDescription }>('/api/extract-jd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jd_text: jdText }),
      timeout: 30000,
      retries: 2,
    });

    if (result.success && result.data) {
      // Handle both wrapped and unwrapped response formats
      const resultData = result.data as unknown as { data?: ParsedJobDescription } | ParsedJobDescription;
      const data = 'data' in resultData && resultData.data ? resultData.data : resultData as ParsedJobDescription;
      setState(prev => ({ ...prev, jobData: data, isLoading: false }));
      return data;
    }
    
    setError(result.error || 'Could not process job description. Please try again.');
    return null;
  }, []);

  const analyzeProfile = useCallback(async (
    resumeText?: string, 
    githubUsername?: string
  ): Promise<UserSkillProfile | null> => {
    setLoading(true);
    
    const result = await resilientFetch<{ data: UserSkillProfile }>('/api/analyze-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, github_username: githubUsername }),
      timeout: 30000,
      retries: 2,
    });

    if (result.success && result.data) {
      // Handle both wrapped and unwrapped response formats
      const resultData = result.data as unknown as { data?: UserSkillProfile } | UserSkillProfile;
      const data = 'data' in resultData && resultData.data ? resultData.data : resultData as UserSkillProfile;
      setState(prev => ({ ...prev, profileData: data, isLoading: false }));
      return data;
    }
    
    setError(result.error || 'Could not analyze profile. Please try again.');
    return null;
  }, []);

  const analyzeSkillGap = useCallback(async (
    jobData: ParsedJobDescription, 
    userSkills: string[]
  ): Promise<SkillGapAnalysis | null> => {
    setLoading(true);
    
    const result = await resilientFetch<{ data: SkillGapAnalysis }>('/api/skill-gap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_data: jobData, user_skills: userSkills }),
      timeout: 30000,
      retries: 2,
    });

    if (result.success && result.data) {
      // Handle both wrapped and unwrapped response formats
      const resultData = result.data as unknown as { data?: SkillGapAnalysis } | SkillGapAnalysis;
      const data = 'data' in resultData && resultData.data ? resultData.data : resultData as SkillGapAnalysis;
      setState(prev => ({ ...prev, skillGap: data, isLoading: false }));
      return data;
    }
    
    setError(result.error || 'Could not analyze skill gap. Please try again.');
    return null;
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generateRoadmap = useCallback(async (
    missingSkills: any[], 
    hoursPerWeek: number = 10
  ): Promise<LearningRoadmap | null> => {
    setLoading(true);
    
    const result = await resilientFetch<{ data: LearningRoadmap }>('/api/generate-roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ missing_skills: missingSkills, available_hours_per_week: hoursPerWeek }),
      timeout: 30000,
      retries: 2,
    });

    if (result.success && result.data) {
      // Handle both wrapped and unwrapped response formats
      const resultData = result.data as unknown as { data?: LearningRoadmap } | LearningRoadmap;
      const data = 'data' in resultData && resultData.data ? resultData.data : resultData as LearningRoadmap;
      setState(prev => ({ ...prev, roadmap: data, isLoading: false }));
      return data;
    }
    
    setError(result.error || 'Could not generate roadmap. Please try again.');
    return null;
  }, []);

  const runFullAnalysis = useCallback(async (
    jdText: string,
    resumeText?: string,
    githubUsername?: string,
    hoursPerWeek: number = 10
  ): Promise<FullAnalysisResponse | null> => {
    setLoading(true);
    
    const result = await resilientFetch<{ data: FullAnalysisResponse }>('/api/generate-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jd_text: jdText,
        resume_text: resumeText,
        github_username: githubUsername,
        available_hours_per_week: hoursPerWeek,
      }),
      timeout: 90000, // 90 seconds for full analysis
      retries: 2,
    });

    if (result.success && result.data) {
      // Handle both wrapped and unwrapped response formats
      const resultData = result.data as unknown as { data?: FullAnalysisResponse } | FullAnalysisResponse;
      const data = 'data' in resultData && resultData.data ? resultData.data : resultData as FullAnalysisResponse;
      setState(prev => ({ 
        ...prev, 
        fullAnalysis: data, 
        isLoading: false 
      }));
      return data;
    }
    
    setError(result.error || 'Could not complete analysis. Please try again.');
    return null;
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
