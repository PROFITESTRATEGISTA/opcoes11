import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  marketPrice: number;
  guaranteeReleased: number;
  usedAsGuarantee: boolean;
  type: 'STOCK' | 'RENDA_FIXA' | 'OPCOES' | 'FUTUROS';
}

interface CashFlowEntry {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'STRUCTURE_COST' | 'STRUCTURE_PREMIUM' | 'ROLL_COST' | 'EXERCISE_COST' | 'BROKERAGE' | 'TAX' | 'PROFIT';
  description: string;
  amount: number;
  balance: number;
  relatedStructureId?: string;
  relatedRollId?: string;
}

export interface TreasuryBalances {
  currentBalance: number;
  stockValue: number;
  lftValue: number;
  opcoesValue: number;
  futurosValue: number;
  totalNocional: number; // Exposição Total (Nocional) - soma absoluta de todas as operações
  totalExposure: number; // Total Exposure: Bought - Sold (removido)
  totalInvested: number;
  totalBalance: number; // Patrimônio Total (capital real do usuário)
  freeAmount: number;
  totalGuaranteeFromAssets: number;
  guaranteeUsed: number;
  totalGuaranteeAvailable: number;
}

export function calculateTreasuryBalances(
  cashFlowEntries: CashFlowEntry[],
  assets: Asset[],
  structures: OptionStructure[]
): TreasuryBalances {
  // 1. Calcular saldo atual do fluxo de caixa (Caixa Livre)
  const currentBalance = cashFlowEntries.length > 0 
    ? cashFlowEntries[cashFlowEntries.length - 1].balance 
    : 0;

  // 2. Calcular valor dos ativos
  const stockValue = assets
    .filter(asset => asset.type === 'STOCK')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);

  const lftValue = assets
    .filter(asset => asset.type === 'RENDA_FIXA')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);

  const opcoesValue = assets
    .filter(asset => asset.type === 'OPCOES')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);

  const futurosValue = assets
    .filter(asset => asset.type === 'FUTUROS')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);

  // 3. Calcular nocional total (Exposição Total) - soma absoluta de TODAS as operações
  // Isso representa o valor total movimentado, independente de ser comprado ou vendido
  const totalNocional = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      // Somar o nocional absoluto de TODAS as pernas
      const structureNocional = structure.legs.reduce((legSum, leg) => {
        let legNocional = 0;

        if (leg.tipo === 'ACAO') {
          legNocional = Math.abs((leg.precoEntrada || 0) * leg.quantidade);
        } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
          legNocional = Math.abs(leg.strike * leg.quantidade);
        } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
          legNocional = Math.abs((leg.precoVista || 0) * leg.quantidade);
        }

        return legSum + legNocional;
      }, 0);

      console.log(`🔍 Nocional Estrutura "${structure.nome}":`, {
        legs: structure.legs.length,
        nocional: structureNocional
      });

      return sum + structureNocional;
    }, 0);

  console.log('🔍 Total Nocional (Exposição Total) Calculation:', {
    activeStructures: structures.filter(s => s.status === 'ATIVA').length,
    totalNocional,
    description: 'Soma absoluta do nocional de TODAS as operações (compradas + vendidas)',
    structures: structures.filter(s => s.status === 'ATIVA').map(s => ({
      nome: s.nome,
      legs: s.legs.length,
      nocional: s.legs.reduce((sum, leg) => {
        if (leg.tipo === 'ACAO') return sum + Math.abs((leg.precoEntrada || 0) * leg.quantidade);
        if (leg.tipo === 'CALL' || leg.tipo === 'PUT') return sum + Math.abs(leg.strike * leg.quantidade);
        if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') return sum + Math.abs((leg.precoVista || 0) * leg.quantidade);
        return sum;
      }, 0)
    }))
  });

  // 3.1. REMOVIDO: Exposição (Comprado - Vendido) não é mais usado
  // totalNocional já representa a Exposição Total correta
  const totalExposure = 0; // Mantido por compatibilidade, mas não usado

  // 4. Calcular Total Investido = Nocional + Renda Fixa + Renda Variável
  const rendaVariavelTotal = Math.abs(stockValue) + Math.abs(opcoesValue) + Math.abs(futurosValue);
  
  // CORREÇÃO: Total Investido = apenas ativos em custódia (não contar estruturas separadamente)
  // As estruturas já movimentaram o caixa e os ativos resultantes estão na custódia
  const totalInvested = Math.abs(lftValue) + rendaVariavelTotal;
  
  console.log('🔍 TreasuryCalculations - TOTAL INVESTIDO SIMPLIFICADO:', {
    rendaFixa: Math.abs(lftValue),
    rendaVariavel: rendaVariavelTotal,
    totalInvested,
    calculation: `RF(${Math.abs(lftValue)}) + RV(${rendaVariavelTotal}) = ${totalInvested}`,
    note: 'Estruturas não são contadas separadamente - seus ativos resultantes estão na custódia'
  });
  
  // Patrimônio Total = Caixa Livre + Valor dos Ativos em Custódia
  // NÃO incluir estruturas alavancadas aqui - apenas capital real
  const totalBalance = currentBalance + stockValue + lftValue + opcoesValue + futurosValue;
  const freeAmount = currentBalance; // Caixa Livre = Saldo do fluxo de caixa

  console.log('🔍 Patrimônio Total Calculation:', {
    currentBalance,
    stockValue,
    lftValue,
    opcoesValue,
    futurosValue,
    totalBalance,
    description: 'Caixa + Ativos em custódia (não inclui alavancagem)'
  });

  // 5. Calcular garantias
  const totalGuaranteeFromAssets = assets.reduce((sum, asset) => 
    sum + ((asset.quantity * asset.marketPrice * asset.guaranteeReleased) / 100), 0
  );

  // 5.1. Calcular garantia das ações em estruturas ativas (60% padrão)
  const guaranteeFromStructureAssets = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      const stockValue = structure.legs
        .filter(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA')
        .reduce((legSum, leg) => legSum + ((leg.precoEntrada || 0) * leg.quantidade), 0);
      
      // 60% de garantia para ações em estruturas
      return sum + (stockValue * 0.6);
    }, 0);

  // 6. Calcular garantia necessária (margem) para estruturas ativas
  const guaranteeUsed = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      const structureGuaranteeUsed = structure.legs.reduce((legSum, leg) => {
        if (leg.posicao === 'VENDIDA') {
          if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
            // Opções vendidas: usar margem personalizada ou 15% padrão
            const marginPercentage = (leg.customMarginPercentage || 15) / 100;
            return legSum + (leg.strike * leg.quantidade * marginPercentage);
          } else if (leg.tipo === 'ACAO') {
            // Ações vendidas: usar margem personalizada ou 100% padrão
            const marginPercentage = (leg.customMarginPercentage || 100) / 100;
            return legSum + ((leg.precoEntrada || 0) * leg.quantidade * marginPercentage);
          }
        }
        return legSum;
      }, 0);
      
      console.log(`🔍 Garantia Usada Estrutura "${structure.nome}":`, {
        legs: structure.legs.length,
        guaranteeUsed: structureGuaranteeUsed,
        legsVendidas: structure.legs.filter(leg => leg.posicao === 'VENDIDA').length
      });
      
      return sum + structureGuaranteeUsed;
    }, 0);

  // 7. Carregar garantias manuais do localStorage
  const loadManualGuarantees = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const savedEntries = localStorage.getItem(`guarantee_entries_${user.id}`);
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        return entries.length > 0 ? entries[entries.length - 1].balance : 0;
      }
      return 0;
    } catch (error) {
      console.error('Error loading manual guarantees:', error);
      return 0;
    }
  };

  // 8. Total de garantia disponível = garantia dos ativos + garantia das ações em estruturas + caixa livre positivo
  // Note: Manual guarantees are loaded separately in the component
  const totalGuaranteeAvailable = Math.max(0, totalGuaranteeFromAssets + guaranteeFromStructureAssets + Math.max(0, currentBalance) - guaranteeUsed);

  console.log('🔍 TreasuryCalculations - GARANTIA FINAL:', {
    totalGuaranteeFromAssets,
    guaranteeFromStructureAssets,
    caixaLivrePositivo: Math.max(0, currentBalance),
    guaranteeUsed,
    totalGuaranteeAvailable,
    calculation: `${totalGuaranteeFromAssets} + ${guaranteeFromStructureAssets} + ${Math.max(0, currentBalance)} - ${guaranteeUsed} = ${totalGuaranteeAvailable}`
  });
  return {
    currentBalance, // Este é o Caixa Livre
    stockValue,
    lftValue,
    opcoesValue,
    futurosValue,
    totalNocional,
    totalExposure, // Exposição Total (Comprado - Vendido)
    totalInvested, // Total Investido = apenas ativos em custódia
    totalBalance, // Patrimônio Total
    freeAmount: Math.max(0, currentBalance), // Caixa Livre (apenas valores positivos)
    totalGuaranteeFromAssets,
    guaranteeUsed,
    totalGuaranteeAvailable
  };
}

