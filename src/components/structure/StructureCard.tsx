import React from 'react';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { OptionStructure } from '../../types/trading';
import StatusBadge from '../ui/StatusBadge';
import CurrencyDisplay from '../ui/CurrencyDisplay';
import DateDisplay from '../ui/DateDisplay';

interface StructureCardProps {
  structure: OptionStructure;
  onEdit: (structure: OptionStructure) => void;
  onActivate: (structure: OptionStructure) => void;
  onRoll: (structure: OptionStructure) => void;
  onZero: (structure: OptionStructure) => void;
  onViewOperations: (structure: OptionStructure) => void;
  onDelete: (structureId: string) => void;
}

export default function StructureCard({ 
  structure, 
  onEdit, 
  onActivate, 
  onRoll, 
  onZero, 
  onViewOperations, 
  onDelete 
}: StructureCardProps) {
  const totalResult = structure.operacoes?.reduce((sum, op) => sum + op.resultado, 0) || 0;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-white text-lg mb-1">{structure.nome}</h3>
          {structure.ativo && (
            <p className="text-sm text-blue-400 font-medium">Ativo: {structure.ativo}</p>
          )}
        </div>
        <StatusBadge status={structure.status} />
      </div>

      {/* Structure Info */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Pernas:</span>
          <span className="font-medium text-white">{structure.legs.length}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Vencimento:</span>
          <DateDisplay date={structure.dataVencimento} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Prêmio Teórico:</span>
          <CurrencyDisplay value={structure.premioLiquido} showSign />
        </div>
      </div>

      {/* Status-specific info */}
      {structure.status === 'ATIVA' && structure.dataAtivacao && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center mb-2">
            <Calendar className="w-4 h-4 text-green-400 mr-2" />
            <p className="text-xs text-green-300">Ativada em: <DateDisplay date={structure.dataAtivacao} /></p>
          </div>
          {structure.operacoes && structure.operacoes.length > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-300">Operações:</p>
                <p className="text-sm font-medium text-green-400">{structure.operacoes.length}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-green-300">Resultado Real:</p>
                <div className={`flex items-center text-sm font-bold ${
                  totalResult >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {totalResult >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  <CurrencyDisplay value={totalResult} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {structure.status === 'FINALIZADA' && structure.dataFinalizacao && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-1">
                <Calendar className="w-4 h-4 text-blue-400 mr-2" />
                <p className="text-xs text-blue-300">Finalizada em:</p>
              </div>
              <p className="text-sm font-medium text-blue-400">
                <DateDisplay date={structure.dataFinalizacao} />
              </p>
            </div>
            {structure.operacoes && structure.operacoes.length > 0 && (
              <div className="text-right">
                <p className="text-xs text-blue-300">Resultado Final:</p>
                <div className={`flex items-center text-sm font-bold ${
                  totalResult >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {totalResult >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  <CurrencyDisplay value={totalResult} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}