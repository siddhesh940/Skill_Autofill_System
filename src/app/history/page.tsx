'use client';

import Header from '@/components/Header';
import { Badge, Button, Card, EmptyState } from '@/components/ui';
import { useAnalysisHistory } from '@/hooks';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const { history, removeFromHistory, clearHistory } = useAnalysisHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-700 rounded w-1/4"></div>
            <div className="h-40 bg-slate-700 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analysis History</h1>
            <p className="text-slate-400">Your previous job analyses</p>
          </div>
          {history.length > 0 && (
            <Button variant="outline" onClick={clearHistory}>
              Clear All
            </Button>
          )}
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="No analysis history"
            description="Your previous job analyses will appear here"
            action={
              <Button onClick={() => window.location.href = '/'}>
                Start Analysis
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium text-white">{item.jobTitle}</h3>
                    <Badge variant={
                      item.matchPercentage >= 80 ? 'success' : 
                      item.matchPercentage >= 60 ? 'warning' : 'error'
                    }>
                      {item.matchPercentage}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">
                    {item.company} • Analyzed {new Date(item.analyzedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" onClick={() => removeFromHistory(item.id)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
