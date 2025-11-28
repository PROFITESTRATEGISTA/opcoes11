import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MONTANDO':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'ATIVA':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'FINALIZADA':
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'MONTANDO': return 'Em Montagem';
      case 'ATIVA': return 'Em Operação';
      case 'FINALIZADA': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(status)} ${className}`}>
      {getStatusText(status)}
    </span>
  );
}