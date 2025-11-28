import React from 'react';

interface CurrencyDisplayProps {
  value: number;
  className?: string;
  showSign?: boolean;
}

export default function CurrencyDisplay({ value, className = '', showSign = false }: CurrencyDisplayProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getColorClass = (value: number) => {
    if (value > 0) return 'text-blue-400';
    if (value < 0) return 'text-gray-400';
    return 'text-gray-400';
  };

  return (
    <span className={`font-bold ${getColorClass(value)} ${className}`}>
      {showSign && value > 0 ? '+' : ''}{formatCurrency(value)}
    </span>
  );
}