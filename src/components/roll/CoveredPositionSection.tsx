import React, { useState, useEffect } from 'react';
import { OptionStructure, OptionLeg } from '../../types/trading';

interface CoveredPositionSectionProps {
  structure: OptionStructure;
  rollableLegs: OptionLeg[];
  coveredPositions: {[key: string]: {
    hasCoveredPosition: boolean;
    stockQuantity: number;
    entryPrice: number;
    optionQuantity: number;
    strike: number;
  }};
  onCoveredPositionChange: (legId: string, data: {
    hasCoveredPosition: boolean;
    stockQuantity: number;
    entryPrice: number;
    optionQuantity: number;
    strike: number;
  }) => void;
}

export default function CoveredPositionSection({ 
  structure, 
  rollableLegs, 
  coveredPositions, 
  onCoveredPositionChange 
}: CoveredPositionSectionProps) {
  const [tradingSettings, setTradingSettings] = useState({
    defaultBrokerageFee: 2.50,
    emolumentRate: 0.0025,
    exerciseFee: 0.0075
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      setTradingSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Auto-detect covered positions on mount
  useEffect(() => {
    rollableLegs.forEach(leg => {
      if (leg.tipo === 'CALL' && leg.posicao === 'VENDIDA') {
        const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
        
        // Find corresponding stock position in structure
        const stockPosition = structure.legs.find(structureLeg => 
          structureLeg.tipo === 'ACAO' && 
          structureLeg.posicao === 'COMPRADA' && 
          (structureLeg.ativo === baseAsset || 
           structureLeg.ativo === structure.ativo ||
           structureLeg.ativo.startsWith(baseAsset))
        );

        if (stockPosition) {
          const entryPrice = stockPosition.selectedCallData?.precoEntradaOriginal || 
                           stockPosition.precoEntrada || 
                           0;
          
          onCoveredPositionChange(leg.id, {
            hasCoveredPosition: true,
            stockQuantity: stockPosition.quantidade,
            entryPrice: entryPrice,
            optionQuantity: leg.quantidade,
            strike: leg.strike
          });
        }
      }
    });
  }, [rollableLegs, structure, onCoveredPositionChange]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const callsVendidas = rollableLegs.filter(leg => leg.tipo === 'CALL' && leg.posicao === 'VENDIDA');

  if (callsVendidas.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Posições Cobertas</h3>
      <p className="text-sm text-gray-300 mb-6">
        Configure as posições em ações que cobrem suas CALLs vendidas
      </p>

      <div className="space-y-6">
        {callsVendidas.map(leg => {
          const position = coveredPositions[leg.id] || {
            hasCoveredPosition: false,
            stockQuantity: 0,
            entryPrice: 0,
            optionQuantity: leg.quantidade,
            strike: leg.strike
          };

          const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
          const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/\d+$/, '');
          const isAutoDetected = position.hasCoveredPosition && position.stockQuantity > 0;

          return (
            <div key={leg.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">
                  CALL {leg.ativo} - Strike {formatCurrency(leg.strike)}
                </h4>
                {isAutoDetected && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Auto-detectado
                  </span>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={position.hasCoveredPosition}
                    onChange={(e) => onCoveredPositionChange(leg.id, {
                      ...position,
                      hasCoveredPosition: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <span className="text-gray-300">Possuo posição coberta em {structure.ativo || baseAsset}</span>
                </label>

                {position.hasCoveredPosition && (
                  <div className="border-t border-gray-600 pt-3">
                    <div className="bg-gray-800 border border-gray-600 rounded p-3">
                      <h5 className="font-medium text-white mb-3">Dados da Posição Coberta</h5>
                      
                      {/* Dados da Opção (somente leitura) */}
                      <div className="mb-3 p-2 bg-gray-700 rounded border border-gray-600">
                        <h6 className="text-xs font-medium text-purple-400 mb-2">Dados da Opção:</h6>
                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                          <div>Contratos: {position.optionQuantity}</div>
                          <div>Strike: {formatCurrency(position.strike)}</div>
                        </div>
                      </div>

                      {/* Dados das Ações */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Qtd Ações
                          </label>
                          <input
                            type="number"
                            value={position.stockQuantity}
                            onChange={(e) => onCoveredPositionChange(leg.id, {
                              ...position,
                              stockQuantity: parseInt(e.target.value) || 0
                            })}
                            className="w-full p-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-300 mb-1">
                            Preço Entrada
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={position.entryPrice}
                            onChange={(e) => onCoveredPositionChange(leg.id, {
                              ...position,
                              entryPrice: parseFloat(e.target.value) || 0
                            })}
                            className="w-full p-2 text-sm bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500"
                            placeholder="25.50"
                          />
                        </div>
                      </div>

                      {position.stockQuantity > 0 && position.entryPrice > 0 && (
                        <div className="mt-3 p-2 bg-gray-700 rounded border border-gray-600 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300">Valor Total Investido:</span>
                            <span className="font-bold text-white">
                              {formatCurrency(position.stockQuantity * position.entryPrice)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}