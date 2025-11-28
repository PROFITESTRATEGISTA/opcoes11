import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { OptionLeg } from '../../types/trading';

interface RollSummaryProps {
  originalLegs: OptionLeg[];
  newLegs: OptionLeg[];
  totalCost: number;
  realizedProfit: number;
}

export default function RollSummary({ 
  originalLegs, 
  newLegs, 
  totalCost, 
  realizedProfit 
}: RollSummaryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      month: 'short', 
      year: '2-digit' 
    });
  };

  const netResult = realizedProfit - totalCost;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Resumo da Rolagem</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-600">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-300">Lucro Realizado</p>
          <p className={`text-2xl font-bold ${realizedProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(realizedProfit)}
          </p>
        </div>
        
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-red-600 font-bold text-sm">-</span>
          </div>
          <p className="text-sm font-medium text-gray-300">Custo Total</p>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(Math.abs(totalCost))}
          </p>
        </div>
        
        <div className="text-center p-4 bg-gray-800 rounded-lg border border-gray-600">
          {netResult >= 0 ? (
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
          ) : (
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
          )}
          <p className="text-sm font-medium text-gray-300">Resultado Líquido</p>
          <p className={`text-2xl font-bold ${netResult >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {formatCurrency(netResult)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-white mb-3">Posições Fechadas ({originalLegs.length})</h4>
          <div className="space-y-2">
            {originalLegs.map((leg, index) => (
              <div key={index} className="bg-red-900/20 border border-red-500/30 rounded p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{leg.ativo}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    leg.posicao === 'COMPRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {leg.posicao}
                  </span>
                </div>
                <div className="mt-1 text-gray-300">
                  {leg.tipo} • Strike: {formatCurrency(leg.strike)} • Prêmio: {formatCurrency(leg.premio)} • Venc: {formatDate(leg.vencimento)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-white mb-3">Novas Posições ({newLegs.length})</h4>
          <div className="space-y-2">
            {newLegs.map((leg, index) => (
              <div key={index} className="bg-green-900/20 border border-green-500/30 rounded p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-white">{leg.ativo}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    leg.posicao === 'COMPRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {leg.posicao}
                  </span>
                </div>
                <div className="mt-1 text-gray-300">
                  {leg.tipo} • Strike: {formatCurrency(leg.strike)} • Prêmio: {formatCurrency(leg.premio)} • Venc: {formatDate(leg.vencimento)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}