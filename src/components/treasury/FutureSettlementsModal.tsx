import React, { useState } from 'react';
import { X, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';

interface FutureSettlement {
  id: string;
  type: 'STRUCTURE_PREMIUM' | 'EXERCISE_COST' | 'ROLL_COST';
  description: string;
  amount: number;
  settlementDate: string;
  structureName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SETTLED';
}

interface FutureSettlementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: FutureSettlement[];
}

export default function FutureSettlementsModal({ 
  isOpen, 
  onClose, 
  settlements = [] 
}: FutureSettlementsModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  if (!isOpen) return null;

  const filterSettlementsByPeriod = (period: string) => {
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (period) {
      case '7d':
        cutoffDate.setDate(now.getDate() + 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() + 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() + 90);
        break;
    }

    return settlements.filter(settlement => {
      const settlementDate = new Date(settlement.settlementDate);
      return settlementDate <= cutoffDate && settlementDate >= now;
    });
  };

  const filteredSettlements = filterSettlementsByPeriod(selectedPeriod);
  
  const totalAmount = filteredSettlements.reduce((sum, settlement) => sum + settlement.amount, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'STRUCTURE_PREMIUM':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'EXERCISE_COST':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'ROLL_COST':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'STRUCTURE_PREMIUM':
        return 'Prêmio de Estrutura';
      case 'EXERCISE_COST':
        return 'Custo de Exercício';
      case 'ROLL_COST':
        return 'Custo de Rolagem';
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SETTLED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Liquidações Futuras
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Period Filter */}
          <div className="flex space-x-2 mb-6">
            {[
              { key: '7d', label: '7 dias' },
              { key: '30d', label: '30 dias' },
              { key: '90d', label: '90 dias' }
            ].map(period => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Total de liquidações nos próximos {selectedPeriod === '7d' ? '7 dias' : selectedPeriod === '30d' ? '30 dias' : '90 dias'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Quantidade</p>
                <p className="text-xl font-semibold text-gray-900">
                  {filteredSettlements.length} liquidações
                </p>
              </div>
            </div>
          </div>

          {/* Settlements List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSettlements.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Nenhuma liquidação encontrada para o período selecionado
                </p>
              </div>
            ) : (
              filteredSettlements.map(settlement => (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(settlement.type)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {settlement.description}
                      </p>
                      {settlement.structureName && (
                        <p className="text-sm text-gray-500">
                          {settlement.structureName}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {getTypeLabel(settlement.type)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(settlement.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(settlement.settlementDate).toLocaleDateString('pt-BR')}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(settlement.status)}`}>
                      {settlement.status === 'PENDING' ? 'Pendente' : 
                       settlement.status === 'CONFIRMED' ? 'Confirmado' : 'Liquidado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}