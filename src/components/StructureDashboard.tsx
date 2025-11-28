import React from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Calendar } from 'lucide-react';
import { OptionStructure } from '../types/trading';

interface StructureDashboardProps {
  structures: OptionStructure[];
}

export default function StructureDashboard({ structures }: StructureDashboardProps) {
  const stats = React.useMemo(() => {
    const totalStructures = structures.length;
    const activeStructures = structures.filter(s => s.status === 'ATIVA').length;
    const finishedStructures = structures.filter(s => s.status === 'FINALIZADA').length;
    const buildingStructures = structures.filter(s => s.status === 'MONTANDO').length;
    
    const totalResult = structures
      .filter(s => s.operacoes && s.operacoes.length > 0)
      .reduce((sum, structure) => {
        const structureResult = structure.operacoes!.reduce((opSum, op) => opSum + op.resultado, 0);
        return sum + structureResult;
      }, 0);

    const totalOperations = structures.reduce((sum, s) => sum + (s.operacoes?.length || 0), 0);

    return {
      totalStructures,
      activeStructures,
      finishedStructures,
      buildingStructures,
      totalResult,
      totalOperations
    };
  }, [structures]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };


  return (
    <div className="space-y-6">
      {/* Status breakdown */}
      <div className="md:col-span-2 lg:col-span-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Status das Estruturas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.buildingStructures}</div>
            <div className="text-sm text-yellow-700">Em Montagem</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.activeStructures}</div>
            <div className="text-sm text-green-700">Ativas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.finishedStructures}</div>
            <div className="text-sm text-blue-700">Finalizadas</div>
          </div>
        </div>
      </div>
    </div>
  );
}