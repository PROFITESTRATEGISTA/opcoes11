import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';

export interface ProfitEntry {
  date: string;
  structures: number;
  rolls: number;
  exercises: number;
  total: number;
  category: string;
  cumulativeStructures: number;
  cumulativeRolls: number;
  cumulativeExercises: number;
  cumulativeTotal: number;
}

export function generateProfitData(
  structures: OptionStructure[],
  rolls: RollPosition[],
  exercises: ExerciseRecord[],
  selectedPeriod: string,
  selectedCategory: string,
  selectedAsset: string,
  startDate: string,
  endDate: string
): ProfitEntry[] {
  console.log('🔍 ProfitDataGenerator - Input data:', {
    structures: structures.length,
    rolls: rolls.length,
    exercises: exercises.length,
    selectedPeriod,
    selectedCategory,
    selectedAsset
  });

  // Helper function to extract base asset from real tickers
  const extractBaseAsset = (ativo: string) => {
    // For stocks: PETR4 -> PETR4, VALE3 -> VALE3 (keep as is)
    // For options: PETRA17 -> PETR4, VALEU17 -> VALE3 (extract base stock)
    
    // If it's already a stock ticker (ends with number), keep it
    if (/\d+$/.test(ativo) && !/[A-Z]\d+$/.test(ativo)) {
      return ativo; // PETR4, VALE3, etc.
    }
    
    // If it's an option code (has month letter + year + strike)
    if (/[A-Z]\d+\d+$/.test(ativo)) {
      // Extract base: PETRA17 -> PETR, VALEU17 -> VALE
      const base = ativo.replace(/[A-Z]\d+\d+$/, '');
      
      // Map common bases to their stock tickers
      const stockMapping: {[key: string]: string} = {
        'PETR': 'PETR4',
        'VALE': 'VALE3', 
        'ITUB': 'ITUB4',
        'BBDC': 'BBDC4',
        'ABEV': 'ABEV3',
        'MGLU': 'MGLU3',
        'WEGE': 'WEGE3',
        'RENT': 'RENT3',
        'LREN': 'LREN3',
        'JBSS': 'JBSS3',
        'SUZB': 'SUZB3',
        'USIM': 'USIM5',
        'CSNA': 'CSNA3',
        'GOAU': 'GOAU4',
        'CIEL': 'CIEL3',
        'RADL': 'RADL3',
        'HAPV': 'HAPV3',
        'TOTS': 'TOTS3'
      };
      
      return stockMapping[base] || `${base}4`; // Default to base + 4
    }
    
    // For futures (WIN, WDO, BIT) keep as is
    if (['WIN', 'WDO', 'BIT'].some(fut => ativo.startsWith(fut))) {
      return ativo.substring(0, 3); // WIN, WDO, BIT
    }
    
    return ativo; // Return as is for other cases
  };

  // Helper function to check if an asset matches the filter
  const assetMatches = (ativo: string, filterAsset: string) => {
    if (filterAsset === 'all') return true;
    const baseAsset = extractBaseAsset(ativo);
    return baseAsset === filterAsset;
  };

  const profitEntries: Omit<ProfitEntry, 'cumulative' | 'cumulativeStructures' | 'cumulativeRolls' | 'cumulativeExercises' | 'cumulativeTotal'>[] = [];
  
  // Structure profits - apenas resultados de operações reais (não prêmios teóricos)
  structures.forEach(structure => {
    // Filter by asset if specified
    if (selectedAsset !== 'all') {
      const structureHasAsset = structure.ativo === selectedAsset || 
        structure.legs.some(leg => assetMatches(leg.ativo, selectedAsset)) ||
        structure.operacoes?.some(op => assetMatches(op.ativo, selectedAsset));
      
      if (!structureHasAsset) return;
    }

    console.log(`🔍 Processing structure: ${structure.nome}`, {
      status: structure.status,
      operacoes: structure.operacoes?.length || 0,
      dataAtivacao: structure.dataAtivacao,
      dataFinalizacao: structure.dataFinalizacao
    });


    // Apenas resultados de operações reais (não prêmios teóricos)
    if (structure.operacoes) {
      structure.operacoes.forEach(operation => {
        // Filter by asset if specified
        if (selectedAsset !== 'all' && !assetMatches(operation.ativo, selectedAsset)) {
          return;
        }

        console.log(`🔍 Processing operation:`, {
          ativo: operation.ativo,
          resultado: operation.resultado,
          dataEntrada: operation.dataEntrada,
          dataSaida: operation.dataSaida,
          status: operation.status
        });

        if (operation.resultado !== 0 && operation.status === 'Fechada') {
          profitEntries.push({
            date: operation.dataSaida || operation.dataEntrada,
            structures: operation.resultado,
            rolls: 0,
            exercises: 0,
            total: operation.resultado,
            category: 'structures'
          });
          
          console.log(`🔍 Added operation profit entry:`, {
            operation: operation.ativo,
            date: operation.dataSaida || operation.dataEntrada,
            resultado: operation.resultado
          });
        }
      });
    }

  });

  // Roll profits
  rolls.forEach(roll => {
    // Filter by asset if specified
    if (selectedAsset !== 'all') {
      const rollHasAsset = roll.originalLegs.some(leg => assetMatches(leg.ativo, selectedAsset));
      if (!rollHasAsset) return;
    }

    console.log(`🔍 Processing roll:`, {
      structureId: roll.structureId,
      dataRoll: roll.dataRoll,
      lucroRealizado: roll.lucroRealizado,
      status: roll.status
    });

    if (roll.lucroRealizado && roll.lucroRealizado !== 0 && roll.status === 'EXECUTADO') {
      profitEntries.push({
        date: roll.dataRoll,
        structures: 0,
        rolls: roll.lucroRealizado,
        exercises: 0,
        total: roll.lucroRealizado,
        category: 'rolls'
      });
      
      console.log(`🔍 Added roll profit entry:`, {
        date: roll.dataRoll,
        lucro: roll.lucroRealizado
      });
    }
  });

  // Exercise profits
  exercises.forEach(exercise => {
    // Filter by asset if specified
    if (selectedAsset !== 'all') {
      const exerciseHasAsset = exercise.opcoes.some(opcao => assetMatches(opcao.ativo, selectedAsset));
      if (!exerciseHasAsset) return;
    }

    console.log(`🔍 Processing exercise:`, {
      structureId: exercise.structureId,
      dataExercicio: exercise.dataExercicio,
      resultado: exercise.resultadoTotalExercicio,
      status: exercise.status
    });

    if (exercise.resultadoTotalExercicio !== 0 && exercise.status === 'EXECUTADO') {
      profitEntries.push({
        date: exercise.dataExercicio,
        structures: 0,
        rolls: 0,
        exercises: exercise.resultadoTotalExercicio,
        total: exercise.resultadoTotalExercicio,
        category: 'exercises'
      });
      
      console.log(`🔍 Added exercise profit entry:`, {
        date: exercise.dataExercicio,
        resultado: exercise.resultadoTotalExercicio
      });
    }
  });

  console.log(`🔍 Total profit entries generated: ${profitEntries.length}`);

  // Sort by date
  profitEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(`🔍 Profit entries after sorting:`, profitEntries);

  // Filter by period
  let filteredEntries = [...profitEntries];
  const now = new Date();

  if (selectedPeriod !== 'all') {
    const cutoffDate = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          filteredEntries = filteredEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= start && entryDate <= end;
          });
        }
        break;
    }

    if (selectedPeriod !== 'custom') {
      filteredEntries = filteredEntries.filter(entry => new Date(entry.date) >= cutoffDate);
    }
  }

  // Filter by category
  if (selectedCategory !== 'all') {
    filteredEntries = filteredEntries.filter(entry => entry.category === selectedCategory);
  }

  console.log(`🔍 Filtered entries (${selectedPeriod}, ${selectedCategory}):`, filteredEntries.length);

  // Calculate cumulative profits
  let cumulativeStructures = 0;
  let cumulativeRolls = 0;
  let cumulativeExercises = 0;
  let cumulativeTotal = 0;

  const finalEntries = filteredEntries.map(entry => {
    cumulativeStructures += entry.structures;
    cumulativeRolls += entry.rolls;
    cumulativeExercises += entry.exercises;
    cumulativeTotal += entry.total;
    
    return {
      ...entry,
      cumulativeStructures,
      cumulativeRolls,
      cumulativeExercises,
      cumulativeTotal
    };
  });

  console.log(`🔍 Final profit data:`, finalEntries);
  
  return finalEntries;
}