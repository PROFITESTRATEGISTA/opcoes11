import React from 'react';
import { X, TrendingUp } from 'lucide-react';

interface StructureHeaderProps {
  onCancel: () => void;
  isEditing: boolean;
}

export default function StructureHeader({ onCancel, isEditing }: StructureHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {isEditing ? 'Editar Estrutura' : 'Nova Estrutura de Opções'}
            </h2>
            <p className="text-blue-200">Strategos Partners - Configure suas opções</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}