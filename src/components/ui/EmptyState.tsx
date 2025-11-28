import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <p className="text-gray-400">{title}</p>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
}