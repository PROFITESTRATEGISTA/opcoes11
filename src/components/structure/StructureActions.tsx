import React from 'react';
import { Upload, Edit2, RotateCcw, Activity, Trash2 } from 'lucide-react';
import { OptionStructure } from '../../types/trading';

interface StructureActionsProps {
  structure: OptionStructure;
  onEdit: (structure: OptionStructure) => void;
  onActivate: (structure: OptionStructure) => void;
  onRoll: (structure: OptionStructure) => void;
  onZero: (structure: OptionStructure) => void;
  onViewOperations: (structure: OptionStructure) => void;
  onDelete: (structureId: string) => void;
}

export default function StructureActions({
  structure,
  onEdit,
  onActivate,
  onRoll,
  onZero,
  onViewOperations,
  onDelete
}: StructureActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        {structure.status === 'MONTANDO' && (
          <>
            <button
              onClick={() => onActivate(structure)}
              className="px-3 py-2 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Upload className="w-3 h-3 mr-1" />
              Ativar
            </button>
            <button
              onClick={() => onEdit(structure)}
              className="px-3 py-2 text-blue-400 hover:text-blue-300 text-xs border border-blue-500/30 rounded-lg hover:bg-blue-500/10 transition-colors flex items-center"
            >
              <Edit2 className="w-3 h-3 mr-1" />
              Editar
            </button>
          </>
        )}
        
        {structure.status === 'ATIVA' && (
          <>
            <button
              onClick={() => onRoll(structure)}
              className="px-3 py-2 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Roll
            </button>
            <button
              onClick={() => onZero(structure)}
              className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
            >
              Zerar
            </button>
          </>
        )}
        
        {(structure.status === 'ATIVA' || structure.status === 'FINALIZADA') && 
         structure.operacoes && structure.operacoes.length > 0 && (
          <button
            onClick={() => onViewOperations(structure)}
            className="px-3 py-2 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <Activity className="w-3 h-3 mr-1" />
            Ver Operações
          </button>
        )}
        
        {structure.status === 'FINALIZADA' && (
          <span className="px-3 py-2 bg-gray-700 text-gray-400 text-xs rounded-lg">
            Concluída
          </span>
        )}
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(structure.id!)}
        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        title="Excluir estrutura"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}