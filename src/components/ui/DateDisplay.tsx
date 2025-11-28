import React from 'react';

interface DateDisplayProps {
  date: string | null;
  className?: string;
}

export default function DateDisplay({ date, className = '' }: DateDisplayProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <span className={`font-medium text-white ${className}`}>
      {formatDate(date)}
    </span>
  );
}