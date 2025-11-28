import React, { useState } from 'react';
import { X, Target, Calculator, AlertTriangle, CheckCircle } from 'lucide-react';
import { OptionStructure, OptionLeg } from '../types/trading';

interface ExerciseOptionsModalProps {
  structure: OptionStructure;
  onConfirm: (exerciseData: any) => void;
  onCancel: () => void;
}

interface ExerciseOption {
  legId: string;
  leg: OptionLeg;
  willExercise: boolean;
  exercisePrice: number;
  exerciseCost: number;
  result: number;
}

export default function ExerciseOptionsModal({ structure, onConfirm, onCancel }: ExerciseOptionsModalProps) {
  const [exerciseOptions, setExerciseOptions] = useState<ExerciseOption[]>(() => {
    // Filtrar opções que podem ser exercidas (CALL/PUT compradas e vendidas)
    return structure.legs
      .filter(leg => leg.tipo === 'CALL' || leg.tipo === 'PUT')
      .map(leg => ({
        legId: leg.id,
        leg,
        willExercise: false,
        exercisePrice: leg.strike, // Preço de exercício = strike
        exerciseCost: (leg.strike * leg.quantidade * 0.0075), // Será recalculado com settings
        result: 0
      }));
  });

  const [observations, setObservations] = useState('');
  const [tradingSettings, setTradingSettings] = useState({
    exerciseFee: 0.0075 // 0.75% default
  });

  // Load trading settings
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTradingSettings(prev => ({ ...prev, exerciseFee: settings.exerciseFee || 0.0075 }));
      
      // Update exercise costs with loaded settings
      setExerciseOptions(prev => prev.map(option => ({
        ...option,
        exerciseCost: (option.leg.strike || 0) * option.leg.quantidade * (settings.exerciseFee || 0.0075)
      })));
    }
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const updateExerciseOption = (legId: string, field: keyof ExerciseOption, value: any) => {
    setExerciseOptions(prev => prev.map(option => {
      if (option.legId === legId) {
        const updated = { ...option, [field]: value };
        
        // Recalcular resultado quando exercisePrice muda
        if (field === 'exercisePrice' || field === 'willExercise') {
          if (updated.willExercise) {
            const leg = updated.leg;
            let result = 0;
            
            if (leg.tipo === 'CALL') {
              if (leg.posicao === 'COMPRADA') {
                // CALL comprada: ganho se preço atual > strike
                result = Math.max(0, updated.exercisePrice - (leg.strike || 0)) * leg.quantidade - ((leg.strike || 0) * leg.quantidade * tradingSettings.exerciseFee);
              } else {
                // CALL vendida: perda se preço atual > strike (exercida contra nós)
                result = -Math.max(0, updated.exercisePrice - (leg.strike || 0)) * leg.quantidade - ((leg.strike || 0) * leg.quantidade * tradingSettings.exerciseFee);
              }
            } else if (leg.tipo === 'PUT') {
              if (leg.posicao === 'COMPRADA') {
                // PUT comprada: ganho se preço atual < strike
                result = Math.max(0, (leg.strike || 0) - updated.exercisePrice) * leg.quantidade - ((leg.strike || 0) * leg.quantidade * tradingSettings.exerciseFee);
              } else {
                // PUT vendida: perda se preço atual < strike (exercida contra nós)
                result = -Math.max(0, (leg.strike || 0) - updated.exercisePrice) * leg.quantidade - ((leg.strike || 0) * leg.quantidade * tradingSettings.exerciseFee);
              }
            }
            
            updated.result = result;
          } else {
            updated.result = 0;
          }
        }
        
        return updated;
      }
      return option;
    }));
  };

  const totalExerciseCost = exerciseOptions
    .filter(option => option.willExercise)
    .reduce((sum, option) => sum + ((option.leg.strike || 0) * option.leg.quantidade * tradingSettings.exerciseFee), 0);

  const totalResult = exerciseOptions
    .filter(option => option.willExercise)
    .reduce((sum, option) => sum + option.result, 0);

  const selectedCount = exerciseOptions.filter(option => option.willExercise).length;

  const handleConfirm = () => {
    const exerciseData = {
      structureId: structure.id,
      exerciseDate: new Date().toISOString().split('T')[0],
      options: exerciseOptions.filter(option => option.willExercise),
      totalCost: totalExerciseCost,
      totalResult,
      observations
    };

    onConfirm(exerciseData);
  };

  if (exerciseOptions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Target className="w-8 h-8 mr-3" />
                <div>
                  <h2 className="text-xl font-bold">Exercício de Opções</h2>
                  <p className="text-purple-100">{structure.nome}</p>
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

          <div className="p-6">
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma Opção Exercível</h3>
              <p className="text-gray-400 mb-4">
                Esta estrutura não possui opções compradas que possam ser exercidas.
              </p>
              <p className="text-sm text-gray-500">
                CALLs e PUTs (compradas ou vendidas) podem ser exercidas.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Exercício de Opções</h2>
                <p className="text-purple-100">{structure.nome}</p>
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

        <div className="p-6">
          {/* Summary */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{exerciseOptions.length}</div>
                <div className="text-sm text-gray-400">Opções Disponíveis</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{selectedCount}</div>
                <div className="text-sm text-gray-400">Selecionadas</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${totalResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(totalResult)}
                </div>
                <div className="text-sm text-gray-400">Resultado Estimado</div>
              </div>
            </div>
          </div>

          {/* Options List */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-white">Opções Exercíveis</h3>
            
            {exerciseOptions.map((option) => (
              <div key={option.legId} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={option.willExercise}
                        onChange={(e) => updateExerciseOption(option.legId, 'willExercise', e.target.checked)}
                        className="mr-2 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-white font-medium">Exercer esta opção</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      option.leg.tipo === 'CALL' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {option.leg.tipo}
                    </span>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {option.leg.posicao}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option Info */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-purple-300">Dados da Opção</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ativo:</span>
                        <span className="text-white font-medium">{option.leg.ativo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Strike:</span>
                        <span className="text-white font-medium">{formatCurrency(option.leg.strike)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Vencimento:</span>
                        <span className="text-white font-medium">{formatDate(option.leg.vencimento)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantidade:</span>
                        <span className="text-white font-medium">{option.leg.quantidade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prêmio Pago:</span>
                        <span className={`font-medium ${
                          option.leg.posicao === 'COMPRADA' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {option.leg.posicao === 'COMPRADA' ? '-' : '+'}{formatCurrency(option.leg.premio)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Exercise Settings */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-purple-300">Configurações do Exercício</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Preço de Exercício
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={option.exercisePrice}
                          onChange={(e) => updateExerciseOption(option.legId, 'exercisePrice', parseFloat(e.target.value) || 0)}
                          disabled={!option.willExercise}
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Preço atual do ativo subjacente
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Custo de Exercício
                        </label>
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={formatCurrency((option.leg.strike || 0) * option.leg.quantidade * tradingSettings.exerciseFee)}
                            disabled
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-300 cursor-not-allowed"
                          />
                          <p className="text-xs text-gray-500">
                            {(tradingSettings.exerciseFee * 100).toFixed(3)}% × {formatCurrency(option.leg.strike || 0)} × {option.leg.quantidade}
                          </p>
                        </div>
                      </div>

                      {option.willExercise && (
                        <div className="bg-gray-800 border border-gray-600 rounded p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Resultado Estimado:</span>
                            <span className={`text-lg font-bold ${option.result >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {option.result >= 0 ? '+' : ''}{formatCurrency(option.result)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {(() => {
                              if (option.leg.tipo === 'CALL') {
                                if (option.leg.posicao === 'COMPRADA') {
                                  return `Max(0, ${formatCurrency(option.exercisePrice)} - ${formatCurrency(option.leg.strike)}) × ${option.leg.quantidade} - ${formatCurrency(option.exerciseCost)}`;
                                } else {
                                  return `-Max(0, ${formatCurrency(option.exercisePrice)} - ${formatCurrency(option.leg.strike)}) × ${option.leg.quantidade} - ${formatCurrency(option.exerciseCost)}`;
                                }
                              } else {
                                if (option.leg.posicao === 'COMPRADA') {
                                  return `Max(0, ${formatCurrency(option.leg.strike)} - ${formatCurrency(option.exercisePrice)}) × ${option.leg.quantidade} - ${formatCurrency(option.exerciseCost)}`;
                                } else {
                                  return `-Max(0, ${formatCurrency(option.leg.strike)} - ${formatCurrency(option.exercisePrice)}) × ${option.leg.quantidade} - ${formatCurrency(option.exerciseCost)}`;
                                }
                              }
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Observations */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Observações (Opcional)
            </label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Observações sobre o exercício das opções..."
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Summary */}
          {selectedCount > 0 && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <h4 className="font-medium text-white">Resumo do Exercício</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-400">{selectedCount}</div>
                  <div className="text-sm text-gray-400">Opções Selecionadas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-400">{formatCurrency(totalExerciseCost)}</div>
                  <div className="text-sm text-gray-400">Custo Total</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${totalResult >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalResult >= 0 ? '+' : ''}{formatCurrency(totalResult)}
                  </div>
                  <div className="text-sm text-gray-400">Resultado Líquido</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedCount === 0}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Target className="w-4 h-4 mr-2" />
              Exercer {selectedCount > 0 ? `${selectedCount} Opção${selectedCount > 1 ? 'ões' : ''}` : 'Opções'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}