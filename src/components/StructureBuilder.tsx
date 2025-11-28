import React, { useState, useEffect } from 'react';
import { X, Save, Plus, ShoppingCart, BarChart3, Calculator } from 'lucide-react';
import { OptionStructure, OptionLeg } from '../types/trading';
import StructureHeader from './StructureHeader';
import StructureForm from './StructureForm';
import StructureTemplates from './StructureTemplates';
import StructureSummaryCards from './StructureSummaryCards';
import LegForm from './LegForm';
import LegsList from './LegsList';
import { supabase } from '../lib/supabase';

// Utility function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

interface StructureBuilderProps {
  onSave: (structure: OptionStructure) => void;
  onCancel: () => void;
  editingStructure?: OptionStructure;
}

export default function StructureBuilder({ onSave, onCancel, editingStructure }: StructureBuilderProps) {
  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState('');
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [showLegForm, setShowLegForm] = useState(false);
  const [editingLegIndex, setEditingLegIndex] = useState<number | null>(null);
  const [treasuryData, setTreasuryData] = useState({
    currentBalance: 0,
    totalGuaranteeAvailable: 0,
    loading: true
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentLeg, setCurrentLeg] = useState<OptionLeg>({
    id: '',
    tipo: 'CALL',
    strike: 0,
    vencimento: '',
    premio: 0,
    quantidade: 1,
    posicao: 'COMPRADA',
    ativo: '',
    selectedMonth: undefined,
    selectedYear: undefined
  });

  // Load treasury data using the exact same logic as TreasuryPanel
  useEffect(() => {
    loadTreasuryData();
  }, []);

  const loadTreasuryData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Load cash flow entries - usar a mesma lógica do TreasuryPanel
      const { data: cashFlowData } = await supabase
        .from('cash_flow_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      // 2. Load assets from custody - usar a mesma lógica do TreasuryPanel
      const { data: assetsData } = await supabase
        .from('assets_custody')
        .select('*')
        .eq('user_id', user.id);

      // 3. Load active structures - usar a mesma lógica do TreasuryPanel
      const { data: structuresData } = await supabase
        .from('structures')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ATIVA');

      // 4. Calculate Caixa Livre - EXATAMENTE como no TreasuryPanel
      const currentBalance = cashFlowData?.length > 0 
        ? Number(cashFlowData[cashFlowData.length - 1].balance)
        : 0;
      
      const caixaLivre = Math.max(0, currentBalance); // Apenas valores positivos para caixa livre

      // 5. Calculate guarantee from assets - EXATAMENTE como no TreasuryPanel
      const assetsGuarantee = assetsData?.reduce((sum, asset) => 
        asset.used_as_guarantee 
          ? sum + ((asset.quantity * asset.market_price * asset.guarantee_released) / 100)
          : sum, 0
      ) || 0;

      // 5.1. Calculate guarantee from structure assets (60% default for stocks)
      const structureAssetsGuarantee = structuresData?.reduce((sum, structure) => {
        const legs = structure.legs || [];
        const stockValue = legs
          .filter((leg: any) => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA')
          .reduce((legSum: number, leg: any) => legSum + ((leg.precoEntrada || 0) * leg.quantidade), 0);
        
        return sum + (stockValue * 0.6); // 60% guarantee for stocks in structures
      }, 0) || 0;

      // 6. Calculate margin already used - EXATAMENTE como no TreasuryPanel
      const guaranteeUsed = structuresData?.reduce((sum, structure) => {
        const legs = structure.legs || [];
        return sum + legs.reduce((legSum: number, leg: any) => {
          if (leg.posicao === 'VENDIDA') {
            if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
              // Options: 15% of notional value as margin
              return legSum + (leg.strike * leg.quantidade * 0.15);
            } else if (leg.tipo === 'ACAO') {
              // Stocks: 100% of value as margin
              return legSum + (leg.precoEntrada || 0) * leg.quantidade;
            }
          }
          return legSum;
        }, 0);
      }, 0) || 0;

       // 7. Total guarantee free (available for new operations)
       const totalGuaranteeFree = assetsGuarantee + structureAssetsGuarantee + caixaLivre - guaranteeUsed;

      console.log('🔍 StructureBuilder Treasury Data:', {
        caixaLivre,
        currentBalance,
        assetsGuarantee,
        structureAssetsGuarantee,
        guaranteeUsed,
         totalGuaranteeFree,
        cashFlowEntries: cashFlowData?.length || 0,
        assets: assetsData?.length || 0,
        activeStructures: structuresData?.length || 0
      });
      
      setTreasuryData({
        currentBalance: caixaLivre, // Caixa Livre (apenas valores positivos)
         totalGuaranteeAvailable: Math.max(0, totalGuaranteeFree),
        loading: false
      });
    } catch (error) {
      console.error('Error loading treasury data:', error);
      setTreasuryData(prev => ({ ...prev, loading: false }));
    }
  };

  const validateStructureFinances = () => {
    setValidationError(null);

    if (legs.length === 0) {
      setValidationError('Adicione pelo menos uma perna à estrutura');
      return false;
    }

    // Calculate total impact on cash balance
    const totalCashImpact = legs.reduce((sum, leg) => {
      if (leg.tipo === 'ACAO') {
        if (leg.posicao === 'COMPRADA') {
          return sum - ((leg.precoEntrada || 0) * leg.quantidade);
        } else {
          return sum + ((leg.precoEntrada || 0) * leg.quantidade);
        }
      } else if (leg.posicao === 'COMPRADA') {
        return sum - (leg.premio * leg.quantidade);
      } else {
        return sum + (leg.premio * leg.quantidade);
      }
    }, 0);

    const custoMontagem = calculateCustoMontagem();
    const finalCashImpact = totalCashImpact - custoMontagem;
    const newBalance = treasuryData.currentBalance + finalCashImpact;

    // Check if balance would go negative
    if (newBalance < -1000) { // Allow small negative balances (up to R$ 1000)
      setValidationError(
        `Caixa Livre muito baixo! Caixa Livre (Real): ${formatCurrency(treasuryData.currentBalance)} | ` +
        `Impacto da estrutura: ${formatCurrency(finalCashImpact)} | ` +
        `Saldo resultante: ${formatCurrency(newBalance)}`
      );
      return false;
    }

    // Calculate guarantee needed
    const guaranteeNeeded = legs.reduce((sum, leg) => {
      if (leg.posicao === 'VENDIDA') {
        if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
          return sum + (leg.strike * leg.quantidade * 0.15);
        } else if (leg.tipo === 'ACAO') {
          return sum + (leg.precoEntrada || 0) * leg.quantidade;
        }
      }
      return sum;
    }, 0);

    // Check if guarantee is sufficient
    const availableGuarantee = Math.max(0, treasuryData.totalGuaranteeAvailable);
    if (guaranteeNeeded > availableGuarantee + 5000) { // Allow some tolerance (R$ 5000)
      setValidationError(
        `Margem insuficiente! Garantia Livre: ${formatCurrency(availableGuarantee)} | ` +
        `Margem necessária: ${formatCurrency(guaranteeNeeded)} | ` +
        `Déficit: ${formatCurrency(Math.max(0, guaranteeNeeded - availableGuarantee))}`
      );
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (editingStructure) {
      setNome(editingStructure.nome);
      setAtivo(editingStructure.ativo || '');
      setLegs(editingStructure.legs || []);
    }
  }, [editingStructure]);

  // Validate finances whenever legs change
  useEffect(() => {
    if (!treasuryData.loading && legs.length > 0) {
      validateStructureFinances();
    }
  }, [legs, treasuryData]);

  const calculatePremioLiquido = () => {
    return legs.reduce((total, leg) => {
      const premioValue = leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio;
      return total + (premioValue * leg.quantidade);
    }, 0);
  };

  const calculateCustoMontagem = () => {
    return legs.length * 2.5; // R$ 2,50 por perna
  };

  const getEarliestExpiration = () => {
    // Filtrar apenas opções e futuros para calcular vencimento da estrutura
    const validDates = legs
      .filter(leg => leg.vencimento && leg.tipo !== 'ACAO')
      .map(leg => new Date(leg.vencimento))
      .sort((a, b) => a.getTime() - b.getTime());
    
    // Se não há opções/futuros, usar data padrão (30 dias)
    if (validDates.length === 0) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      return defaultDate.toISOString().split('T')[0];
    }
    
    return validDates[0].toISOString().split('T')[0];
  };

  const handleSave = () => {
    // Basic validation
    if (!nome.trim()) {
      alert('Por favor, informe o nome da estrutura');
      return;
    }
    
    if (legs.length === 0) {
      alert('Adicione pelo menos uma perna à estrutura');
      return;
    }

    // Financial validation with warning (not blocking)
    if (!validateStructureFinances() && validationError) {
      const confirmMessage = `⚠️ ATENÇÃO FINANCEIRA:\n\n${validationError}\n\nDeseja continuar mesmo assim?\n\n` +
        `✅ SIM - Salvar estrutura (você pode ajustar depois)\n` +
        `❌ NÃO - Revisar dados financeiros`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    const structure: OptionStructure = {
      id: editingStructure?.id || crypto.randomUUID(),
      nome: nome.trim() || 'Estrutura sem nome',
      ativo: ativo.trim() || undefined,
      legs,
      premioLiquido: calculatePremioLiquido(),
      custoMontagem: calculateCustoMontagem(),
      dataVencimento: getEarliestExpiration(),
      status: 'MONTANDO',
      operacoes: editingStructure?.operacoes || []
    };

    onSave(structure);
  };

  const handleAddLeg = () => {
    try {
      console.log('Adicionando perna:', currentLeg);
      
      if (!currentLeg.ativo.trim()) {
        alert('Por favor, informe o ativo');
        return;
      }


      const newLeg: OptionLeg = {
        ...currentLeg,
        id: editingLegIndex !== null ? legs[editingLegIndex].id : crypto.randomUUID(),
        ativo: currentLeg.ativo.trim().toUpperCase(),
        // Para ações, definir vencimento como data muito distante se não informado
        vencimento: currentLeg.vencimento || (currentLeg.tipo === 'ACAO' ? '2099-12-31' : '')
      };

      console.log('Nova perna criada:', newLeg);

      if (editingLegIndex !== null) {
        const updatedLegs = [...legs];
        updatedLegs[editingLegIndex] = newLeg;
        setLegs(updatedLegs);
        setEditingLegIndex(null);
      } else {
        setLegs([...legs, newLeg]);
      }

      resetLegForm();
    } catch (error) {
      console.error('Erro ao adicionar perna:', error);
      alert('Erro ao adicionar perna. Verifique os dados e tente novamente.');
    }
  };

  const handleEditLeg = (index: number) => {
    // Reset selected call data when editing
    setCurrentLeg({
      ...legs[index],
      selectedCallData: undefined
    });
    setEditingLegIndex(index);
    setShowLegForm(true);
  };

  const handleDeleteLeg = (index: number) => {
    if (window.confirm('Tem certeza que deseja remover esta perna?')) {
      setLegs(legs.filter((_, i) => i !== index));
    }
  };

  const resetLegForm = () => {
    setCurrentLeg({
      id: '',
      tipo: 'CALL',
      strike: 0,
      vencimento: '',
      premio: 0,
      quantidade: 1,
      posicao: 'COMPRADA',
      ativo: '',
      selectedMonth: undefined,
      selectedYear: undefined
    });
    setShowLegForm(false);
    setEditingLegIndex(null);
  };

  const updateCurrentLeg = (field: keyof OptionLeg, value: any) => {
    setCurrentLeg(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectTemplate = (template: any) => {
    setNome(template.name);
    // Aqui você poderia implementar lógica para pré-configurar pernas baseadas no template
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <StructureHeader onCancel={onCancel} isEditing={!!editingStructure} />
        
        <div className="p-6">
          {/* Treasury Status */}
          {!treasuryData.loading && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">Status da Tesouraria</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Caixa Livre (Real):</span>
                  <span className={`font-bold ml-2 ${treasuryData.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(treasuryData.currentBalance)}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Garantia Livre:</span>
                  <span className="font-bold text-green-600 ml-2">
                    {formatCurrency(Math.max(0, treasuryData.totalGuaranteeAvailable))}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">Status Operacional:</span>
                  <span className={`font-bold ml-2 ${validationError ? 'text-red-600' : 'text-green-600'}`}>
                    {validationError ? 'LIMITADO' : 'LIBERADO'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-red-800 font-medium">Limitação Financeira</h3>
                  <p className="text-red-700 text-sm">{validationError}</p>
                </div>
              </div>
            </div>
          )}

          <StructureForm
            nome={nome}
            ativo={ativo}
            onNomeChange={setNome}
            onAtivoChange={setAtivo}
          />

          <StructureTemplates onSelectTemplate={handleSelectTemplate} />

          {/* Somatória Final das Pernas */}
          {legs.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Impacto Total na Tesouraria</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Saldo em Conta */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-800 mb-3">💰 Saldo em Conta</h4>
                  <div className="space-y-2">
                    {(() => {
                      const saldoImpact = legs.reduce((sum, leg) => {
                        if (leg.tipo === 'ACAO') {
                          if (leg.posicao === 'COMPRADA') {
                            return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                          } else {
                            return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                          }
                        } else if (leg.posicao === 'COMPRADA') {
                          return sum - (leg.premio * leg.quantidade);
                        } else {
                          return sum + (leg.premio * leg.quantidade);
                        }
                      }, 0);
                      
                      return (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${saldoImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {saldoImpact > 0 ? '+' : ''}{formatCurrency(saldoImpact)}
                          </div>
                          <div className={`text-sm font-medium ${saldoImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {saldoImpact >= 0 ? 'CRÉDITO LÍQUIDO' : 'DÉBITO LÍQUIDO'}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Garantia Bloqueada */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-800 mb-3">🛡️ Garantia Bloqueada</h4>
                  <div className="space-y-2">
                    {(() => {
                      const margemNecessaria = legs.reduce((sum, leg) => {
                        if (leg.posicao === 'VENDIDA') {
                          if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                            // Opções vendidas: 15% do valor nocional como margem
                            return sum + (leg.strike * leg.quantidade * 0.15);
                          } else if (leg.tipo === 'ACAO') {
                            // Ações vendidas: 100% do valor como margem
                            return sum + (leg.precoEntrada || 0) * leg.quantidade;
                          }
                        }
                        return sum;
                      }, 0);
                      
                      return (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(margemNecessaria)}
                          </div>
                          <div className="text-sm font-medium text-orange-600">
                            MARGEM NECESSÁRIA
                          </div>
                          {margemNecessaria > 0 && (
                            <div className="text-xs text-gray-600 mt-1">
                              Margem bloqueada na tesouraria
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Resultado Final */}
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">📊 Resultado Final</h4>
                  <div className="space-y-2">
                    {(() => {
                      const saldoImpact = legs.reduce((sum, leg) => {
                        if (leg.tipo === 'ACAO') {
                          if (leg.posicao === 'COMPRADA') {
                            return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                          } else {
                            return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                          }
                        } else if (leg.posicao === 'COMPRADA') {
                          return sum - (leg.premio * leg.quantidade);
                        } else {
                          return sum + (leg.premio * leg.quantidade);
                        }
                      }, 0);
                      
                      const margemNecessaria = legs.reduce((sum, leg) => {
                        if (leg.posicao === 'VENDIDA') {
                          if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                            // Opções vendidas: usar margem personalizada ou 15% padrão
                            const marginPercentage = (leg.customMarginPercentage || 15) / 100;
                            return sum + (leg.strike * leg.quantidade * marginPercentage);
                          } else if (leg.tipo === 'ACAO') {
                            // Ações vendidas: usar margem personalizada ou 100% padrão
                            const marginPercentage = (leg.customMarginPercentage || 100) / 100;
                            return sum + ((leg.precoEntrada || 0) * leg.quantidade * marginPercentage);
                          }
                        }
                        return sum;
                      }, 0);
                      
                      const custoMontagem = calculateCustoMontagem();
                      const resultadoFinal = saldoImpact - custoMontagem;
                      
                      return (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${resultadoFinal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {resultadoFinal > 0 ? '+' : ''}{formatCurrency(resultadoFinal)}
                          </div>
                          <div className={`text-sm font-bold ${resultadoFinal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {resultadoFinal >= 0 ? 'CRÉDITO FINAL' : 'DÉBITO FINAL'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            + Margem: {formatCurrency(margemNecessaria)}
                          </div>
                          <div className="text-xs text-gray-600">
                            Impacto - Custo Montagem
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resumo Final da Estrutura */}
          {legs.length > 0 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-6 mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 p-2 rounded-lg mr-3">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Resumo Final da Estrutura</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breakdown por Tipo */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Breakdown por Tipo de Ativo</h4>
                  <div className="space-y-2">
                    {(() => {
                      const breakdown = legs.reduce((acc, leg) => {
                        const key = leg.tipo;
                        if (!acc[key]) acc[key] = { count: 0, impact: 0 };
                        acc[key].count += 1;
                        
                        if (leg.tipo === 'ACAO') {
                          if (leg.posicao === 'COMPRADA') {
                            acc[key].impact += -((leg.precoEntrada || 0) * leg.quantidade);
                          } else {
                            acc[key].impact += ((leg.precoEntrada || 0) * leg.quantidade);
                          }
                        } else {
                          acc[key].impact += (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                        }
                        return acc;
                      }, {} as {[key: string]: {count: number, impact: number}});
                      
                      return Object.entries(breakdown).map(([tipo, data]) => (
                        <div key={tipo} className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              tipo === 'CALL' ? 'bg-blue-100 text-blue-800' :
                              tipo === 'PUT' ? 'bg-purple-100 text-purple-800' :
                              tipo === 'ACAO' ? 'bg-green-100 text-green-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {tipo}
                            </span>
                            <span className="text-gray-700">{data.count} perna{data.count > 1 ? 's' : ''}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${data.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.impact > 0 ? '+' : ''}{formatCurrency(data.impact)}
                            </div>
                            <div className={`text-xs font-medium ${data.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.impact >= 0 ? 'CRÉDITO' : 'DÉBITO'}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Resumo Consolidado */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Resumo Consolidado</h4>
                  <div className="space-y-4">
                    {/* Total de Pernas */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Total de Pernas:</span>
                        <span className="text-xl font-bold text-purple-600">{legs.length}</span>
                      </div>
                    </div>
                    
                    {/* Impacto Total na Tesouraria */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 font-medium">Impacto na Tesouraria:</span>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${(() => {
                            const totalImpact = legs.reduce((sum, leg) => {
                              if (leg.tipo === 'ACAO') {
                                if (leg.posicao === 'COMPRADA') {
                                  return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                } else {
                                  return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                }
                              } else {
                                return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                              }
                            }, 0);
                            return totalImpact >= 0 ? 'text-green-600' : 'text-red-600';
                          })()}`}>
                            {(() => {
                              const totalImpact = legs.reduce((sum, leg) => {
                                if (leg.tipo === 'ACAO') {
                                  if (leg.posicao === 'COMPRADA') {
                                    return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                  } else {
                                    return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                  }
                                } else {
                                  return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                                }
                              }, 0);
                              return totalImpact > 0 ? `+${formatCurrency(totalImpact)}` : formatCurrency(totalImpact);
                            })()}
                          </div>
                          <div className={`text-sm font-medium ${(() => {
                            const totalImpact = legs.reduce((sum, leg) => {
                              if (leg.tipo === 'ACAO') {
                                if (leg.posicao === 'COMPRADA') {
                                  return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                } else {
                                  return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                }
                              } else {
                                return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                              }
                            }, 0);
                            return totalImpact >= 0 ? 'text-green-600' : 'text-red-600';
                          })()}`}>
                            {(() => {
                              const totalImpact = legs.reduce((sum, leg) => {
                                if (leg.tipo === 'ACAO') {
                                  if (leg.posicao === 'COMPRADA') {
                                    return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                  } else {
                                    return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                  }
                                } else {
                                  return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                                }
                              }, 0);
                              return totalImpact >= 0 ? 'CRÉDITO LÍQUIDO' : 'DÉBITO LÍQUIDO';
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Custo de Montagem */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">Custo de Montagem:</span>
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-600">
                            -{formatCurrency(calculateCustoMontagem())}
                          </div>
                          <div className="text-sm font-medium text-orange-600">DÉBITO</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Resultado Final */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800 font-bold">RESULTADO FINAL:</span>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${(() => {
                            const totalImpact = legs.reduce((sum, leg) => {
                              if (leg.tipo === 'ACAO') {
                                if (leg.posicao === 'COMPRADA') {
                                  return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                } else {
                                  return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                }
                              } else {
                                return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                              }
                            }, 0);
                            const finalResult = totalImpact - calculateCustoMontagem();
                            return finalResult >= 0 ? 'text-green-700' : 'text-red-700';
                          })()}`}>
                            {(() => {
                              const totalImpact = legs.reduce((sum, leg) => {
                                if (leg.tipo === 'ACAO') {
                                  if (leg.posicao === 'COMPRADA') {
                                    return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                  } else {
                                    return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                  }
                                } else {
                                  return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                                }
                              }, 0);
                              const finalResult = totalImpact - calculateCustoMontagem();
                              return finalResult > 0 ? `+${formatCurrency(finalResult)}` : formatCurrency(finalResult);
                            })()}
                          </div>
                          <div className={`text-sm font-bold ${(() => {
                            const totalImpact = legs.reduce((sum, leg) => {
                              if (leg.tipo === 'ACAO') {
                                if (leg.posicao === 'COMPRADA') {
                                  return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                } else {
                                  return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                }
                              } else {
                                return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                              }
                            }, 0);
                            const finalResult = totalImpact - calculateCustoMontagem();
                            return finalResult >= 0 ? 'text-green-700' : 'text-red-700';
                          })()}`}>
                            {(() => {
                              const totalImpact = legs.reduce((sum, leg) => {
                                if (leg.tipo === 'ACAO') {
                                  if (leg.posicao === 'COMPRADA') {
                                    return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                                  } else {
                                    return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                                  }
                                } else {
                                  return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                                }
                              }, 0);
                              const finalResult = totalImpact - calculateCustoMontagem();
                              return finalResult >= 0 ? 'CRÉDITO FINAL' : 'DÉBITO FINAL';
                            })()}
                          </div>
                          {(() => {
                            const garantiaBloqueada = legs.reduce((sum, leg) => {
                              if ((leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'VENDIDA') {
                                return sum + (leg.strike * leg.quantidade);
                              }
                              return sum;
                            }, 0);
                            
                            if (garantiaBloqueada > 0) {
                              return (
                                <div className="text-xs text-orange-600 mt-1 font-medium">
                                  + Garantia: {formatCurrency(garantiaBloqueada)}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Legs Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pernas da Estrutura</h3>
              <button
                onClick={() => setShowLegForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Perna
              </button>
            </div>

            <LegsList
              legs={legs}
              onEdit={handleEditLeg}
              onDelete={handleDeleteLeg}
            />
          </div>

          {/* Leg Form */}
          {showLegForm && (
            <div className="mb-8">
              <LegForm
                leg={currentLeg}
                availableLegs={legs}
                onUpdate={updateCurrentLeg}
                onAdd={handleAddLeg}
                onCancel={resetLegForm}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={legs.length === 0 || !nome.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Salvar Estrutura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}