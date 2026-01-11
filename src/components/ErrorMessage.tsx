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
  type = 'warning', // Default to warning for less alarming UX
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

  // Use softer colors for better UX
  const typeStyles = {
    error: {
      container: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
      icon: 'text-amber-400',
      subtitle: 'text-amber-200/70'
    },
    warning: {
      container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
      icon: 'text-yellow-400',
      subtitle: 'text-yellow-200/70'
    },
    info: {
      container: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
      icon: 'text-blue-400',
      subtitle: 'text-blue-200/70'
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <p className={`mt-1 text-xs ${styles.subtitle}`}>
            This usually resolves by trying again.
          </p>
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