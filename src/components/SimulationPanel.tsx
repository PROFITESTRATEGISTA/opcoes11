import React, { useEffect, useMemo, useState } from 'react';
import { 
  Activity,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  BarChart3,
  Zap
} from 'lucide-react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../types/trading';

interface SimulationPanelProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises?: ExerciseRecord[];
}

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

interface StructureAnalysis {
  structure: OptionStructure;
  monthlyPotential: number;
  riskLevel: RiskLevel;
  recurrenceRate: number; // 0..1
  averageReturn: number;
  successRate: number;    // 0..100
  daysToExpiration: number;
  recommendedAction: string;
}

interface ProjectionPeriod {
  period: '3m' | '6m' | '1y';
  label: string;
  months: number;
}

export default function SimulationPanel({ structures, rolls, exercises = [] }: SimulationPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '1y'>('6m');

  const projectionPeriods: ProjectionPeriod[] = [
    { period: '3m', label: '3 Meses', months: 3 },
    { period: '6m', label: '6 Meses', months: 6 },
    { period: '1y', label: '1 Ano', months: 12 }
  ];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;

  // Core: análise das estruturas ativas
  const structureAnalyses: StructureAnalysis[] = useMemo(() => {
    const active = structures.filter(s => s.status === 'ATIVA');

    return active.map((structure) => {
      const operationResults = structure.operacoes?.map(op => op.resultado) || [];
      const averageReturn =
        operationResults.length > 0
          ? operationResults.reduce((sum, r) => sum + r, 0) / operationResults.length
          : structure.premioLiquido;

      const successfulOps = operationResults.filter(r => r > 0).length;
      const successRate =
        operationResults.length > 0 ? (successfulOps / operationResults.length) * 100 : 75;

      const expirationDate = new Date(structure.dataVencimento);
      const today = new Date();
      const daysToExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const hasNakedOptions = structure.legs.some(leg =>
        (leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'VENDIDA'
      );
      const hasStocks = structure.legs.some(leg => leg.tipo === 'ACAO');

      let riskLevel: RiskLevel = 'MEDIUM';
      if (hasStocks && !hasNakedOptions) riskLevel = 'LOW';
      else if (hasNakedOptions) riskLevel = 'HIGH';

      const monthlyPotential =
        daysToExpiration > 0 ? (averageReturn / Math.max(1, daysToExpiration)) * 30 : averageReturn;

      // Recorrência heurística baseada em taxa de sucesso
      const recurrenceRate = successRate > 70 ? 0.8 : successRate > 50 ? 0.6 : 0.4;

      let recommendedAction = '';
      if (daysToExpiration <= 7) recommendedAction = 'URGENTE: Considerar rolagem ou exercício';
      else if (daysToExpiration <= 30) recommendedAction = 'Monitorar para possível rolagem';
      else if (successRate > 80) recommendedAction = 'Replicar estratégia em novos vencimentos';
      else recommendedAction = 'Revisar estratégia antes de replicar';

      return {
        structure,
        monthlyPotential,
        riskLevel,
        recurrenceRate,
        averageReturn,
        successRate,
        daysToExpiration,
        recommendedAction
      };
    });
  }, [structures]);

  // Projeção de ganhos para o período selecionado
  const projectionData = useMemo(() => {
    const selectedPeriodData = projectionPeriods.find(p => p.period === selectedPeriod)!;
    
    // Receita mensal esperada baseada em estruturas ativas
    const expectedMonthlyIncome = structureAnalyses.reduce((sum, analysis) => {
      const expected = analysis.monthlyPotential * analysis.recurrenceRate * (analysis.successRate / 100);
      return sum + expected;
    }, 0);

    // Projeção total para o período
    const totalProjectedIncome = expectedMonthlyIncome * selectedPeriodData.months;
    
    // Calcular capital investido atual
    const currentCapital = structures
      .filter(s => s.status === 'ATIVA')
      .reduce((sum, structure) => {
        const invested = structure.legs
          .filter(leg => leg.posicao === 'COMPRADA')
          .reduce((legSum, leg) => {
            if (leg.tipo === 'ACAO') {
              return legSum + ((leg.precoEntrada || 0) * leg.quantidade);
            } else {
              return legSum + (leg.premio * leg.quantidade);
            }
          }, 0);
        return sum + invested;
      }, 0);

    // ROI anualizado
    const annualizedROI = currentCapital > 0 
      ? ((expectedMonthlyIncome * 12) / currentCapital) * 100 
      : 0;

    return {
      period: selectedPeriodData,
      expectedMonthlyIncome,
      totalProjectedIncome,
      currentCapital,
      annualizedROI,
      structuresCount: structureAnalyses.length,
      averageSuccessRate: structureAnalyses.length > 0 
        ? structureAnalyses.reduce((sum, a) => sum + a.successRate, 0) / structureAnalyses.length 
        : 0
    };
  }, [structureAnalyses, selectedPeriod]);

  // Recomendações inteligentes da IA
  const aiRecommendations = useMemo(() => {
    const recommendations = [];

    // Estruturas próximas ao vencimento
    const nearExpiration = structureAnalyses.filter(a => a.daysToExpiration <= 30);
    if (nearExpiration.length > 0) {
      recommendations.push({
        type: 'urgent',
        title: `${nearExpiration.length} estrutura(s) próxima(s) ao vencimento`,
        description: 'Considere rolagens ou exercícios para manter a receita',
        action: 'Revisar vencimentos no calendário',
        impact: nearExpiration.reduce((sum, a) => sum + a.monthlyPotential, 0)
      });
    }

    // Estruturas de alta performance para replicar
    const highPerformance = structureAnalyses.filter(a => a.successRate > 80);
    if (highPerformance.length > 0) {
      recommendations.push({
        type: 'opportunity',
        title: `${highPerformance.length} estrutura(s) de alta performance`,
        description: 'Replique estas estratégias para aumentar receita',
        action: 'Criar novas estruturas similares',
        impact: highPerformance.reduce((sum, a) => sum + a.monthlyPotential, 0) * 0.5
      });
    }

    // Estruturas com baixa performance
    const lowPerformance = structureAnalyses.filter(a => a.successRate < 50);
    if (lowPerformance.length > 0) {
      recommendations.push({
        type: 'warning',
        title: `${lowPerformance.length} estrutura(s) com baixa performance`,
        description: 'Revisar estratégias ou considerar encerramento',
        action: 'Analisar e otimizar estratégias',
        impact: -lowPerformance.reduce((sum, a) => sum + Math.abs(a.monthlyPotential), 0) * 0.3
      });
    }

    // Oportunidade de diversificação
    const uniqueAssets = new Set(structureAnalyses.map(a => a.structure.ativo || 'MIXED'));
    if (uniqueAssets.size < 3) {
      recommendations.push({
        type: 'suggestion',
        title: 'Oportunidade de diversificação',
        description: `Apenas ${uniqueAssets.size} ativo(s) diferentes. Considere diversificar`,
        action: 'Criar estruturas em novos ativos',
        impact: projectionData.expectedMonthlyIncome * 0.2
      });
    }

    return recommendations;
  }, [structureAnalyses, projectionData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Projeção de Ganhos</h2>
          <p className="text-gray-400">Strategos Partners - Estimativas baseadas em estruturas ativas</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex bg-gray-800 rounded-lg p-1">
          {projectionPeriods.map((period) => (
            <button
              key={period.period}
              onClick={() => setSelectedPeriod(period.period)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPeriod === period.period
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projeção Principal */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Projeção para {projectionPeriods.find(p => p.period === selectedPeriod)?.label}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(projectionData.expectedMonthlyIncome)}
            </div>
            <div className="text-sm text-gray-400">Receita Mensal Esperada</div>
            <div className="text-xs text-green-300 mt-1">
              Baseado em {projectionData.structuresCount} estruturas ativas
            </div>
          </div>

          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(projectionData.totalProjectedIncome)}
            </div>
            <div className="text-sm text-gray-400">Receita Total Projetada</div>
            <div className="text-xs text-blue-300 mt-1">
              {projectionPeriods.find(p => p.period === selectedPeriod)?.months} meses
            </div>
          </div>

          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">
              {formatPercentage(projectionData.annualizedROI)}
            </div>
            <div className="text-sm text-gray-400">ROI Anualizado</div>
            <div className="text-xs text-purple-300 mt-1">
              Sobre {formatCurrency(projectionData.currentCapital)} investido
            </div>
          </div>

          <div className="text-center p-4 bg-gray-800/50 rounded-lg">
            <Activity className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-400">
              {formatPercentage(projectionData.averageSuccessRate)}
            </div>
            <div className="text-sm text-gray-400">Taxa de Sucesso Média</div>
            <div className="text-xs text-orange-300 mt-1">
              Baseado em histórico real
            </div>
          </div>
        </div>
      </div>

      {/* Análise das Estruturas Ativas */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Activity className="w-6 h-6 text-green-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Análise das Estruturas Ativas</h3>
        </div>

        <div className="space-y-4">
          {structureAnalyses.map((analysis, index) => (
            <div key={analysis.structure.id ?? `${analysis.structure.nome}-${index}`} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{analysis.structure.nome}</h4>
                    <div className="flex items-center space-x-2 text-sm">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          analysis.riskLevel === 'LOW'
                            ? 'bg-green-500/20 text-green-400'
                            : analysis.riskLevel === 'MEDIUM'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {analysis.riskLevel}
                      </span>
                      <span className="text-gray-400">
                        {analysis.daysToExpiration} dias para vencimento
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-400">
                    {formatCurrency(analysis.monthlyPotential)}
                  </div>
                  <div className="text-sm text-gray-400">Potencial Mensal</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400">Retorno Médio</p>
                  <p className={`font-bold ${analysis.averageReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(analysis.averageReturn)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400">Taxa de Sucesso</p>
                  <p className="font-bold text-blue-400">{formatPercentage(analysis.successRate)}</p>
                </div>
                <div className="bg-gray-800 rounded p-3">
                  <p className="text-gray-400">Recorrência</p>
                  <p className="font-bold text-purple-400">{formatPercentage(analysis.recurrenceRate * 100)}</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center">
                  <Brain className="w-4 h-4 text-blue-400 mr-2" />
                  <p className="text-blue-300 font-medium">Recomendação IA:</p>
                </div>
                <p className="text-blue-200 text-sm mt-1">{analysis.recommendedAction}</p>
              </div>
            </div>
          ))}

          {structureAnalyses.length === 0 && (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma estrutura ativa encontrada</p>
              <p className="text-sm text-gray-500">Crie estruturas para ver projeções de ganhos</p>
            </div>
          )}
        </div>
      </div>

      {/* Recomendações da IA */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Brain className="w-6 h-6 text-purple-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Recomendações Inteligentes</h3>
        </div>

        <div className="space-y-4">
          {aiRecommendations.map((rec, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              rec.type === 'urgent' ? 'bg-red-900/20 border-red-500/30' :
              rec.type === 'opportunity' ? 'bg-green-900/20 border-green-500/30' :
              rec.type === 'warning' ? 'bg-yellow-900/20 border-yellow-500/30' :
              'bg-blue-900/20 border-blue-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {rec.type === 'urgent' && <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />}
                  {rec.type === 'opportunity' && <TrendingUp className="w-5 h-5 text-green-400 mr-2" />}
                  {rec.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />}
                  {rec.type === 'suggestion' && <Lightbulb className="w-5 h-5 text-blue-400 mr-2" />}
                  <h4 className="font-medium text-white">{rec.title}</h4>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${rec.impact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rec.impact >= 0 ? '+' : ''}{formatCurrency(rec.impact)}
                  </div>
                  <div className="text-xs text-gray-400">Impacto mensal</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mb-2">{rec.description}</p>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                <span className="text-green-300 text-sm font-medium">{rec.action}</span>
              </div>
            </div>
          ))}

          {aiRecommendations.length === 0 && (
            <div className="text-center py-6">
              <Brain className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Nenhuma recomendação específica no momento</p>
              <p className="text-sm text-gray-500">Continue operando suas estruturas ativas</p>
            </div>
          )}
        </div>
      </div>

      {/* Próximos Passos */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Calendar className="w-6 h-6 text-orange-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Próximos Passos</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ações Imediatas */}
          <div>
            <h4 className="font-medium text-orange-300 mb-4">Ações Imediatas (próximos 30 dias)</h4>
            <div className="space-y-3">
              {structureAnalyses
                .filter(a => a.daysToExpiration <= 30)
                .map((a, idx) => (
                  <div key={`immediate-${idx}`} className="flex items-center p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{a.structure.nome}</p>
                      <p className="text-orange-400 text-xs">
                        {a.daysToExpiration} dias • {a.recommendedAction}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-orange-400 font-bold">{formatCurrency(a.monthlyPotential)}</p>
                      <p className="text-xs text-gray-400">Potencial</p>
                    </div>
                  </div>
                ))}

              {structureAnalyses.filter(a => a.daysToExpiration <= 30).length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Nenhuma ação imediata necessária</p>
                </div>
              )}
            </div>
          </div>

          {/* Oportunidades de Crescimento */}
          <div>
            <h4 className="font-medium text-green-300 mb-4">Oportunidades de Crescimento</h4>
            <div className="space-y-3">
              {structureAnalyses
                .filter(a => a.successRate > 70)
                .sort((a, b) => b.monthlyPotential - a.monthlyPotential)
                .slice(0, 5)
                .map((a, idx) => (
                  <div key={`growth-${idx}`} className="flex items-center p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{a.structure.nome}</p>
                      <p className="text-green-400 text-xs">
                        {formatPercentage(a.successRate)} sucesso • {formatPercentage(a.recurrenceRate * 100)} recorrência
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">{formatCurrency(a.monthlyPotential)}</p>
                      <p className="text-xs text-gray-400">Mensal</p>
                    </div>
                  </div>
                ))}

              {structureAnalyses.filter(a => a.successRate > 70).length === 0 && (
                <div className="text-center py-4 text-gray-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Nenhuma estrutura com alta taxa de sucesso</p>
                  <p className="text-xs text-gray-500">Considere revisar estratégias</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resumo Executivo */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Zap className="w-6 h-6 text-yellow-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Resumo Executivo</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Performance Atual</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Estruturas Ativas:</span>
                <span className="text-white font-bold">{structureAnalyses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Capital Investido:</span>
                <span className="text-blue-400 font-bold">{formatCurrency(projectionData.currentCapital)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Receita Mensal:</span>
                <span className="text-green-400 font-bold">{formatCurrency(projectionData.expectedMonthlyIncome)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Projeção {projectionPeriods.find(p => p.period === selectedPeriod)?.label}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Receita Total:</span>
                <span className="text-green-400 font-bold">{formatCurrency(projectionData.totalProjectedIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">ROI Anualizado:</span>
                <span className="text-purple-400 font-bold">{formatPercentage(projectionData.annualizedROI)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Taxa de Sucesso:</span>
                <span className="text-orange-400 font-bold">{formatPercentage(projectionData.averageSuccessRate)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4">
            <h4 className="font-medium text-white mb-3">Plano de Ação</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Monitorar vencimentos próximos
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Executar rolagens quando necessário
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Replicar estruturas de alta performance
              </div>
              <div className="flex items-center text-gray-300">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Ajustar estratégias conforme mercado
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}