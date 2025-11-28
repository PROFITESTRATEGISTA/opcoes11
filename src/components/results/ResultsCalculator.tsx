import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';

export interface ResultsData {
  grossProfit: number;
  netProfit: number;
  structureResults: number;
  rollResults: number;
  exerciseResults: number;
  brokerageCosts: number;
  rollCosts: number;
  emolumentsCosts: number;
  exerciseCosts: number;
  taxCosts: number;
  totalCosts: number;
  totalOperations: number;
  totalRolls: number;
  profitMargin: number;
}

export function calculateResults(
  structures: OptionStructure[], 
  rolls: RollPosition[], 
  exercises: ExerciseRecord[]
): ResultsData {
  // Resultado das estruturas - apenas operações reais (não prêmios teóricos)
  const structureResults = structures.reduce((acc, structure) => {
    const operationResults = structure.operacoes?.reduce((sum, op) => sum + op.resultado, 0) || 0;
    return acc + operationResults;
  }, 0);

  // Resultado das rolagens
  const rollResults = rolls.reduce((acc, roll) => {
    return acc + (roll.lucroRealizado || 0);
  }, 0);

  // Resultado dos exercícios
  const exerciseResults = exercises.reduce((sum, exercise) => sum + exercise.resultadoTotalExercicio, 0);

  // Custos operacionais
  const brokerageCosts = structures.reduce((acc, structure) => {
    const operationCount = structure.operacoes?.length || 0;
    return acc + (operationCount * 2.5);
  }, 0);

  const rollCosts = rolls.reduce((acc, roll) => {
    return acc + Math.abs(roll.custoRoll);
  }, 0);

  const emolumentsCosts = structures.reduce((acc, structure) => {
    const operationResults = structure.operacoes?.reduce((sum, op) => sum + Math.abs(op.resultado), 0) || 0;
    return acc + (operationResults * 0.0025);
  }, 0);

  const exerciseCosts = exercises.reduce((sum, exercise) => sum + exercise.custoTotalExercicio, 0);

  const taxCosts = Math.max(0, (structureResults + rollResults + exerciseResults) * 0.15);

  const totalCosts = brokerageCosts + rollCosts + emolumentsCosts + exerciseCosts + taxCosts;
  const grossProfit = structureResults + rollResults + exerciseResults;
  const netProfit = grossProfit - totalCosts;

  return {
    grossProfit,
    netProfit,
    structureResults,
    rollResults,
    exerciseResults,
    brokerageCosts,
    rollCosts,
    emolumentsCosts,
    exerciseCosts,
    taxCosts,
    totalCosts,
    totalOperations: structures.reduce((sum, s) => sum + (s.operacoes?.length || 0), 0),
    totalRolls: rolls.length,
    profitMargin: grossProfit !== 0 ? (netProfit / grossProfit) * 100 : 0
  };
}