import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { OptionLeg } from '../types/trading';
import { generateOptionCode, MONTH_NAMES } from '../utils/optionCodes';
import { generateFuturesCode, getFuturesExpirationDate, getAvailableFuturesMonths, FUTURES_MONTH_NAMES } from '../utils/futuresCodes';

interface LegFormProps {
  leg: OptionLeg;
  availableLegs: OptionLeg[];
  onUpdate: (field: keyof OptionLeg, value: any) => void;
  onAdd: () => void;
  onCancel: () => void;
}

export default function LegForm({ leg, availableLegs, onUpdate, onAdd, onCancel }: LegFormProps) {
  const [customMarginPercentage, setCustomMarginPercentage] = useState<number>(
    leg.customMarginPercentage || (leg.tipo === 'ACAO' ? 100 : 15)
  );
  
  // Estado para armazenar dados da CALL selecionada
  const [selectedCallData, setSelectedCallData] = useState<{
    call: OptionLeg;
    precoEntradaOriginal: number;
    ganhoMaximo: number;
  } | null>(leg.selectedCallData || null);

  // Reset selected call data when leg changes (for editing)
  React.useEffect(() => {
    // Sincronizar margem personalizada quando leg muda (para edição)
    if (leg.customMarginPercentage !== undefined) {
      setCustomMarginPercentage(leg.customMarginPercentage);
    } else {
      // Definir padrão baseado no tipo
      setCustomMarginPercentage(leg.tipo === 'ACAO' ? 100 : 15);
    }
    
    if (leg.selectedCallData) {
      setSelectedCallData(null);
    }
  }, [leg.id, leg.customMarginPercentage, leg.tipo]);

  // Atualizar a perna sempre que a margem mudar
  React.useEffect(() => {
    if (leg.posicao === 'VENDIDA') {
      onUpdate('customMarginPercentage', customMarginPercentage);
    }
  }, [customMarginPercentage, leg.posicao, onUpdate]);

  // Garantir que o preço de entrada seja exibido corretamente na edição
  const getDisplayPrecoEntrada = () => {
    return leg.precoEntrada || '';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateTaxa = () => {
    let divisor = 0;
    if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
      divisor = leg.precoVista || 0;
    } else if (leg.tipo === 'ACAO') {
      divisor = leg.precoEntrada || 0;
    } else {
      divisor = leg.strike || 0;
    }
    
    if (leg.premio && divisor && divisor > 0) {
      return ((leg.premio / divisor) * 100).toFixed(2);
    }
    return '0.00';
  };

  const calculateCustomMargin = () => {
    if (leg.posicao === 'VENDIDA') {
      if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
        return (leg.strike * leg.quantidade * customMarginPercentage) / 100;
      } else if (leg.tipo === 'ACAO') {
        return ((leg.precoEntrada || 0) * leg.quantidade * customMarginPercentage) / 100;
      }
    }
    return 0;
  };
  const handleMonthYearChange = (month: number, year: number) => {
    if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
      const baseAsset = leg.ativo.replace(/\d+$/, ''); // Remove números finais
      if (baseAsset && leg.strike) {
        const newCode = generateOptionCode(baseAsset, leg.tipo, month, year, leg.strike);
        onUpdate('ativo', newCode);
      }
      
      const vencimentoDate = new Date(year, month - 1, 15);
      const dayOfWeek = vencimentoDate.getDay();
      const daysToFriday = (5 - dayOfWeek + 7) % 7;
      vencimentoDate.setDate(15 + daysToFriday);
      const vencimentoString = vencimentoDate.toISOString().split('T')[0];

      onUpdate('vencimento', vencimentoString);
      onUpdate('selectedMonth', month);
      onUpdate('selectedYear', year);
    }
    
    if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
      const baseAsset = leg.ativo.replace(/[A-Z]\d+$/, ''); // Remove códigos de vencimento existentes
      if (baseAsset) {
        const newCode = generateFuturesCode(baseAsset, month, year);
        const vencimentoString = getFuturesExpirationDate(month, year);
        
        onUpdate('ativo', newCode);
        onUpdate('vencimento', vencimentoString);
      }
      
      onUpdate('selectedMonth', month);
      onUpdate('selectedYear', year);
    }
  };

  // Função para calcular e atualizar o ganho máximo
  const updateGanhoMaximo = (precoEntrada: number, callData?: any) => {
    if (leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') {
      const baseAsset = leg.ativo.replace(/[A-Z]$/, '');
      const availableCalls = availableLegs.filter((existingLeg) => 
        existingLeg.tipo === 'CALL' && 
        (existingLeg.ativo.startsWith(baseAsset) || existingLeg.ativo.replace(/[A-Z]\d+\d+$/, '') === baseAsset)
      );

      if (availableCalls.length > 0 || callData) {
        const selectedCall = callData || availableCalls[0];
        const ganhoMaximo = ((selectedCall.strike - precoEntrada) + selectedCall.premio) * Math.min(selectedCall.quantidade, leg.quantidade);
        
        const ganhoDisplay = document.getElementById(`ganho-display-${leg.id}`);
        if (ganhoDisplay) {
          ganhoDisplay.textContent = `Ganho Máximo: ${formatCurrency(ganhoMaximo)}`;
          ganhoDisplay.className = 'text-sm font-bold text-green-400 mt-2';
        }
      }
    }
  };

  // Effect para atualizar ganho quando preço de entrada mudar
  React.useEffect(() => {
    if (leg.tipo === 'ACAO' && leg.precoEntrada) {
      updateGanhoMaximo(leg.precoEntrada);
    }
  }, [leg.precoEntrada, leg.quantidade, availableLegs]);

  const handleAddLeg = () => {
    try {
      console.log('Adicionando perna:', leg);
      
      if (!leg.ativo.trim()) {
        alert('Por favor, informe o ativo');
        return;
      }

      const newLeg: OptionLeg = {
        ...leg,
        id: crypto.randomUUID(),
        ativo: leg.ativo.trim().toUpperCase(),
        customMarginPercentage: leg.posicao === 'VENDIDA' ? customMarginPercentage : undefined,
        // Para ações, definir vencimento como data muito distante se não informado
        vencimento: leg.vencimento || (leg.tipo === 'ACAO' ? '2099-12-31' : '')
      };

      onAdd();
    } catch (error) {
      console.error('Erro ao adicionar perna:', error);
      alert('Erro ao adicionar perna. Verifique os dados informados.');
    }
  };
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Adicionar Nova Perna</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Ativo</label>
          <select
            value={leg.tipo}
            onChange={(e) => onUpdate('tipo', e.target.value as any)}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="CALL">CALL</option>
            <option value="PUT">PUT</option>
            <option value="ACAO">AÇÃO</option>
            <option value="FUTUROS">FUTUROS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Posição</label>
          <select
            value={leg.posicao}
            onChange={(e) => onUpdate('posicao', e.target.value as any)}
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="COMPRADA">DÉBITO (Comprada)</option>
            <option value="VENDIDA">CRÉDITO (Vendida)</option>
          </select>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Ativo Base</label>
          <input
            type="text"
            value={leg.ativo}
            onChange={(e) => onUpdate('ativo', e.target.value.toUpperCase())}
            placeholder="PETR4"
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-2">Ativos Populares:</p>
            <div className="flex flex-wrap gap-1">
              {leg.tipo === 'FUTUROS' ? 
                ['WIN', 'WDO', 'BIT'].map(asset => (
                  <button
                    key={asset}
                    onClick={() => onUpdate('ativo', asset)}
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  >
                    {asset}
                  </button>
                )) :
                ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'MGLU3', 'WEGE3'].map(asset => (
                <button
                  key={asset}
                  onClick={() => onUpdate('ativo', asset)}
                  className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                >
                  {asset}
                </button>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Strike - apenas para opções */}
        {(leg.tipo === 'CALL' || leg.tipo === 'PUT') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Strike</label>
            <input
              type="number"
              step="0.01"
              value={leg.strike || ''}
              onChange={(e) => onUpdate('strike', parseFloat(e.target.value) || 0)}
              placeholder="25.50"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        {/* Preço Futuro - apenas para futuros */}
        {leg.tipo === 'FUTUROS' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preço Futuro
              {leg.ativo && (
                <span className="ml-2 text-xs text-blue-400">({leg.ativo})</span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              value={leg.precoVista || ''}
              onChange={(e) => onUpdate('precoVista', parseFloat(e.target.value) || 0)}
              placeholder="25.50"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
        
        {/* Preço de Entrada - apenas para ações */}
        {leg.tipo === 'ACAO' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preço de Entrada</label>
            <input
              type="number"
              step="0.01"
              value={leg.precoEntrada || ''}
              onChange={(e) => {
                onUpdate('precoEntrada', parseFloat(e.target.value) || 0);
              }}
              placeholder="25.50"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Prêmio - apenas para opções e futuros */}
        {leg.tipo !== 'ACAO' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prêmio
            </label>
            <input
              type="number"
              step="0.01"
              value={leg.premio || ''}
              onChange={(e) => onUpdate('premio', parseFloat(e.target.value) || 0)}
              placeholder="0.35"
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Margem Personalizada - apenas para operações vendidas */}
        {leg.posicao === 'VENDIDA' && (leg.tipo === 'CALL' || leg.tipo === 'PUT' || leg.tipo === 'ACAO') && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Margem (%)
              <span className="ml-2 text-xs text-orange-400">
                {leg.tipo === 'ACAO' ? 'Padrão: 100%' : 'Ex: 33% para ABEV3'}
              </span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="200"
              value={customMarginPercentage}
              onChange={(e) => setCustomMarginPercentage(parseFloat(e.target.value) || 15)}
              placeholder={leg.tipo === 'ACAO' ? '100.00' : '33.25'}
              className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              % do nocional (quantidade × strike × %) = Margem bloqueada
            </p>
            {leg.strike && leg.quantidade && customMarginPercentage > 0 && (
              <div className="mt-2 p-2 bg-orange-900/20 border border-orange-500/30 rounded text-xs">
                <div className="text-orange-300">
                  Cálculo: {leg.quantidade} × {formatCurrency(leg.strike)} × {customMarginPercentage}% = 
                  <span className="font-bold text-orange-400 ml-1">
                    {formatCurrency((leg.strike * leg.quantidade * customMarginPercentage) / 100)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Taxa - apenas para opções e futuros */}
        {leg.tipo !== 'ACAO' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Taxa (%)</label>
            <input
              type="text"
              value={`${calculateTaxa()}%`}
              disabled
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade</label>
          <input
            type="number"
            value={leg.quantidade || ''}
            onChange={(e) => onUpdate('quantidade', parseInt(e.target.value) || 1)}
            placeholder="1"
            className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Seleção de Vencimento - apenas para opções */}
      {(leg.tipo === 'CALL' || leg.tipo === 'PUT') && (
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-300">Seleção de Vencimento</label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Mês de Vencimento</label>
              <select
                value={leg.selectedMonth || ''}
                onChange={(e) => {
                  const month = parseInt(e.target.value);
                  onUpdate('selectedMonth', month);
                  if (month && leg.selectedYear) {
                    handleMonthYearChange(month, leg.selectedYear);
                  }
                }}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione o mês</option>
                {MONTH_NAMES.map((month, index) => (
                  <option key={index + 1} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Ano</label>
              <select
                value={leg.selectedYear || ''}
                onChange={(e) => {
                  const year = parseInt(e.target.value);
                  onUpdate('selectedYear', year);
                  if (leg.selectedMonth && year) {
                    handleMonthYearChange(leg.selectedMonth, year);
                  }
                }}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione o ano</option>
                {Array.from({length: 3}, (_, i) => new Date().getFullYear() + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Seleção de Vencimento - apenas para futuros */}
      {(leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && (
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-300">Vencimento do Contrato Futuro</label>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selecionar Vencimento do Contrato
                {leg.ativo && (
                  <span className="ml-2 text-xs text-orange-400">
                    Código Atual: {leg.ativo}
                  </span>
                )}
              </label>
              <select
                value={leg.selectedMonth && leg.selectedYear ? `${leg.selectedMonth}-${leg.selectedYear}` : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [month, year] = e.target.value.split('-').map(Number);
                    onUpdate('selectedMonth', month);
                    onUpdate('selectedYear', year);
                    handleMonthYearChange(month, year);
                  }
                }}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione o vencimento</option>
                {getAvailableFuturesMonths().map((option) => (
                  <option key={`${option.month}-${option.year}`} value={`${option.month}-${option.year}`}>
                    {option.displayName} - Código: {leg.ativo.replace(/[A-Z]\d+$/, '')}{option.code}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Vencimento na última quinta-feira do mês. Exemplo: WINZ25, WDOZ25
              </p>
            </div>
          </div>
          
          {leg.vencimento && (
            <div className="mt-3 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-orange-300">Data de Vencimento:</span>
                <span className="font-medium text-white">
                  {new Date(leg.vencimento).toLocaleDateString('pt-BR', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        {/* Calculadora de Nocional */}
        <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 mr-4">
          <h4 className="text-sm font-medium text-gray-300 mb-2">💰 Impacto na Tesouraria</h4>
          <div className="space-y-2 text-xs">
            {(() => {
              let impacto = 0;
              let descricao = '';
              let margemNecessaria = 0;
              
              if (leg.tipo === 'ACAO') {
                // Ação: valor investido (negativo no saldo)
                if (leg.posicao === 'COMPRADA') {
                  impacto = -(leg.precoEntrada || 0) * leg.quantidade;
                  descricao = `DÉBITO: Compra de ${leg.quantidade} lotes`;
                } else {
                  impacto = (leg.precoEntrada || 0) * leg.quantidade;
                  descricao = `CRÉDITO: Venda de ${leg.quantidade} lotes`;
                }
                
                // Calcular margem para ações vendidas
                if (leg.posicao === 'VENDIDA') {
                  margemNecessaria = calculateCustomMargin();
                }
              } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                if (leg.posicao === 'COMPRADA') {
                  // Opção comprada: prêmio pago (negativo no saldo)
                  impacto = -leg.premio * leg.quantidade;
                  descricao = `DÉBITO: Prêmio pago por ${leg.quantidade} lotes`;
                } else {
                  // Opção vendida: prêmio recebido (positivo no saldo)
                  impacto = leg.premio * leg.quantidade;
                  descricao = `CRÉDITO: Prêmio recebido por ${leg.quantidade} lotes`;
                  
                  // Calcular margem personalizada
                  margemNecessaria = calculateCustomMargin();
                }
              } else if (leg.tipo === 'FUTUROS') {
                if (leg.posicao === 'COMPRADA') {
                  // Futuro comprado: prêmio pago
                  impacto = -leg.premio * leg.quantidade;
                  descricao = `DÉBITO: Prêmio pago por ${leg.quantidade} contratos`;
                } else {
                  // Futuro vendido: prêmio recebido
                  impacto = leg.premio * leg.quantidade;
                  descricao = `CRÉDITO: Prêmio recebido por ${leg.quantidade} contratos`;
                }
              }
              
              return (
                <div>
                  <div className={`text-lg font-bold ${impacto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {impacto > 0 ? '+' : ''}{new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(impacto)}
                  </div>
                  <div className={`text-sm font-medium ${impacto >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {impacto >= 0 ? 'CRÉDITO' : 'DÉBITO'}
                  </div>
                  
                  {/* Margem necessária para operações vendidas */}
                  {leg.posicao === 'VENDIDA' && margemNecessaria > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-600">
                      <div className="text-orange-400 font-medium text-sm">
                        🛡️ Margem Bloqueada ({customMarginPercentage}%): {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(margemNecessaria)}
                      </div>
                      <div className="text-orange-300 text-xs">
                        Cálculo: {leg.quantidade} × {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'  
                        }).format(leg.tipo === 'ACAO' ? (leg.precoEntrada || 0) : leg.strike)} × {customMarginPercentage}%
                      </div>
                    </div>
                  )}
                  
                  {/* Valor nocional para referência */}
                  {(leg.strike || leg.precoEntrada || leg.precoVista) && (
                    <div className="mt-1 text-gray-500">
                      Nocional: {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format((leg.strike || leg.precoEntrada || leg.precoVista || 0) * leg.quantidade)}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
        
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleAddLeg}
          disabled={false}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}