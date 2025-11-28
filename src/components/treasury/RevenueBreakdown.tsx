import React from 'react';
import { BarChart3, Target, Activity, Zap } from 'lucide-react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';

interface RevenueBreakdownProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises?: ExerciseRecord[];
}

export default function RevenueBreakdown({ structures, rolls, exercises = [] }: RevenueBreakdownProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const structureResults = structures.reduce((acc, structure) => {
    const operationResults = structure.operacoes?.reduce((sum, op) => sum + op.resultado, 0) || 0;
    return acc + operationResults;
  }, 0);

  const rollResults = rolls.reduce((acc, roll) => {
    return acc + (roll.lucroRealizado || 0);
  }, 0);

  const exerciseResults = exercises.reduce((sum, e) => sum + e.resultadoTotalExercicio, 0);

  const revenueItems = [
    {
      title: 'Estruturas',
      description: `${structures.length} estruturas ativas`,
      value: structureResults,
      icon: Target,
      color: 'blue'
    },
    {
      title: 'Rolagens',
      description: `${rolls.length} rolagens executadas`,
      value: rollResults,
      icon: Activity,
      color: 'orange'
    },
    {
      title: 'Exercícios',
      description: `${exercises.length} exercícios executados`,
      value: exerciseResults,
      icon: Zap,
      color: 'purple'
    }
  ];

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-green-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">Receitas</h3>
      </div>
      
      <div className="space-y-4">
        {revenueItems.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center">
              <item.icon className={`w-5 h-5 mr-3 ${
                item.color === 'blue' ? 'text-blue-400' :
                item.color === 'orange' ? 'text-orange-400' :
                'text-purple-400'
              }`} />
              <div>
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-lg font-bold ${item.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(item.value)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}