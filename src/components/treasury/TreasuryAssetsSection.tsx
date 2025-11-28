import React, { useState } from 'react';
import { Shield, TrendingUp, Banknote, Target, Eye, Zap, BarChart3 } from 'lucide-react';
import { OptionStructure } from '../../types/trading';
import AssetsCustodyBreakdown from './AssetsCustodyBreakdown';

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

interface TreasuryAssetsSectionProps {
  assets: Asset[];
  structures: OptionStructure[];
  onViewStructure: (structure: OptionStructure) => void;
}

export default function TreasuryAssetsSection({ 
  assets, 
  structures, 
  onViewStructure 
}: TreasuryAssetsSectionProps) {
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate values by asset type
  const stockAssets = assets.filter(asset => asset.type === 'STOCK');
  const rendaFixaAssets = assets.filter(asset => asset.type === 'RENDA_FIXA');
  const opcoesAssets = assets.filter(asset => asset.type === 'OPCOES');
  const futurosAssets = assets.filter(asset => asset.type === 'FUTUROS');
  
  const stockValue = stockAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const rendaFixaValue = rendaFixaAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const opcoesValue = opcoesAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const futurosValue = futurosAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);

  // Add cash balance from structures
  const cashBalance = structures.reduce((sum, structure) => {
    const operationResults = structure.operacoes?.reduce((opSum, op) => opSum + op.resultado, 0) || 0;
    return sum + operationResults;
  }, 0);

  const custodyItems = [
    {
      title: 'Ações',
      description: `${stockAssets.length} ativos em carteira`,
      value: stockValue,
      icon: TrendingUp,
      color: 'blue',
      count: stockAssets.length,
      type: 'STOCK',
      assets: stockAssets
    },
    {
      title: 'Renda Fixa',
      description: `${rendaFixaAssets.length} títulos de renda fixa`,
      value: rendaFixaValue,
      icon: Shield,
      color: 'green',
      count: rendaFixaAssets.length,
      type: 'RENDA_FIXA',
      assets: rendaFixaAssets
    },
    {
      title: 'Opções',
      description: `${opcoesAssets.length} contratos de opções`,
      value: opcoesValue,
      icon: Zap,
      color: 'purple',
      count: opcoesAssets.length,
      type: 'OPCOES',
      assets: opcoesAssets
    },
    {
      title: 'Futuros',
      description: `${futurosAssets.length} contratos futuros`,
      value: futurosValue,
      icon: BarChart3,
      color: 'orange',
      count: futurosAssets.length,
      type: 'FUTUROS',
      assets: futurosAssets
    },
    {
      title: 'Saldo em Conta',
      description: 'Resultado de operações + depósitos',
      value: Math.max(0, cashBalance),
      icon: Banknote,
      color: 'cyan',
      count: 1,
      type: 'CASH',
      assets: []
    }
  ];

  const getFilteredAssets = () => {
    if (!selectedAssetType) return [];
    return custodyItems.find(item => item.type === selectedAssetType)?.assets || [];
  };

  return (
    <div className="space-y-6">
      {/* Clickable Asset Categories */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center mb-6">
          <Shield className="w-6 h-6 text-blue-400 mr-3" />
          <h3 className="text-lg font-semibold text-white">Ativos sob Custódia</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {custodyItems.map((item, index) => (
            <button
              key={index}
              onClick={() => setSelectedAssetType(selectedAssetType === item.type ? null : item.type)}
              className={`flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
                selectedAssetType === item.type 
                  ? 'bg-blue-600/20 border-2 border-blue-500' 
                  : 'bg-gray-900/50 hover:bg-gray-800 border border-gray-700'
              }`}
            >
              <div className="flex items-center">
                <item.icon className={`w-5 h-5 mr-3 ${
                  item.color === 'blue' ? 'text-blue-400' :
                  item.color === 'green' ? 'text-green-400' :
                  item.color === 'purple' ? 'text-purple-400' :
                  item.color === 'orange' ? 'text-orange-400' :
                  'text-cyan-400'
                }`} />
                <div className="text-left">
                  <p className="text-white font-medium">{item.title}</p>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  item.color === 'blue' ? 'text-blue-400' :
                  item.color === 'green' ? 'text-green-400' :
                  item.color === 'purple' ? 'text-purple-400' :
                  item.color === 'orange' ? 'text-orange-400' :
                  'text-cyan-400'
                }`}>
                  {formatCurrency(item.value)}
                </p>
                {item.count > 1 && (
                  <p className="text-xs text-gray-500">{item.count} itens</p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Expanded Asset Details */}
        {selectedAssetType && (
          <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <h4 className="text-white font-medium mb-4">
              Detalhes - {custodyItems.find(item => item.type === selectedAssetType)?.title}
            </h4>
            
            {getFilteredAssets().length > 0 ? (
              <div className="space-y-3">
                {getFilteredAssets().map((asset) => {
                  const currentValue = asset.quantity * asset.marketPrice;
                  const investedValue = asset.quantity * asset.averagePrice;
                  const unrealizedPL = currentValue - investedValue;
                  const unrealizedPLPercentage = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;

                  return (
                    <div key={asset.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-bold text-white">{asset.symbol}</h5>
                          <p className="text-gray-400 text-sm">{asset.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {formatCurrency(currentValue)}
                          </div>
                          <div className={`text-sm font-medium ${
                            unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {unrealizedPL >= 0 ? '+' : ''}{formatCurrency(unrealizedPL)} ({unrealizedPLPercentage >= 0 ? '+' : ''}{unrealizedPLPercentage.toFixed(2)}%)
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Quantidade</p>
                          <p className="text-white font-medium">{asset.quantity.toLocaleString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Preço Médio</p>
                          <p className="text-white font-medium">{formatCurrency(asset.averagePrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Preço Atual</p>
                          <p className="text-white font-medium">{formatCurrency(asset.marketPrice)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400">Nenhum ativo nesta categoria</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Asset Breakdown */}
      <AssetsCustodyBreakdown assets={assets} structures={structures} />
    </div>
  );
}