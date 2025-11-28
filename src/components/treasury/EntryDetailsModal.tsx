import React from 'react';
import { X } from 'lucide-react';
import { OptionStructure } from '../../types/trading';

interface CashFlowEntry {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'STRUCTURE_COST' | 'STRUCTURE_PREMIUM' | 'ROLL_COST' | 'EXERCISE_COST' | 'BROKERAGE' | 'TAX' | 'PROFIT';
  description: string;
  amount: number;
  balance: number;
  relatedStructureId?: string;
  relatedRollId?: string;
}

interface EntryDetailsModalProps {
  entry: CashFlowEntry | null;
  structures: OptionStructure[];
  onClose: () => void;
}

export default function EntryDetailsModal({ entry, structures, onClose }: EntryDetailsModalProps) {
  if (!entry) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getEntryTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'WITHDRAWAL':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'STRUCTURE_COST':
      case 'ROLL_COST':
      case 'EXERCISE_COST':
      case 'BROKERAGE':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'STRUCTURE_PREMIUM':
      case 'PROFIT':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'TAX':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Detalhes do Lançamento</h3>
              <p className="text-purple-100">{formatDate(entry.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm font-medium">Tipo</p>
                <span className={`px-3 py-1 text-xs font-medium rounded border ${getEntryTypeColor(entry.type)}`}>
                  {entry.type.replace('_', ' ')}
                </span>
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">Valor</p>
                <p className={`text-lg font-bold ${entry.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-gray-400 text-sm font-medium">Descrição</p>
              <p className="text-white">{entry.description}</p>
            </div>

            <div>
              <p className="text-gray-400 text-sm font-medium">Saldo Após Lançamento</p>
              <p className={`text-xl font-bold ${entry.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(entry.balance)}
              </p>
            </div>

            {entry.relatedStructureId && (
              <div>
                <p className="text-gray-400 text-sm font-medium">Estrutura Relacionada</p>
                <p className="text-white">
                  {structures.find(s => s.id === entry.relatedStructureId)?.nome || 'Estrutura não encontrada'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}