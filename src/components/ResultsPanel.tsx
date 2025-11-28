import React, { useState } from 'react';
import { PieChart } from 'lucide-react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../types/trading';
import PerformanceCards from './results/PerformanceCards';
import ProfitChart from './results/ProfitChart';
import RevenueSection from './results/RevenueSection';
import CostsSection from './results/CostsSection';
import PerformanceSummary from './results/PerformanceSummary';
import { calculateResults } from './results/ResultsCalculator';
import { generateProfitData } from './results/ProfitDataGenerator';

interface ResultsPanelProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises?: ExerciseRecord[];
}

export default function ResultsPanel({ structures, rolls, exercises = [] }: ResultsPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  console.log('🔍 ResultsPanel - Input data:', {
    structures: structures.length,
    rolls: rolls.length,
    exercises: exercises.length,
    structuresWithOperations: structures.filter(s => s.operacoes && s.operacoes.length > 0).length,
    activeStructures: structures.filter(s => s.status === 'ATIVA').length,
    finalizedStructures: structures.filter(s => s.status === 'FINALIZADA').length
  });

  const results = calculateResults(structures, rolls, exercises);
  const profitData = generateProfitData(
    structures, 
    rolls, 
    exercises, 
    selectedPeriod, 
    selectedCategory, 
    selectedAsset,
    startDate, 
    endDate
  );

  // Get unique assets from all operations
  const allAssets = React.useMemo(() => {
    const assetSet = new Set<string>();
    
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
    
    // From structures
    structures.forEach(structure => {
      if (structure.ativo) {
        const baseAsset = extractBaseAsset(structure.ativo);
        if (baseAsset.length > 0) assetSet.add(baseAsset);
      }
      structure.legs.forEach(leg => {
        const baseAsset = extractBaseAsset(leg.ativo);
        if (baseAsset.length > 0) assetSet.add(baseAsset);
      });
      structure.operacoes?.forEach(op => {
        const baseAsset = extractBaseAsset(op.ativo);
        if (baseAsset.length > 0) assetSet.add(baseAsset);
      });
    });
    
    // From rolls
    rolls.forEach(roll => {
      roll.originalLegs.forEach(leg => {
        const baseAsset = extractBaseAsset(leg.ativo);
        if (baseAsset.length > 0) assetSet.add(baseAsset);
      });
      roll.newLegs.forEach(leg => {
        const baseAsset = extractBaseAsset(leg.ativo);
        if (baseAsset.length > 0) assetSet.add(baseAsset);
      });
    });
    
    // From exercises
    exercises.forEach(exercise => {
      exercise.opcoes.forEach(opcao => {
        const baseAsset = extractBaseAsset(opcao.ativo);
        if (baseAsset.length > 0) assetSet.add(baseAsset);
      });
    });
    
    return Array.from(assetSet).filter(asset => asset.length > 0).sort();
  }, [structures, rolls]);

  console.log('🔍 ResultsPanel - Generated profit data:', profitData.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Análise de Resultados</h2>
            <p className="text-gray-400">Strategos Partners - Performance das operações</p>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <PerformanceCards
        grossProfit={selectedAsset === 'all' ? results.grossProfit : calculateAssetResults(selectedAsset).grossProfit}
        netProfit={selectedAsset === 'all' ? results.netProfit : calculateAssetResults(selectedAsset).netProfit}
        profitMargin={selectedAsset === 'all' ? results.profitMargin : calculateAssetResults(selectedAsset).profitMargin}
        totalCosts={selectedAsset === 'all' ? results.totalCosts : calculateAssetResults(selectedAsset).totalCosts}
        selectedAsset={selectedAsset}
        allAssets={allAssets}
        onAssetChange={setSelectedAsset}
      />

      {/* Profit Chart */}
      <ProfitChart
        profitData={profitData}
        structures={structures}
        rolls={rolls}
        exercises={exercises}
        selectedCategory={selectedCategory}
        selectedPeriod={selectedPeriod}
        selectedAsset={selectedAsset}
        startDate={startDate}
        endDate={endDate}
        onCategoryChange={setSelectedCategory}
        onPeriodChange={setSelectedPeriod}
        onAssetChange={setSelectedAsset}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        allAssets={allAssets}
      />

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueSection 
          structures={selectedAsset === 'all' ? structures : filterStructuresByAsset(structures, selectedAsset)} 
          rolls={selectedAsset === 'all' ? rolls : filterRollsByAsset(rolls, selectedAsset)} 
          exercises={selectedAsset === 'all' ? exercises : filterExercisesByAsset(exercises, selectedAsset)}
          selectedAsset={selectedAsset}
        />
        
        <CostsSection
          brokerageCosts={selectedAsset === 'all' ? results.brokerageCosts : calculateAssetResults(selectedAsset).brokerageCosts}
          rollCosts={selectedAsset === 'all' ? results.rollCosts : calculateAssetResults(selectedAsset).rollCosts}
          emolumentsCosts={selectedAsset === 'all' ? results.emolumentsCosts : calculateAssetResults(selectedAsset).emolumentsCosts}
          taxCosts={selectedAsset === 'all' ? results.taxCosts : calculateAssetResults(selectedAsset).taxCosts}
          totalOperations={selectedAsset === 'all' ? results.totalOperations : calculateAssetResults(selectedAsset).totalOperations}
          totalRolls={selectedAsset === 'all' ? results.totalRolls : calculateAssetResults(selectedAsset).totalRolls}
          selectedAsset={selectedAsset}
        />
      </div>

      {/* Performance Summary */}
      <PerformanceSummary
        grossProfit={selectedAsset === 'all' ? results.grossProfit : calculateAssetResults(selectedAsset).grossProfit}
        totalCosts={selectedAsset === 'all' ? results.totalCosts : calculateAssetResults(selectedAsset).totalCosts}
        netProfit={selectedAsset === 'all' ? results.netProfit : calculateAssetResults(selectedAsset).netProfit}
        profitMargin={selectedAsset === 'all' ? results.profitMargin : calculateAssetResults(selectedAsset).profitMargin}
        selectedAsset={selectedAsset}
      />
    </div>
  );

  // Helper functions for asset filtering
  function filterStructuresByAsset(structures: OptionStructure[], asset: string) {
    const extractBaseAsset = (ativo: string) => {
      return ativo
        .replace(/[A-Z]\d+\d+$/, '') // Remove option codes like A17, U17
        .replace(/\d+$/, '')         // Remove trailing numbers like 4, 3
        .replace(/[A-Z]$/, '');      // Remove single trailing letters
    };
    
    return structures.filter(structure => {
      if (structure.ativo) {
        const baseAsset = extractBaseAsset(structure.ativo);
        if (baseAsset === asset) return true;
      }
      return structure.legs.some(leg => {
        const baseAsset = extractBaseAsset(leg.ativo);
        return baseAsset === asset;
      }) || structure.operacoes?.some(op => {
        const baseAsset = extractBaseAsset(op.ativo);
        return baseAsset === asset;
      });
    });
  }

  function filterRollsByAsset(rolls: RollPosition[], asset: string) {
    const extractBaseAsset = (ativo: string) => {
      return ativo
        .replace(/[A-Z]\d+\d+$/, '') // Remove option codes like A17, U17
        .replace(/\d+$/, '')         // Remove trailing numbers like 4, 3
        .replace(/[A-Z]$/, '');      // Remove single trailing letters
    };
    
    return rolls.filter(roll => {
      const hasOriginalAsset = roll.originalLegs.some(leg => {
        const baseAsset = extractBaseAsset(leg.ativo);
        return baseAsset === asset;
      });
      const hasNewAsset = roll.newLegs.some(leg => {
        const baseAsset = extractBaseAsset(leg.ativo);
        return baseAsset === asset;
      });
      return hasOriginalAsset || hasNewAsset;
    });
  }

  function filterExercisesByAsset(exercises: ExerciseRecord[], asset: string) {
    const extractBaseAsset = (ativo: string) => {
      return ativo
        .replace(/[A-Z]\d+\d+$/, '') // Remove option codes like A17, U17
        .replace(/\d+$/, '')         // Remove trailing numbers like 4, 3
        .replace(/[A-Z]$/, '');      // Remove single trailing letters
    };
    
    return exercises.filter(exercise => {
      return exercise.opcoes.some(opcao => {
        const baseAsset = extractBaseAsset(opcao.ativo);
        return baseAsset === asset;
      });
    });
  }

  function calculateAssetResults(asset: string) {
    const filteredStructures = filterStructuresByAsset(structures, asset);
    const filteredRolls = filterRollsByAsset(rolls, asset);
    const filteredExercises = filterExercisesByAsset(exercises, asset);
    
    return calculateResults(filteredStructures, filteredRolls, filteredExercises);
  }
}