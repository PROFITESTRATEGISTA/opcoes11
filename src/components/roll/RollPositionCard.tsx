import React from 'react';
import { Calendar } from 'lucide-react';
import { OptionLeg } from '../../types/trading';
import { getNextExpirationDates, generateNextOptionCode } from '../../utils/expirationHelper';
import { getAvailableFuturesMonths, generateFuturesCode, getFuturesExpirationDate } from '../../utils/futuresCodes';

interface RollPositionCardProps {
  leg: OptionLeg;
  index: number;
  selectedAction: 'roll' | null;
  onActionChange: (action: 'roll' | null) => void;
  onNewLegChange: (newLeg: Partial<OptionLeg>) => void;
  newLeg?: Partial<OptionLeg>;
  exitPrice?: number;
  onExitPriceChange?: (exitPrice: number) => void;
}

export default function RollPositionCard({ 
  leg, 
  index, 
  selectedAction, 
  onActionChange, 
  onNewLegChange,
  newLeg,
  exitPrice = 0,
  onExitPriceChange
}: RollPositionCardProps) {
  console.log('RollPositionCard - leg:', leg);
  console.log('RollPositionCard - index:', index);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'CALL':
        return 'bg-blue-100 text-blue-800';
      case 'PUT':
        return 'bg-purple-100 text-purple-800';
      case 'WIN':
      case 'WDO':
      case 'BIT':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPosicaoColor = (posicao: string) => {
    return posicao === 'COMPRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Calcular lucro realizado
  const calculateRealizedProfit = () => {
    if (!exitPrice || exitPrice === 0) return 0;
    
    const entryPrice = leg.premio;
    let profit = 0;
    
    if (leg.posicao === 'COMPRADA') {
      // Opção comprada: lucro = (preço saída - preço entrada) * quantidade
      profit = (exitPrice - entryPrice) * leg.quantidade;
    } else {
      // Opção vendida: lucro = (preço entrada - preço saída) * quantidade
      profit = (entryPrice - exitPrice) * leg.quantidade;
    }
    
    return profit;
  };

  const realizedProfit = calculateRealizedProfit();
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white">
            {index + 1}
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoColor(leg.tipo)}`}>
              {leg.tipo}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPosicaoColor(leg.posicao)}`}>
              {leg.posicao}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Posição Original */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="font-semibold text-blue-300 mb-3">Posição Original</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-400">Ativo:</span>
              <span className="font-medium text-white">{leg.ativo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Strike:</span>
              <span className="font-medium text-white">{formatCurrency(leg.strike)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Preço de Entrada:</span>
              <span className="font-medium text-white">{formatCurrency(leg.premio)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Vencimento:</span>
              <span className="font-medium text-white">{formatDate(leg.vencimento)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Quantidade:</span>
              <span className="font-medium text-white">{leg.quantidade}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-400">Preço de Saída:</span>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={exitPrice || ''}
                  onChange={(e) => {
                    const newExitPrice = parseFloat(e.target.value) || 0;
                    onExitPriceChange?.(newExitPrice);
                    
                    // Auto-update repurchase cost for sold positions
                    if (leg.posicao === 'VENDIDA' && newExitPrice > 0) {
                      // Find the parent component's repurchase cost handler
                      const event = new CustomEvent('updateRepurchaseCost', {
                        detail: {
                          legId: leg.id,
                          exitPrice: newExitPrice,
                          quantity: leg.quantidade
                        }
                      });
                      window.dispatchEvent(event);
                    }
                  }}
                  placeholder="0,35"
                  className="w-40 px-4 py-3 text-lg font-medium bg-gray-800 border-2 border-gray-500 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:outline-none hover:border-gray-400 transition-colors"
                />
              </div>
            </div>
            {exitPrice > 0 && (
              <div className="mt-3 pt-3 border-t border-blue-500/30">
                <div className="flex justify-between">
                  <span className="text-blue-400 font-medium">Lucro Realizado:</span>
                  <span className={`font-bold ${realizedProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {realizedProfit >= 0 ? '+' : ''}{formatCurrency(realizedProfit)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {leg.posicao === 'COMPRADA' 
                    ? `(${formatCurrency(exitPrice)} - ${formatCurrency(leg.premio)}) × ${leg.quantidade}`
                    : `(${formatCurrency(leg.premio)} - ${formatCurrency(exitPrice)}) × ${leg.quantidade}`
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Seleção de Ação */}
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Ação da Rolagem</h4>
          
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                name={`action-${leg.id}`}
                value="roll"
                checked={selectedAction === 'roll'}
                onChange={() => onActionChange('roll')}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Rolar para novo vencimento</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="radio"
                name={`action-${leg.id}`}
                value="keep"
                checked={selectedAction === null}
                onChange={() => onActionChange(null)}
                className="mr-2"
              />
              <span className="text-sm text-gray-300">Manter posição atual</span>
            </label>
          </div>

          {selectedAction === 'roll' && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Novo Strike
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newLeg?.strike || ''}
                  onChange={(e) => onNewLegChange({ strike: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={(leg.strike * 1.05).toFixed(2)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Novo Prêmio
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newLeg?.premio || ''}
                  onChange={(e) => onNewLegChange({ premio: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder={(leg.premio * 0.8).toFixed(2)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {(leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') ? 
                    'Novo Vencimento do Futuro' : 
                    'Nova Data de Vencimento'
                  }
                </label>
                <div className="space-y-2">
                  {/* Quick selection buttons for next expirations */}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {(leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') ? 
                        'Selecione o próximo vencimento:' : 
                        'Selecione a próxima série:'
                      }
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {(leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') ? (
                      // Futuros: mostrar próximos vencimentos
                      getAvailableFuturesMonths().slice(0, 4).map((futuresOption, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const baseAsset = leg.ativo.replace(/[A-Z]\d+$/, ''); // Remove código de vencimento
                            const newCode = generateFuturesCode(baseAsset, futuresOption.month, futuresOption.year);
                            const vencimentoString = getFuturesExpirationDate(futuresOption.month, futuresOption.year);
                            
                            onNewLegChange({ 
                              vencimento: vencimentoString,
                              ativo: newCode,
                              selectedMonth: futuresOption.month,
                              selectedYear: futuresOption.year
                            });
                          }}
                          className="px-2 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                        >
                          {futuresOption.displayName.split(' ')[0].slice(0,3)}{futuresOption.code.slice(-2)}
                        </button>
                      ))
                    ) : (
                      // Opções: mostrar próximas séries
                      getNextExpirationDates(leg.vencimento, 3).map((exp, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            // Extract base asset from current option code
                            const baseAsset = leg.ativo.replace(/\d+$/, ''); // Remove TODOS os números finais
                            const expDate = new Date(exp.date);
                            const month = expDate.getMonth() + 1;
                            const year = expDate.getFullYear();
                            
                            // Generate new option code with correct month letter
                            const monthCode = leg.tipo === 'CALL' ? 
                              ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][month] :
                              ['', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'][month];
                            
                            const yearCode = year.toString().slice(-1);
                            const strikeCode = Math.round(newLeg?.strike || leg.strike).toString().padStart(2, '0');
                            const newCode = `${baseAsset}${monthCode}${yearCode}${strikeCode}`;
                            
                            onNewLegChange({ 
                              vencimento: exp.date,
                              ativo: newCode,
                              selectedMonth: new Date(exp.date).getMonth() + 1,
                              selectedYear: new Date(exp.date).getFullYear()
                            });
                          }}
                          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                        >
                          {exp.displayName}
                        </button>
                      ))
                    )}
                  </div>
                  
                  {newLeg?.vencimento && leg.tipo !== 'FUTUROS' && (
                    <div className="text-xs text-green-400 mt-1">
                      Novo código: {newLeg.ativo || 'Aguardando strike...'}
                    </div>
                  )}
                  
                  {newLeg?.vencimento && leg.tipo === 'FUTUROS' && (
                    <div className="text-xs text-orange-400 mt-1">
                      Novo código: {newLeg.ativo || 'Aguardando seleção...'}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Update option code when strike changes */}
              {leg.tipo !== 'FUTUROS' && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (newLeg?.strike && newLeg?.selectedMonth && newLeg?.selectedYear) {
                        const baseAsset = leg.ativo.replace(/\d+$/, ''); // Remove números finais
                        const monthCode = leg.tipo === 'CALL' ? 
                          ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][newLeg.selectedMonth] :
                          ['', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'][newLeg.selectedMonth];
                        
                        const yearCode = newLeg.selectedYear.toString().slice(-1);
                        const strikeCode = Math.round(newLeg.strike).toString().padStart(2, '0');
                        const newCode = `${baseAsset}${monthCode}${yearCode}${strikeCode}`;
                        
                        onNewLegChange({ ativo: newCode });
                      }
                    }}
                    className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                  >
                    Atualizar Código
                  </button>
                </div>
              )}
              
              {/* Update futures code when month/year changes */}
              {leg.tipo === 'FUTUROS' && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (newLeg?.selectedMonth && newLeg?.selectedYear) {
                        const baseAsset = leg.ativo.replace(/[A-Z]\d+$/, ''); // Remove código de vencimento
                        const newCode = generateFuturesCode(baseAsset, newLeg.selectedMonth, newLeg.selectedYear);
                        
                        onNewLegChange({ ativo: newCode });
                      }
                    }}
                    className="px-3 py-1 text-xs bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                  >
                    Atualizar Código do Futuro
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}