export function generateCashFlowEntries(
  structures: OptionStructure[],
  rolls: RollPosition[],
  exercises: ExerciseRecord[]
): CashFlowEntry[] {
  const entries: CashFlowEntry[] = [];
  
  let runningBalance = 0;

  // 1. Carregar lançamentos manuais do localStorage
  const savedEntries = localStorage.getItem('treasury_manual_entries');
  if (savedEntries) {
    const manualEntries = JSON.parse(savedEntries);
    manualEntries.forEach((entry: CashFlowEntry) => {
      runningBalance += entry.amount;
      entries.push({
        ...entry,
        balance: runningBalance
      });
    });
  }

  // 2. Adicionar custos de estruturas
  structures.forEach(structure => {
    if (structure.status !== 'MONTANDO') {
      // Custo de montagem
      runningBalance -= structure.custoMontagem;
      entries.push({
        id: `structure_cost_${structure.id}`,
        date: structure.dataAtivacao || structure.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        type: 'STRUCTURE_COST',
        description: `Custo de montagem - ${structure.nome}`,
        amount: -structure.custoMontagem,
        balance: runningBalance,
        relatedStructureId: structure.id
      });

      // Lançamentos individuais por perna
      structure.legs.forEach((leg, index) => {
        if (leg.tipo === 'ACAO') {
          const amount = leg.posicao === 'COMPRADA' 
            ? -(leg.precoEntrada || 0) * leg.quantidade
            : (leg.precoEntrada || 0) * leg.quantidade;
          
          runningBalance += amount;
          
          entries.push({
            id: `leg_${structure.id}_${index}`,
            date: structure.dataAtivacao || structure.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            type: leg.posicao === 'COMPRADA' ? 'WITHDRAWAL' : 'DEPOSIT',
            description: `${leg.posicao === 'COMPRADA' ? 'Compra' : 'Venda'} ${leg.quantidade} ${leg.ativo} - ${structure.nome}`,
            amount: amount,
            balance: runningBalance,
            relatedStructureId: structure.id
          });
        }
      });
      // Prêmio líquido
      const premiumImpact = structure.legs.reduce((sum, leg) => {
        if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
          return sum + (leg.posicao === 'COMPRADA' ? -leg.premio : leg.premio) * leg.quantidade;
        }
        return sum;
      }, 0);
      
      if (premiumImpact !== 0) {
        runningBalance += premiumImpact;
        entries.push({
          id: `structure_premium_${structure.id}`,
          date: structure.dataAtivacao || structure.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          type: 'STRUCTURE_PREMIUM',
          description: `${premiumImpact > 0 ? 'Prêmio recebido' : 'Prêmio pago'} - ${structure.nome}`,
          amount: premiumImpact,
          balance: runningBalance,
          relatedStructureId: structure.id
        });
      }

      // Resultados das operações
      structure.operacoes?.forEach(operation => {
        if (operation.resultado !== 0) {
          runningBalance += operation.resultado;
          entries.push({
            id: `operation_result_${operation.id}`,
            date: operation.dataSaida || operation.dataEntrada,
            type: 'PROFIT',
            description: `Resultado operação ${operation.ativo} - ${structure.nome}`,
            amount: operation.resultado,
            balance: runningBalance,
            relatedStructureId: structure.id
          });
        }
      });
    }
  });

  // 3. Adicionar resultados de rolagens
  rolls.forEach(roll => {
    const structure = structures.find(s => s.id === roll.structureId);
    
    if (roll.lucroRealizado && roll.lucroRealizado !== 0) {
      runningBalance += roll.lucroRealizado;
      entries.push({
        id: `roll_profit_${roll.id}`,
        date: roll.dataRoll,
        type: 'PROFIT',
        description: `Lucro realizado na rolagem - ${structure?.nome || 'Estrutura'}`,
        amount: roll.lucroRealizado,
        balance: runningBalance,
        relatedRollId: roll.id,
        relatedStructureId: roll.structureId
      });
    }
  });

  // 4. Adicionar resultados de exercícios
  exercises.forEach(exercise => {
    const structure = structures.find(s => s.id === exercise.structureId);
    
    if (exercise.resultadoTotalExercicio !== 0) {
      runningBalance += exercise.resultadoTotalExercicio;
      entries.push({
        id: `exercise_result_${exercise.id}`,
        date: exercise.dataExercicio,
        type: 'PROFIT',
        description: `Resultado do exercício - ${structure?.nome || 'Estrutura'}`,
        amount: exercise.resultadoTotalExercicio,
        balance: runningBalance,
        relatedStructureId: exercise.structureId
      });
    }
  });

  return entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}