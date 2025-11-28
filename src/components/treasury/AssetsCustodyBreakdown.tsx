import React, { useState } from 'react';
import { Shield, TrendingUp, Banknote, Target, Eye, X, TrendingDown, Zap, BarChart3, Wallet } from 'lucide-react';
import { OptionStructure } from '../../types/trading';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  marketPrice: number;
  guaranteeReleased: number;
  usedAsGuarantee: boolean;
  type: 'STOCK' | 'LFT';
}

interface AssetsCustodyBreakdownProps {
  assets: Asset[];
  structures: OptionStructure[];
  currentBalance?: number;
}

export default function AssetsCustodyBreakdown({ assets, structures, currentBalance = 0 }: AssetsCustodyBreakdownProps) {
  const [showExpanded, setShowExpanded] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calculate values by asset type
  const stockAssets = assets.filter(asset => asset.type === 'STOCK');
  const rendaFixaAssets = assets.filter(asset => asset.type === 'LFT');
  const opcoesAssets = assets.filter(asset => asset.symbol.includes('_OPT'));
  const futurosAssets = assets.filter(asset => asset.symbol.includes('_FUT'));
  
  const stockValue = stockAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const rendaFixaValue = rendaFixaAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const opcoesValue = opcoesAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const futurosValue = futurosAssets.reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  
  // Calculate positions from active structures (include in variable income)
  const structurePositions = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((acc, structure) => {
      structure.legs.forEach(leg => {
        if (leg.tipo === 'ACAO') {
          // Ações: compradas são positivas, vendidas são negativas
          const value = (leg.precoEntrada || 0) * leg.quantidade;
          acc.stockValue += leg.posicao === 'COMPRADA' ? value : -value;
        } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
          // Opções: compradas são débito (-), vendidas são crédito (+)
          const value = leg.premio * leg.quantidade;
          acc.opcoesValue += leg.posicao === 'COMPRADA' ? value : -value;
        } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
          // Futuros: compradas são débito (-), vendidas são crédito (+)
          const value = leg.premio * leg.quantidade;
          acc.futurosValue += leg.posicao === 'COMPRADA' ? value : -value;
        }
      });
      return acc;
    }, { stockValue: 0, opcoesValue: 0, futurosValue: 0 });
  
  // Add cash balance from structures and operations
  // Usar o saldo atual passado pelos props (integrado com dashboard)
  const cashBalance = Math.max(0, currentBalance); // Valor integrado do dashboard
  
  // CORREÇÃO: Não somar estruturas duas vezes - elas já estão incluídas no cálculo de ativos
  const totalVariableIncomeValue = stockValue + opcoesValue + futurosValue;
  const totalCustodyValue = totalVariableIncomeValue + rendaFixaValue + cashBalance;

  // Calculate total notional exposure from all active structures
  const totalNotionalExposure = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      return sum + structure.legs.reduce((legSum, leg) => {
        if (leg.tipo === 'ACAO') {
          return legSum + ((leg.precoEntrada || 0) * leg.quantidade);
        } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
          return legSum + (leg.strike * leg.quantidade);
        } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
          return legSum + ((leg.precoVista || 0) * leg.quantidade);
        }
        return legSum;
      }, 0);
    }, 0);

  const custodyItems = [
    { 
      title: 'Caixa Livre',
      description: 'Saldo livre para operações',
      value: currentBalance,
      icon: Banknote,
      color: 'cyan',
      count: 1,
      type: 'CASH',
      assets: []
    },
    {
      title: 'Renda Fixa',
      description: `${rendaFixaAssets.length} títulos de renda fixa`,
      value: rendaFixaValue,
      icon: Shield,
      color: 'green',
      count: rendaFixaAssets.length,
      type: 'LFT',
      assets: rendaFixaAssets
    },
    {
      title: 'Renda Variável',
      description: `${stockAssets.length + opcoesAssets.length + futurosAssets.length} ativos + estruturas`,
      value: totalVariableIncomeValue,
      icon: TrendingUp,
      color: 'blue',
      count: stockAssets.length + opcoesAssets.length + futurosAssets.length,
      type: 'VARIABLE',
      assets: [...stockAssets, ...opcoesAssets, ...futurosAssets]
    },
    {
      title: 'Nocional Total',
      description: 'Exposição total das estruturas ativas',
      value: totalNotionalExposure,
      icon: Target,
      color: 'purple',
      count: structures.filter(s => s.status === 'ATIVA').length,
      type: 'NOTIONAL',
      assets: []
    },
    {
      title: 'Total Investido',
      description: 'Renda Variável + Renda Fixa + Estruturas',
      value: stockValue + rendaFixaValue + totalVariableIncomeValue,
      icon: Wallet,
      color: 'indigo',
      count: assets.length + structures.filter(s => s.status === 'ATIVA').length,
      type: 'TOTAL_INVESTED',
      assets: []
    },
    {
      title: 'Total sob Custódia',
      description: 'Valor total de ativos + saldo',
      value: totalCustodyValue,
      icon: Wallet,
      color: 'yellow',
      count: assets.length,
      type: 'TOTAL',
      assets: []
    }
  ];

  const getFilteredAssets = () => {
    if (!selectedAssetType) return [];
    const item = custodyItems.find(item => item.type === selectedAssetType);
    return item?.assets || [];
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 text-blue-400 mr-3" />
        <h3 className="text-lg font-semibold text-white">Ativos sob Custódia</h3>
      </div>
      
      <div className="space-y-4">
        {custodyItems.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectedAssetType(selectedAssetType === item.type ? null : item.type)}
            className={`w-full flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer ${
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
                item.color === 'cyan' ? 'text-cyan-400' :
                item.color === 'purple' ? 'text-purple-400' :
               item.color === 'indigo' ? 'text-indigo-400' :
                'text-yellow-400'
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
                item.color === 'cyan' ? 'text-cyan-400' :
                item.color === 'purple' ? 'text-purple-400' :
               item.color === 'indigo' ? 'text-indigo-400' :
                'text-yellow-400'
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
          
          {selectedAssetType === 'VARIABLE' ? (
            <div className="space-y-3">
              {/* Assets from custody */}
              {getFilteredAssets().map((asset) => {
                const currentValue = asset.quantity * asset.marketPrice;
                const investedValue = asset.quantity * asset.averagePrice;
                const unrealizedPL = currentValue - investedValue;
                const unrealizedPLPercentage = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;
                const guaranteeValue = (currentValue * asset.guaranteeReleased) / 100;

                return (
                  <div key={asset.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-white">{asset.symbol}</h5>
                        <p className="text-gray-400 text-sm">{asset.name}</p>
                        {asset.symbol.includes('_OPT') && (
                          <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400 mt-1 inline-block">
                            OPÇÃO
                          </span>
                        )}
                        {asset.symbol.includes('_FUT') && (
                          <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400 mt-1 inline-block">
                            FUTURO
                          </span>
                        )}
                        {!asset.symbol.includes('_OPT') && !asset.symbol.includes('_FUT') && (
                          <span className={`px-2 py-1 text-xs rounded ${
                          asset.type === 'STOCK' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                          } mt-1 inline-block`}>
                            {asset.type === 'STOCK' ? 'AÇÃO' : 'RENDA FIXA'}
                          </span>
                        )}
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
                        <p className="text-gray-400">Garantia</p>
                        <p className="text-orange-400 font-medium">
                          {asset.guaranteeReleased.toFixed(1)}% = {formatCurrency(guaranteeValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Positions from active structures */}
              {structures
                .filter(s => s.status === 'ATIVA')
                .map(structure => {
                  // Calculate total net value for all legs (including sold positions)
                  const totalInvestedValue = structure.legs.reduce((sum, leg) => {
                    if (leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') {
                      return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                    } else if (leg.tipo === 'ACAO' && leg.posicao === 'VENDIDA') {
                      return sum - ((leg.precoEntrada || 0) * leg.quantidade);
                    } else if ((leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'COMPRADA') {
                      return sum + (leg.premio * leg.quantidade);
                    } else if ((leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'VENDIDA') {
                      return sum - (leg.premio * leg.quantidade);
                    } else if ((leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && leg.posicao === 'COMPRADA') {
                      return sum + (leg.premio * leg.quantidade);
                    } else if ((leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && leg.posicao === 'VENDIDA') {
                      return sum - (leg.premio * leg.quantidade);
                    }
                    return sum;
                  }, 0);
                  
                  // Calcular nocional total (exposição)
                  const totalNotional = structure.legs.reduce((sum, leg) => {
                    if (leg.tipo === 'ACAO') {
                      return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                    } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                      return sum + (leg.strike * leg.quantidade);
                    } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
                      return sum + ((leg.precoVista || 0) * leg.quantidade);
                    }
                    return sum;
                  }, 0);
                  
                  // Calculate guarantee from stock positions (60% of stock value)
                  const stockValue = structure.legs
                    .filter(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA')
                    .reduce((sum, leg) => sum + ((leg.precoEntrada || 0) * leg.quantidade), 0);
                  const guaranteeFromStructure = stockValue * 0.6;
                  
                  return (
                    <div key={structure.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h5 className="font-bold text-white">{structure.nome}</h5>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-gray-400 text-sm">Estrutura Ativa</p>
                            {structure.legs.some(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') && (
                              <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                🏦 COM ATIVOS
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                              ESTRUTURA
                            </span>
                            {guaranteeFromStructure > 0 && (
                              <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                🛡️ GARANTIA: {formatCurrency(guaranteeFromStructure)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-white">
                            {formatCurrency(totalInvestedValue)}
                          </div>
                          <div className={`text-sm space-y-1 ${totalInvestedValue >= 0 ? 'text-gray-400' : 'text-red-400'}`}>
                            <div>{structure.legs.length} posições</div>
                            <div className="text-blue-400 font-medium">
                              Nocional: {formatCurrency(totalNotional)}
                            </div>
                            {totalInvestedValue < 0 && (
                              <div className="text-red-400 font-medium text-xs">
                                POSIÇÃO LÍQUIDA VENDIDA
                              </div>
                            )}
                            {guaranteeFromStructure > 0 && (
                              <div className="text-green-400 font-medium">
                                Garantia: {formatCurrency(guaranteeFromStructure)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {structure.legs.map((leg, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                leg.tipo === 'ACAO' ? 'bg-blue-500/20 text-blue-400' :
                                leg.tipo === 'CALL' ? 'bg-green-500/20 text-green-400' :
                                leg.tipo === 'PUT' ? 'bg-red-500/20 text-red-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {leg.tipo}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded ${
                                leg.posicao === 'COMPRADA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {leg.posicao}
                              </span>
                              <span className="text-white font-medium">{leg.ativo}</span>
                              <span className="text-gray-400">x{leg.quantidade}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-medium">
                                {formatCurrency((() => {
                                  if (leg.tipo === 'ACAO') {
                                    return leg.precoEntrada || 0;
                                  } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
                                    return leg.precoVista || 0;
                                  } else {
                                    return leg.strike || 0;
                                  }
                                })())}
                              </div>
                              <div className="text-xs text-gray-400">
                                {leg.tipo === 'ACAO' ? 'Preço Entrada' : 
                                 leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT' ? 'Preço Futuro' :
                                 'Strike'}
                              </div>
                              {leg.premio !== 0 && (
                                <div className={`text-xs font-medium ${
                                  leg.posicao === 'COMPRADA' ? 'text-red-400' : 'text-green-400'
                                }`}>
                                  Prêmio: {leg.posicao === 'COMPRADA' ? '-' : '+'}{formatCurrency(Math.abs(leg.premio))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : selectedAssetType === 'LFT' && getFilteredAssets().length > 0 ? (
            <div className="space-y-3">
              {getFilteredAssets().map((asset) => {
                const currentValue = asset.quantity * asset.marketPrice;
                const investedValue = asset.quantity * asset.averagePrice;
                const unrealizedPL = currentValue - investedValue;
                const unrealizedPLPercentage = investedValue > 0 ? (unrealizedPL / investedValue) * 100 : 0;
                const guaranteeValue = (currentValue * asset.guaranteeReleased) / 100;

                return (
                  <div key={asset.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-white">{asset.symbol}</h5>
                        <p className="text-gray-400 text-sm">{asset.name}</p>
                        <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 mt-1 inline-block">
                          RENDA FIXA
                        </span>
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
                        <p className="text-gray-400">Garantia</p>
                        <p className="text-orange-400 font-medium">
                          {asset.guaranteeReleased.toFixed(1)}% = {formatCurrency(guaranteeValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Positions from active structures */}
              {structures
                .filter(s => s.status === 'ATIVA')
                .map(structure => (
                  <div key={structure.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h5 className="font-bold text-white">{structure.nome}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-gray-400 text-sm">Estrutura Ativa</p>
                          {structure.legs.some(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') && (
                            <span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-400 border border-green-500/30">
                              🏦 COM ATIVOS
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                            ESTRUTURA
                          </span>
                          {structure.legs.some(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') && (
                            <span className="px-2 py-1 text-xs rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              🛡️ GARANTIA: {formatCurrency(structure.legs
                                .filter(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA')
                                .reduce((sum, leg) => sum + ((leg.precoEntrada || 0) * leg.quantidade), 0) * 0.6)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {formatCurrency(structure.legs.reduce((sum, leg) => {
                            if (leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') {
                              return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                            } else if ((leg.tipo === 'CALL' || leg.tipo === 'PUT') && leg.posicao === 'COMPRADA') {
                              return sum + (leg.premio * leg.quantidade);
                            } else if ((leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && leg.posicao === 'COMPRADA') {
                              return sum + (leg.premio * leg.quantidade);
                            }
                            return sum;
                          }, 0))}
                        </div>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>{structure.legs.length} posições</div>
                          {structure.legs.some(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') && (
                            <div className="text-green-400 font-medium">
                              Garantia: {formatCurrency(structure.legs
                                .filter(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA')
                                .reduce((sum, leg) => sum + ((leg.precoEntrada || 0) * leg.quantidade), 0) * 0.6)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {structure.legs.map((leg, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-gray-700 rounded text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              leg.tipo === 'ACAO' ? 'bg-blue-500/20 text-blue-400' :
                              leg.tipo === 'CALL' ? 'bg-green-500/20 text-green-400' :
                              leg.tipo === 'PUT' ? 'bg-red-500/20 text-red-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {leg.tipo}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              leg.posicao === 'COMPRADA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {leg.posicao}
                            </span>
                            <span className="text-white font-medium">{leg.ativo}</span>
                            <span className="text-gray-400">x{leg.quantidade}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-medium">
                              {formatCurrency((() => {
                                if (leg.tipo === 'ACAO') {
                                  return leg.precoEntrada || 0;
                                } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
                                  return leg.precoVista || 0;
                                } else {
                                  return leg.strike || 0;
                                }
                              })())}
                            </div>
                            <div className="text-xs text-gray-400">
                              {leg.tipo === 'ACAO' ? 'Preço Entrada' : 
                               leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT' ? 'Preço Futuro' :
                               'Strike'}
                            </div>
                            {leg.premio !== 0 && (
                              <div className={`text-xs font-medium ${
                                leg.posicao === 'COMPRADA' ? 'text-red-400' : 'text-green-400'
                              }`}>
                                Prêmio: {leg.posicao === 'COMPRADA' ? '-' : '+'}{formatCurrency(leg.premio * leg.quantidade)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : selectedAssetType === 'CASH' ? (
            <div className="text-center py-6">
              <Banknote className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-cyan-400 font-medium">Saldo em Conta</p>
              <p className="text-sm text-gray-400">Resultado de operações e depósitos</p>
              <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <p className="text-cyan-300 text-sm">
                  Este é o valor disponível em conta corrente para novas operações
                </p>
              </div>
            </div>
          ) : selectedAssetType === 'NOTIONAL' ? (
            <div className="text-center py-6">
              <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <p className="text-purple-400 font-medium">Nocional Total</p>
              <p className="text-sm text-gray-400">Exposição total das estruturas ativas</p>
              <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-purple-300 text-sm">
                  Este é o valor total de exposição ao mercado através das estruturas ativas
                </p>
              </div>
              
              {/* Breakdown by structure */}
              <div className="mt-6 space-y-3">
                <h5 className="text-white font-medium text-left">Exposição por Estrutura:</h5>
                {structures
                  .filter(s => s.status === 'ATIVA')
                  .map(structure => {
                    const structureNotional = structure.legs.reduce((sum, leg) => {
                      if (leg.tipo === 'ACAO') {
                        return sum + ((leg.precoEntrada || 0) * leg.quantidade);
                      } else if (leg.tipo === 'CALL' || leg.tipo === 'PUT') {
                        return sum + (leg.strike * leg.quantidade);
                      } else if (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') {
                        return sum + ((leg.precoVista || 0) * leg.quantidade);
                      }
                      return sum;
                    }, 0);
                    
                    return (
                      <div key={structure.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-left">
                        <div className="flex items-center justify-between">
                          <div>
                            <h6 className="font-bold text-white">{structure.nome}</h6>
                            <p className="text-xs text-gray-400">{structure.legs.length} pernas</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">
                              {formatCurrency(structureNotional)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {((structureNotional / totalNotionalExposure) * 100).toFixed(1)}% do total
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : selectedAssetType === 'TOTAL' ? (
            <div className="text-center py-6">
              <Target className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <p className="text-yellow-400 font-medium">Valor Total</p>
              <p className="text-sm text-gray-400">Soma de todos os ativos + saldo em conta</p>
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  Patrimônio total incluindo ativos sob custódia e saldo em conta
                </p>
              </div>
            </div>
          ) : selectedAssetType === 'TOTAL_INVESTED' ? (
            <div className="text-center py-6">
              <Wallet className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <p className="text-indigo-400 font-medium">Total Investido</p>
              <p className="text-sm text-gray-400">Soma de Renda Variável + Renda Fixa + Estruturas</p>
              
              {/* Breakdown detalhado */}
              <div className="mt-6 space-y-3">
                <h5 className="text-white font-medium text-left">Breakdown do Total Investido:</h5>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-bold text-blue-400">Renda Variável (Ativos)</h6>
                      <p className="text-xs text-gray-400">{stockAssets.length} ativos em custódia</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">
                        {formatCurrency(stockValue)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-bold text-green-400">Renda Fixa</h6>
                      <p className="text-xs text-gray-400">{rendaFixaAssets.length} títulos</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        {formatCurrency(rendaFixaValue)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="font-bold text-purple-400">Estruturas Ativas</h6>
                      <p className="text-xs text-gray-400">{structures.filter(s => s.status === 'ATIVA').length} estruturas</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">
                        {formatCurrency(totalVariableIncomeValue)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-300 font-medium">Total Consolidado:</span>
                    <span className="text-xl font-bold text-indigo-400">
                      {formatCurrency(Math.abs(stockValue + rendaFixaValue + totalVariableIncomeValue))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">Nenhum ativo nesta categoria</p>
              <p className="text-sm text-gray-500 mt-2">
                Adicione ativos através do botão "Gerenciar Ativos"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}