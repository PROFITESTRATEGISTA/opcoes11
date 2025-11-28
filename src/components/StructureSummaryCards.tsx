import React from 'react';
import { DollarSign, Calculator, Target, TrendingUp } from 'lucide-react';
import { OptionLeg } from '../types/trading';

interface StructureSummaryCardsProps {
  legs: OptionLeg[];
  premioLiquido: number;
  custoMontagem: number;
}

export default function StructureSummaryCards({ legs, premioLiquido, custoMontagem }: StructureSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateNetProjectedResult = () => {
    const maxGain = calculateMaxCapitalGain();
    const operationalCosts = custoMontagem; // Apenas custo de montagem
    const totalCosts = operationalCosts; // Simplificar custos
    
    // Resultado = Ganho Máximo + Prêmio Líquido - Custos
    const result = maxGain + premioLiquido - totalCosts;
    return result;
  };

  const calculateMaxCapitalGain = () => {
    let maxGain = 0;
    
    // Agrupar pernas por ativo base para identificar travas
    const assetGroups: {[key: string]: OptionLeg[]} = {};
    const processedLegs = new Set<string>(); // Para evitar dupla contagem
    
    legs.forEach(leg => {
      // Extrair ativo base (remove sufixos de opções)
      const baseAsset = leg.ativo.replace(/[A-Z]\d+\d+$/, '').replace(/[A-Z]$/, '');
      if (!assetGroups[baseAsset]) {
        assetGroups[baseAsset] = [];
      }
      assetGroups[baseAsset].push(leg);
    });
    
    // Calcular ganho máximo para cada grupo de ativo
    Object.entries(assetGroups).forEach(([baseAsset, assetLegs]) => {
      // Identificar componentes da trava coberta
      const acoesCompradas = assetLegs.filter(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA');
      const callsVendidas = assetLegs.filter(leg => leg.tipo === 'CALL' && leg.posicao === 'VENDIDA');
      
      // Processar travas cobertas
      acoesCompradas.forEach(acao => {
        if (processedLegs.has(acao.id)) return;
        
        // Buscar CALL vendida correspondente
        const callCorrespondente = callsVendidas.find(call => 
          !processedLegs.has(call.id) && 
          call.quantidade <= acao.quantidade
        );
        
        if (callCorrespondente) {
          // TRAVA COBERTA: ganho máximo = (strike - preço entrada) * quantidade + prêmio recebido
          const precoEntrada = acao.selectedCallData?.precoEntradaOriginal || acao.precoEntrada || 0;
          const quantidadeTrava = Math.min(acao.quantidade, callCorrespondente.quantidade);
          
          // Ganho da trava = diferença de preço + prêmio recebido
          const ganhoPorAcao = (callCorrespondente.strike - precoEntrada) + callCorrespondente.premio;
          const ganhoTrava = ganhoPorAcao * quantidadeTrava;
          
          maxGain += ganhoTrava;
          
          // Marcar como processadas para evitar dupla contagem
          processedLegs.add(acao.id);
          processedLegs.add(callCorrespondente.id);
          
          // Se sobrou ações não cobertas
          const acoesRestantes = acao.quantidade - quantidadeTrava;
          if (acoesRestantes > 0) {
            // Ganho teórico das ações descobertas (20% de valorização)
            const ganhoAcoesRestantes = precoEntrada * 0.2 * acoesRestantes;
            maxGain += ganhoAcoesRestantes;
          }
        } else {
          // AÇÃO SEM TRAVA: ganho teórico (20% de valorização)
          const precoEntrada = acao.precoEntrada || 0;
          const ganhoTeorico = precoEntrada * 0.2 * acao.quantidade;
          maxGain += ganhoTeorico;
          processedLegs.add(acao.id);
        }
      });
      
      // Processar opções isoladas (não processadas ainda)
      assetLegs.forEach(leg => {
        if (processedLegs.has(leg.id)) return;
        
        if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
          let ganhoOpcao = 0;
          
          if (leg.posicao === 'COMPRADA') {
            // Opção comprada: ganho teórico baseado no strike
            ganhoOpcao = leg.strike * 0.1 * leg.quantidade;
          } else {
            // Opção vendida isolada: ganho máximo = prêmio recebido
            ganhoOpcao = leg.premio * leg.quantidade;
          }
          
          maxGain += ganhoOpcao;
          processedLegs.add(leg.id);
        }
      });
    });
    
    return maxGain;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-green-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-green-800">Prêmio Líquido</p>
            <p className={`text-2xl font-bold ${premioLiquido >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(premioLiquido)}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center">
          <Calculator className="w-6 h-6 text-orange-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-orange-800">Custo Montagem</p>
            <p className="text-2xl font-bold text-orange-900">
              {formatCurrency(custoMontagem)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <Target className="w-6 h-6 text-purple-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-purple-800">Total de Pernas</p>
            <p className="text-2xl font-bold text-purple-900">{legs.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-blue-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-blue-800">Ganho Máximo</p>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(calculateMaxCapitalGain())}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-emerald-600 mr-3" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Impacto Tesouraria</p>
            <p className="text-xs text-emerald-700 mb-1">Total das Pernas</p>
            <p className={`text-2xl font-bold ${(() => {
              const totalImpact = legs.reduce((sum, leg) => {
                if (leg.tipo === 'ACAO') {
                  return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT' || leg.tipo === 'FUTUROS') {
                  return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                }
                return sum;
              }, 0);
              return totalImpact >= 0 ? 'text-emerald-900' : 'text-red-900';
            })()}`}>
              {(() => {
                const totalImpact = legs.reduce((sum, leg) => {
                  if (leg.tipo === 'ACAO') {
                    return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                  } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT' || leg.tipo === 'FUTUROS') {
                    return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
                  }
                  return sum;
                }, 0);
                return totalImpact > 0 ? `+${formatCurrency(totalImpact)}` : formatCurrency(totalImpact);
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}