import React from 'react';
import { Eye, ArrowUpRight, ArrowDownLeft, Plus, Minus, Calculator, Activity, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

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

interface CashFlowTableProps {
  cashFlowEntries: CashFlowEntry[];
  currentBalance: number;
  structures: OptionStructure[];
  onViewEntry: (entry: CashFlowEntry) => void;
  onDeleteEntry?: (entry: CashFlowEntry) => void;
}

export default function CashFlowTable({ cashFlowEntries, currentBalance, structures, onViewEntry, onDeleteEntry }: CashFlowTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;
  
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

  const getEntryTypeIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return ArrowDownLeft;
      case 'WITHDRAWAL':
        return ArrowUpRight;
      case 'STRUCTURE_COST':
      case 'ROLL_COST':
      case 'EXERCISE_COST':
      case 'BROKERAGE':
        return Minus;
      case 'STRUCTURE_PREMIUM':
      case 'PROFIT':
        return Plus;
      case 'TAX':
        return Calculator;
      default:
        return Activity;
    }
  };

  const isEntryLinkedToStructure = (entry: CashFlowEntry) => {
    return entry.relatedStructureId || entry.relatedRollId;
  };

  const isOrphanedEntry = (entry: CashFlowEntry, structures: OptionStructure[]) => {
    if (!entry.relatedStructureId) return false;
    
    // Check if the related structure still exists
    const relatedStructure = structures.find(s => s.id === entry.relatedStructureId);
    return !relatedStructure;
  };

  // Pagination logic
  const totalPages = Math.ceil(cashFlowEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = cashFlowEntries.slice().reverse().slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl">
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">
          Fluxo de Caixa ({cashFlowEntries.length} lançamentos) - Página {currentPage} de {totalPages}
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">Saldo Atual</p>
          <p className={`text-xl font-bold ${currentBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatCurrency(currentBalance)}
          </p>
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Data</th>
                <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Tipo</th>
                <th className="text-left py-3 px-3 text-sm font-medium text-gray-400">Descrição</th>
                <th className="text-right py-3 px-3 text-sm font-medium text-gray-400">Valor</th>
                <th className="text-right py-3 px-3 text-sm font-medium text-gray-400">Saldo</th>
                <th className="text-center py-3 px-3 text-sm font-medium text-gray-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((entry) => {
                const Icon = getEntryTypeIcon(entry.type);
                const isOrphaned = isOrphanedEntry(entry, structures);
                return (
                  <tr key={entry.id} className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-3">
                      <div className="text-sm text-white">{formatDate(entry.date)}</div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-gray-400" />
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getEntryTypeColor(entry.type)}`}>
                          {entry.type.replace('_', ' ')}
                        </span>
                        {isOrphaned && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                            ÓRFÃO
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <div className="text-sm text-white">{entry.description}</div>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className={`text-sm font-bold ${entry.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className={`text-sm font-bold ${entry.balance >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                        {formatCurrency(entry.balance)}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-center">
                      <button
                        onClick={() => onViewEntry(entry)}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Visualizar detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {onDeleteEntry && entry.id !== 'initial_balance' && (!isEntryLinkedToStructure(entry) || isOrphaned) ? (
                        <button
                          onClick={() => {
                            const confirmMessage = isOrphaned 
                              ? `⚠️ LANÇAMENTO ÓRFÃO DETECTADO\n\nEste lançamento está vinculado a uma estrutura que não existe mais.\n\nDescrição: ${entry.description}\nValor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.amount)}\n\n✅ EXCLUSÃO FORÇADA RECOMENDADA\n\nConfirma a exclusão?`
                              : 'Tem certeza que deseja excluir este lançamento?';
                            
                            if (window.confirm(confirmMessage)) {
                              onDeleteEntry(entry);
                            }
                          }}
                          className={`p-2 hover:bg-red-500/10 rounded-lg transition-colors ml-2 ${
                            isOrphaned ? 'text-yellow-400' : 'text-red-400'
                          }`}
                          title={isOrphaned ? 'Excluir lançamento órfão (FORÇADO)' : 'Excluir lançamento'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : onDeleteEntry && isEntryLinkedToStructure(entry) && (
                        <div className="p-2 text-gray-500 ml-2" title="Lançamento vinculado a estrutura - não pode ser excluído diretamente">
                          <Trash2 className="w-4 h-4 opacity-30" />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              Exibindo {startIndex + 1}-{Math.min(endIndex, cashFlowEntries.length)} de {cashFlowEntries.length} lançamentos
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}