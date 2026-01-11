'use client';

import { useState } from 'react';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
  type?: 'error' | 'warning' | 'info';
  showDismiss?: boolean;
  className?: string;
}

export default function ErrorMessage({ 
  message, 
  onDismiss, 
  type = 'error',
  showDismiss = true,
  className = '' 
}: ErrorMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) return null;

  const typeStyles = {
    error: {
      container: 'bg-red-500/10 border-red-500/30 text-red-400',
      icon: 'text-red-400',
      subtitle: 'text-red-300'
    },
    warning: {
      container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      icon: 'text-yellow-400',
      subtitle: 'text-yellow-300'
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      icon: 'text-blue-400',
      subtitle: 'text-blue-300'
    }
  };

  const styles = typeStyles[type];

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
        );
      case 'info':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
    }
  };

  return (
    <div className={`p-4 border rounded-lg animate-fade-in ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg className={`w-5 h-5 mt-0.5 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {getIcon()}
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {type === 'error' && (
            <p className={`mt-1 text-xs ${styles.subtitle}`}>
              If the problem persists, try refreshing the page.
            </p>
          )}
        </div>
        {showDismiss && (
          <button
            onClick={handleDismiss}
            className={`flex-shrink-0 ${styles.subtitle} hover:opacity-80 transition-opacity`}
            aria-label="Dismiss message"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}