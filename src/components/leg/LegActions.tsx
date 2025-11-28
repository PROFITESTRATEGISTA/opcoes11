import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface LegActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  showSpecialActions?: boolean;
  onEditCall?: () => void;
  onSwapCall?: () => void;
}

export default function LegActions({ 
  onEdit, 
  onDelete, 
  showSpecialActions = false,
  onEditCall,
  onSwapCall 
}: LegActionsProps) {
  return (
    <div className="flex items-center space-x-2">
      {showSpecialActions && (
        <div className="flex items-center space-x-1">
          <button
            onClick={onEditCall}
            className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
            title="Editar CALL da trava"
          >
            Editar CALL
          </button>
          <button
            onClick={onSwapCall}
            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
            title="Trocar por outra CALL"
          >
            Trocar CALL
          </button>
        </div>
      )}
      
      <button
        onClick={onEdit}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Editar perna"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remover perna"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}