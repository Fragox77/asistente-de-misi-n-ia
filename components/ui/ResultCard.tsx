import React from 'react';

interface ResultCardProps {
  content: React.ReactNode | null;
  error?: string | null;
  className?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ content, error, className = '' }) => {
  if (!content && !error) {
    return null;
  }

  const resultToShow = error ? (
    <pre className="whitespace-pre-wrap break-words font-mono text-red-400">
      Error: {error}
    </pre>
  ) : content;

  return (
    <div className={`mt-6 bg-gray-900/80 border rounded-lg p-4 text-sm sm:text-base ${error ? 'border-red-500/50' : 'border-gray-700'} ${className}`}>
      {resultToShow}
    </div>
  );
};

export default ResultCard;