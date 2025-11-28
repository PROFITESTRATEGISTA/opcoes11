import React, { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { OptionStructure, OptionLeg, RollPosition } from '../types/trading';
import RollHeader from './roll/RollHeader';
import RollPositionCard from './roll/RollPositionCard';
import RollCostsSection from './roll/RollCostsSection';
import RollSummary from './roll/RollSummary';

interface RollManagerProps {
  structure: OptionStructure;
  onSaveRoll: (rollData: RollPosition) => void;
  onCancel: () => void;
}

export default function RollManager({ structure, onSaveRoll, onCancel }: RollManagerProps) {
  // All legs are rollable - no filtering needed
  const rollableLegs = React.useMemo(() => {
    console.log('RollManager - structure.legs:', structure.legs);
    console.log('RollManager - rollableLegs count:', structure.legs.length);
    return structure.legs;
  }, [structure.legs]);

  const [rollActions, setRollActions] = useState<{[key: string]: 'roll' | 'exercise' | null}>({});
  const [newLegs, setNewLegs] = useState<{[key: string]: Partial<OptionLeg>}>({});
  const [exitPrices, setExitPrices] = useState<{[key: string]: number}>({});
  const [brokerageFee, setBrokerageFee] = useState(0);
  const [repurchaseCosts, setRepurchaseCosts] = useState<{[key: string]: number}>({});
  const [rollReason, setRollReason] = useState('');
  const [observations, setObservations] = useState('');
  const [tradingSettings, setTradingSettings] = useState({
    defaultBrokerageFee: 2.50,
    emolumentRate: 0.0025,
    exerciseFee: 0.0075
  });

  // Load trading settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      setTradingSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Initialize exit prices and repurchase costs
  useEffect(() => {
    const initialExitPrices: {[key: string]: number} = {};
    const initialRepurchaseCosts: {[key: string]: number} = {};
    rollableLegs.forEach(leg => {
      if (!exitPrices[leg.id]) {
        initialExitPrices[leg.id] = 0.01;
      }
      if (!repurchaseCosts[leg.id]) {
        initialRepurchaseCosts[leg.id] = 0;
      }
    });
    if (Object.keys(initialExitPrices).length > 0) {
      setExitPrices(prev => ({ ...prev, ...initialExitPrices }));
    }
    if (Object.keys(initialRepurchaseCosts).length > 0) {
      setRepurchaseCosts(prev => ({ ...prev, ...initialRepurchaseCosts }));
    }
  }, [rollableLegs]);

  // Auto-update repurchase costs when exit prices change
  useEffect(() => {
    const updatedRepurchaseCosts: {[key: string]: number} = {};
    
    rollableLegs.forEach(leg => {
      if (leg.posicao === 'VENDIDA') {
        const exitPrice = exitPrices[leg.id] || 0;
        if (exitPrice > 0) {
          updatedRepurchaseCosts[leg.id] = exitPrice * leg.quantidade;
        }
      }
    });
    
    // Only update if there are changes
    const hasChanges = Object.keys(updatedRepurchaseCosts).some(legId => 
      updatedRepurchaseCosts[legId] !== repurchaseCosts[legId]
    );
    
    if (hasChanges) {
      setRepurchaseCosts(prev => ({ ...prev, ...updatedRepurchaseCosts }));
    }
  }, [exitPrices, rollableLegs]);

  // Calculate total roll cost
  useEffect(() => {
    // Total repurchase costs for sold positions being closed
    const totalRepurchaseCosts = Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0);
    
    // Calculate emoluments on repurchase volume
    const repurchaseVolume = rollableLegs.reduce((sum, leg) => {
      const repurchaseCost = repurchaseCosts[leg.id] || 0;
      return sum + repurchaseCost;
    }, 0);
    const emoluments = repurchaseVolume * tradingSettings.emolumentRate;
    
    // Total cost = brokerage (optional) + repurchase costs + emoluments
    const totalCost = brokerageFee + totalRepurchaseCosts + emoluments;
    
    console.log('Roll Cost Calculation:', {
      brokerageFee,
      totalRepurchaseCosts,
      emoluments,
      totalCost
    });
  }, [rollableLegs, repurchaseCosts, brokerageFee, tradingSettings]);

  const handleActionChange = (legId: string, action: 'roll' | null) => {
    console.log('Mudando ação para leg:', legId, 'nova ação:', action);
    setRollActions(prev => ({ ...prev, [legId]: action }));
    
    // Se não for roll, limpar dados da nova perna
    if (action !== 'roll') {
      setNewLegs(prev => {
        const updated = { ...prev };
        delete updated[legId];
        return updated;
      });
    }
  };

  const handleNewLegChange = (legId: string, newLegData: Partial<OptionLeg>) => {
    console.log('Atualizando dados da nova perna:', legId, newLegData);
    setNewLegs(prev => ({
      ...prev,
      [legId]: { ...prev[legId], ...newLegData }
    }));
  };

  const handleExitPriceChange = (legId: string, exitPrice: number) => {
    setExitPrices(prev => ({ ...prev, [legId]: exitPrice }));
    
    // Auto-update repurchase cost for sold positions
    const leg = rollableLegs.find(l => l.id === legId);
    if (leg && leg.posicao === 'VENDIDA' && exitPrice > 0) {
      const totalRepurchaseCost = exitPrice * leg.quantidade;
      setRepurchaseCosts(prev => ({ ...prev, [legId]: totalRepurchaseCost }));
    }
  };

  const calculateRealizedProfit = () => {
    let profit = 0;
    
    rollableLegs.forEach(leg => {
      const action = rollActions[leg.id];
      const exitPrice = exitPrices[leg.id] || 0;
      
      if (action === 'roll') {
        // Calcular lucro baseado no preço de saída informado
        if (exitPrice > 0) {
          if (leg.posicao === 'COMPRADA') {
            profit += (exitPrice - leg.premio) * leg.quantidade;
          } else {
            profit += (leg.premio - exitPrice) * leg.quantidade;
          }
        }
      }
    });
    
    return profit;
  };

  const handleSaveRoll = () => {
    const originalLegs = rollableLegs;
    const finalNewLegs: OptionLeg[] = [];
    
    console.log('Salvando roll - originalLegs:', originalLegs);
    console.log('Salvando roll - rollActions:', rollActions);
    console.log('Salvando roll - newLegs:', newLegs);

    // Validar se há pelo menos uma ação de roll selecionada
    const hasRollActions = Object.values(rollActions).some(action => action === 'roll');
    if (!hasRollActions) {
      alert('Por favor, selecione pelo menos uma posição para rolar.');
      return;
    }

    // Validar se todas as posições selecionadas para roll têm dados completos
    let hasIncompleteData = false;
    const rollValidationErrors: string[] = [];
    
    rollableLegs.forEach(leg => {
      const action = rollActions[leg.id];
      if (action === 'roll') {
        const newLegData = newLegs[leg.id];
        if (!newLegData) {
          rollValidationErrors.push(`${leg.ativo}: Dados da nova posição não informados`);
          hasIncompleteData = true;
        } else {
          if (!newLegData.strike || newLegData.strike <= 0) {
            rollValidationErrors.push(`${leg.ativo}: Strike da nova posição é obrigatório`);
            hasIncompleteData = true;
          }
          if (!newLegData.premio || newLegData.premio <= 0) {
            rollValidationErrors.push(`${leg.ativo}: Prêmio da nova posição é obrigatório`);
            hasIncompleteData = true;
          }
          if (!newLegData.vencimento) {
            rollValidationErrors.push(`${leg.ativo}: Vencimento da nova posição é obrigatório`);
            hasIncompleteData = true;
          }
        }
      }
    });

    if (hasIncompleteData) {
      alert(`Dados incompletos para rolagem:\n\n${rollValidationErrors.join('\n')}`);
      return;
    }
    // Build new legs based on roll actions
    rollableLegs.forEach(leg => {
      const action = rollActions[leg.id];
      if (action === 'roll') {
        const newLegData = newLegs[leg.id];
        if (newLegData?.strike && newLegData?.premio && newLegData?.vencimento) {
          // Generate correct option code if not already set
          let newAtivo = newLegData.ativo;
          if (!newAtivo && newLegData.selectedMonth && newLegData.selectedYear) {
            const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
            const monthCode = leg.tipo === 'CALL' ? 
              ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][newLegData.selectedMonth] :
              ['', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'][newLegData.selectedMonth];
            
            const yearCode = newLegData.selectedYear.toString().slice(-1);
            const strikeCode = Math.round(newLegData.strike).toString().padStart(2, '0');
            newAtivo = `${baseAsset}${monthCode}${yearCode}${strikeCode}`;
          }
          
          finalNewLegs.push({
            ...leg,
            id: leg.id, // Keep same ID to maintain reference
            ativo: newAtivo || leg.ativo,
            strike: newLegData.strike,
            premio: newLegData.premio,
            vencimento: newLegData.vencimento,
            selectedMonth: newLegData.selectedMonth,
            selectedYear: newLegData.selectedYear
          });
        }
      } else {
        // If not rolling, keep original leg
        finalNewLegs.push(leg);
      }
    });

    // Validar se temos pernas finais para processar
    if (finalNewLegs.length === 0) {
      alert('Erro: Nenhuma posição válida para processar a rolagem.');
      return;
    }
    const rollData: RollPosition = {
      id: crypto.randomUUID(),
      structureId: structure.id!,
      originalLegs,
      newLegs: finalNewLegs,
      dataRoll: new Date().toISOString().split('T')[0],
      custoRoll: brokerageFee + Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) + (Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) * tradingSettings.emolumentRate),
      motivoRoll: rollReason || 'Motivo não especificado',
      status: 'EXECUTADO',
      lucroRealizado: calculateRealizedProfit(),
      observacoes: observations || undefined
    };

    console.log('Roll data criado:', rollData);
    
    // Confirmar execução da rolagem
    const totalRollCost = brokerageFee + Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) + (Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) * tradingSettings.emolumentRate);
    const confirmMessage = `Confirmar execução da rolagem?\n\n` +
      `Estrutura: ${structure.nome}\n` +
      `Posições a rolar: ${Object.values(rollActions).filter(a => a === 'roll').length}\n` +
      `Custo total: R$ ${totalRollCost.toFixed(2)}\n` +
      `Lucro realizado: R$ ${calculateRealizedProfit().toFixed(2)}`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }
    
    onSaveRoll(rollData);
  };

  const totalCost = brokerageFee + Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) + (Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) * tradingSettings.emolumentRate);
  const realizedProfit = calculateRealizedProfit();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-gray-700">
        <RollHeader structure={structure} onCancel={onCancel} />
        
        <div className="p-6 text-white">
          <div className="space-y-6">
            {/* Roll Positions */}
            <div>
              <h3 className="text-lg font-semibold text-white bg-blue-600 px-4 py-2 rounded-lg mb-4">
                Posições para Rolagem ({rollableLegs?.length || 0})
              </h3>
              {rollableLegs.length === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
                  <p className="text-yellow-300">⚠️ Nenhuma posição encontrada na estrutura</p>
                  <p className="text-yellow-400 text-sm mt-1">
                    Estrutura: {structure.nome} | Pernas: {structure.legs?.length || 0}
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {rollableLegs.map((leg, index) => (
                  <RollPositionCard
                    key={leg.id}
                    leg={leg}
                    index={index}
                    selectedAction={rollActions[leg.id] || null}
                    onActionChange={(action) => handleActionChange(leg.id, action)}
                    onNewLegChange={(newLegData) => handleNewLegChange(leg.id, newLegData)}
                    newLeg={newLegs[leg.id]}
                    exitPrice={exitPrices[leg.id] || 0}
                    onExitPriceChange={(exitPrice) => handleExitPriceChange(leg.id, exitPrice)}
                  />
                ))}
              </div>
            </div>

            {/* Costs */}
            <RollCostsSection
              originalLegs={rollableLegs}
              newLegs={Object.values(newLegs).filter(leg => leg.strike && leg.premio) as OptionLeg[]}
              brokerageFee={brokerageFee}
              onBrokerageFeeChange={setBrokerageFee}
              repurchaseCosts={repurchaseCosts}
              onRepurchaseCostChange={(legId, cost) => setRepurchaseCosts(prev => ({ ...prev, [legId]: cost }))}
              emoluments={Object.values(repurchaseCosts).reduce((sum, cost) => sum + cost, 0) * tradingSettings.emolumentRate}
            />

            {/* Roll Details */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Detalhes da Rolagem</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivo da Rolagem (Opcional)
                  </label>
                  <select
                    value={rollReason}
                    onChange={(e) => setRollReason(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione um motivo (opcional)</option>
                    <option value="Ajuste de strike devido à movimentação do ativo">Ajuste de strike devido à movimentação do ativo</option>
                    <option value="Extensão de prazo para melhor posicionamento">Extensão de prazo para melhor posicionamento</option>
                    <option value="Aproveitamento de volatilidade favorável">Aproveitamento de volatilidade favorável</option>
                    <option value="Realização de lucros parciais">Realização de lucros parciais</option>
                    <option value="Proteção contra movimento adverso">Proteção contra movimento adverso</option>
                    <option value="Otimização de prêmios recebidos">Otimização de prêmios recebidos</option>
                    <option value="Ajuste de exposição ao risco">Ajuste de exposição ao risco</option>
                    <option value="Mudança de cenário macroeconômico">Mudança de cenário macroeconômico</option>
                    <option value="Estratégia de gestão de portfólio">Estratégia de gestão de portfólio</option>
                    <option value="Outro motivo">Outro motivo</option>
                  </select>
                  
                  {rollReason === 'Outro motivo' && (
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Descreva o motivo específico..."
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                      rows={2}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Observações (Opcional)
                  </label>
                  <textarea
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Observações adicionais sobre a rolagem..."
                    className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <RollSummary
              originalLegs={rollableLegs}
              newLegs={Object.values(newLegs).filter(leg => leg.strike && leg.premio) as OptionLeg[]}
              totalCost={totalCost}
              realizedProfit={realizedProfit}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveRoll}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                Executar Rolagem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}