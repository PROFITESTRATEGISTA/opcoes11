import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import { OptionLeg } from '../../types/trading';

interface RollCostsSectionProps {
  originalLegs: OptionLeg[];
  newLegs: OptionLeg[];
  brokerageFee: number;
  onBrokerageFeeChange: (fee: number) => void;
  repurchaseCosts: {[key: string]: number};
  onRepurchaseCostChange: (legId: string, cost: number) => void;
  emoluments: number;
}

export default function RollCostsSection({ 
  originalLegs, 
  newLegs, 
  brokerageFee,
  onBrokerageFeeChange,
  repurchaseCosts,
  onRepurchaseCostChange,
  emoluments
}: RollCostsSectionProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRepurchaseCosts = Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0);
  const totalCost = brokerageFee + totalRepurchaseCosts + emoluments;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <Calculator className="w-5 h-5 text-gray-300 mr-2" />
        <h3 className="text-lg font-semibold text-white">Custos da Rolagem</h3>
      </div>

      <div className="space-y-4">
        {/* Corretagem (Opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Corretagem (Opcional)
          </label>
          <input
            type="number"
            step="0.01"
            value={brokerageFee}
            onChange={(e) => onBrokerageFeeChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">
            Taxa de corretagem para a rolagem (padrão: R$ 0,00)
          </p>
        </div>

        {/* Custos de Recompra por Posição */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Custos de Recompra das Posições Vendidas
          </label>
          <div className="space-y-3">
            {originalLegs
              .filter(leg => leg.posicao === 'VENDIDA')
              .map(leg => (
              <div key={leg.id} className="bg-gray-800 border border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded ${
                      leg.tipo === 'CALL' ? 'bg-green-500/20 text-green-400' :
                      leg.tipo === 'PUT' ? 'bg-red-500/20 text-red-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {leg.tipo}
                    </span>
                    <span className="text-white font-medium">{leg.ativo}</span>
                    <span className="text-gray-400">x{leg.quantidade}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Vendido por:</p>
                    <p className="text-green-400 font-medium">{formatCurrency(leg.premio)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Preço de Recompra (Auto)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={repurchaseCosts[leg.id] ? (repurchaseCosts[leg.id] / leg.quantidade).toFixed(2) : ''}
                      disabled
                      className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-gray-300 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Baseado no preço de saída acima
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Custo Total
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(repurchaseCosts[leg.id] || 0)}
                      disabled
                      className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {leg.quantidade} × preço unitário
                    </p>
                  </div>
                </div>
                
                {repurchaseCosts[leg.id] > 0 && (
                  <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-red-300">Lucro/Prejuízo na Posição:</span>
                      <span className={`font-bold ${
                        (leg.premio * leg.quantidade - repurchaseCosts[leg.id]) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(leg.premio * leg.quantidade - repurchaseCosts[leg.id])}
                      </span>
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      Vendido: {formatCurrency(leg.premio * leg.quantidade)} - Recomprado: {formatCurrency(repurchaseCosts[leg.id])}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {originalLegs.filter(leg => leg.posicao === 'VENDIDA').length === 0 && (
              <div className="text-center py-4 text-gray-400">
                <p className="text-sm">Nenhuma posição vendida para recomprar</p>
              </div>
            )}
          </div>
        </div>
        {/* Breakdown dos Custos */}
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4">
          <h4 className="font-medium text-white mb-3">Breakdown dos Custos</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Corretagem:</span>
              <span className="text-white font-medium">{formatCurrency(brokerageFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Recompra de Posições:</span>
              <span className="text-white font-medium">{formatCurrency(totalRepurchaseCosts)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Emolumentos (0,25%):</span>
              <span className="text-white font-medium">{formatCurrency(emoluments)}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-blue-300 font-medium">Total:</span>
                <span className="text-blue-400 font-bold text-lg">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}