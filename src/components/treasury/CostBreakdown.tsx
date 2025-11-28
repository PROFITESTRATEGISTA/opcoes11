import React from 'react';
import { Calculator } from 'lucide-react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';

interface CostBreakdownProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises: ExerciseRecord[];
}

export default function CostBreakdown({ structures, rolls, exercises }: CostBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const brokerageCosts = structures.reduce((acc, structure) => {
    const operationCount = structure.operacoes?.length || 0;
    return acc + (operationCount * 2.5);
  }, 0);

  const rollCosts = rolls.reduce((acc, roll) => {
    return acc + Math.abs(roll.custoRoll);
  }, 0);

  const exerciseCosts = exercises.reduce((sum, exercise) => sum + exercise.custoTotalExercicio, 0);

  const costItems = [
    {
      title: 'Corretagem',
      description: `${structures.reduce((sum, s) => sum + (s.operacoes?.length || 0), 0)} operações × R$ 2,50`,
      value: brokerageCosts
    },
    {
      title: 'Custos de Roll',
      description: 'Ajustes e reposicionamentos',
      value: rollCosts
    },
    {
      title: 'Custos de Exercício',
      description: `${exercises.length} exercícios executados`,
      value: exerciseCosts
    }
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Calculator className="w-6 h-6 text-red-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">Custos Operacionais</h3>
      </div>
      
      <div className="space-y-4">
        {costItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div>
              <p className="text-white font-medium">{item.title}</p>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
            <p className="text-lg font-bold text-red-400">
              {formatCurrency(item.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}