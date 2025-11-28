import React from 'react';
import { DollarSign, Plus, Shield, Calendar } from 'lucide-react';

interface TreasuryHeaderProps {
  onAddEntry: () => void;
  onManageAssets: () => void;
  onFutureSettlements?: () => void;
}

export default function TreasuryHeader({ onAddEntry, onManageAssets, onFutureSettlements }: TreasuryHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Tesouraria</h2>
          <p className="text-gray-400">Strategos Partners - Controle de fluxo de caixa e ativos</p>
        </div>
      </div>
      
      <div className="flex space-x-3">
        {onFutureSettlements && (
          <button
            onClick={onFutureSettlements}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Liquidações Futuras
          </button>
        )}
        <button
          onClick={onManageAssets}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Shield className="w-4 h-4 mr-2" />
          Gerenciar Ativos
        </button>
        <button
          onClick={onAddEntry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </button>
      </div>
    </div>
  );
}