import React from 'react';
import { X, Target, TrendingUp, Shield, Zap, BarChart3 } from 'lucide-react';

interface TotalInvestedModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalInvested: number;
  structures: any[];
  assets: any[];
}

export default function TotalInvestedModal({ 
  isOpen, 
  onClose, 
  totalInvested,
  structures,
  assets 
}: TotalInvestedModalProps) {
  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate breakdown from structures
  let structuresInvested = 0;
  const structureBreakdown: any[] = [];
  
  // CORREÇÃO: Não calcular estruturas separadamente - elas já estão refletidas nos ativos
  console.log('🔍 TotalInvestedModal - Total Investido = apenas ativos em custódia');

  // Calcular valores dos ativos em custódia
  const stockValue = (assets || [])
    .filter((asset: any) => asset.type === 'STOCK')
    .reduce((sum: number, asset: any) => sum + (asset.quantity * asset.marketPrice), 0);

  const lftValue = (assets || [])
    .filter((asset: any) => asset.type === 'RENDA_FIXA' || asset.type === 'LFT')
    .reduce((sum: number, asset: any) => sum + (asset.quantity * asset.marketPrice), 0);

  const opcoesValue = (assets || [])
    .filter((asset: any) => asset.type === 'OPCOES')
    .reduce((sum: number, asset: any) => sum + (asset.quantity * asset.marketPrice), 0);

  const futurosValue = (assets || [])
    .filter((asset: any) => asset.type === 'FUTUROS')
    .reduce((sum: number, asset: any) => sum + (asset.quantity * asset.marketPrice), 0);

  // Total de Renda Variável = Ações + Opções + Futuros (custódia)
  const rendaVariavelTotal = Math.abs(stockValue) + Math.abs(opcoesValue) + Math.abs(futurosValue);
  
  // Total Investido = RF + RV (apenas ativos em custódia)
  const totalInvestedCorrected = Math.abs(lftValue) + rendaVariavelTotal;


  const breakdown = [
    {
      title: 'Renda Fixa',
      value: lftValue,
      icon: Shield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: `${(assets || []).filter((a: any) => a.type === 'RENDA_FIXA' || a.type === 'LFT').length} títulos`
    },
    {
      title: 'Renda Variável (Custódia)',
      value: stockValue + opcoesValue + futurosValue,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: `${(assets || []).filter((a: any) => a.type === 'STOCK' || a.type === 'OPCOES' || a.type === 'FUTUROS').length} ativos`
    },
    {
      title: 'Estruturas Ativas',
      value: Math.abs(structuresInvested),
      icon: Target,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      description: `${(structures || []).filter((s: any) => s.status === 'ATIVA').length} estruturas`
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-8 h-8 mr-3" />
              <div>
                <h3 className="text-2xl font-bold">Total Investido</h3>
                <p className="text-purple-100">Breakdown completo dos investimentos</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Total Summary */}
          <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h4 className="text-lg font-medium text-purple-300 mb-2">Total Consolidado</h4>
              <p className="text-4xl font-bold text-purple-400">{formatCurrency(totalInvestedCorrected)}</p>
              <p className="text-sm text-gray-400 mt-2">
                Soma de todos os investimentos ativos
              </p>
              <div className="mt-3 text-xs text-gray-500">
                <p>RF: {formatCurrency(Math.abs(lftValue))} + RV: {formatCurrency(rendaVariavelTotal)} + Estruturas: {formatCurrency(Math.abs(structuresInvested))}</p>
              </div>
            </div>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {breakdown.map((item, index) => (
              <div key={index} className={`${item.bgColor} border border-gray-600 rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-300">{item.title}</h3>
                    <p className={`text-2xl font-bold ${item.color}`}>
                      {formatCurrency(item.value)}
                    </p>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Explicação da Correção */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-blue-300 mb-4">
              ✅ Cálculo Corrigido - Total Investido
            </h4>
            
            <div className="space-y-3 text-sm text-blue-200">
              <p>
                <strong>Antes:</strong> Contava estruturas separadamente (dupla contagem)
              </p>
              <p>
                <strong>Agora:</strong> Total Investido = apenas ativos reais em custódia
              </p>
              <p className="text-blue-300 font-medium">
                💡 Estruturas ativas já movimentaram o caixa e os ativos resultantes estão na custódia
              </p>
            </div>
          </div>

          {/* Assets Detail */}
          {assets.length > 0 && (
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 mt-6">
              <h4 className="text-lg font-semibold text-white mb-4">
                Ativos em Custódia ({assets.length})
              </h4>
              
              <div className="space-y-3">
                {assets.map((asset: any) => {
                  const currentValue = asset.quantity * asset.marketPrice;
                  const investedValue = asset.quantity * asset.averagePrice;
                  const unrealizedPL = currentValue - investedValue;
                  const unrealizedPLPercentage = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;

                  return (
                    <div key={asset.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            asset.type === 'STOCK' ? 'bg-blue-500/20' :
                            asset.type === 'RENDA_FIXA' ? 'bg-green-500/20' :
                            asset.type === 'OPCOES' ? 'bg-purple-500/20' :
                            'bg-orange-500/20'
                          }`}>
                            {asset.type === 'STOCK' && <TrendingUp className="w-4 h-4 text-blue-400" />}
                            {asset.type === 'RENDA_FIXA' && <Shield className="w-4 h-4 text-green-400" />}
                            {asset.type === 'OPCOES' && <Zap className="w-4 h-4 text-purple-400" />}
                            {asset.type === 'FUTUROS' && <BarChart3 className="w-4 h-4 text-orange-400" />}
                          </div>
                          <div>
                            <h6 className="font-semibold text-white">{asset.symbol}</h6>
                            <p className="text-xs text-gray-400">{asset.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{formatCurrency(currentValue)}</p>
                          <p className={`text-sm ${unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {unrealizedPL >= 0 ? '+' : ''}{formatCurrency(unrealizedPL)} ({unrealizedPLPercentage >= 0 ? '+' : ''}{unrealizedPLPercentage.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
                        <div>Qtd: {asset.quantity.toLocaleString('pt-BR')}</div>
                        <div>PM: {formatCurrency(asset.averagePrice)}</div>
                        <div>Atual: {formatCurrency(asset.marketPrice)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}