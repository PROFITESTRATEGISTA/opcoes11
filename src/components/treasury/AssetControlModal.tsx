import React, { useState } from 'react';
import { X, Plus, Trash2, Shield, TrendingUp, Edit2 } from 'lucide-react';

interface Asset {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  marketPrice: number;
  guaranteeReleased: number; // Percentual de garantia liberada
  usedAsGuarantee: boolean; // Se o ativo serve como garantia
  type: 'STOCK' | 'LFT';
}

interface OptionStructure {
  id: string;
  status: string;
  legs: Array<{
    tipo: string;
    posicao: string;
    ativo: string;
    quantidade: number;
    precoEntrada?: number;
  }>;
}

interface AssetControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  structures: OptionStructure[];
  onAddAsset: (asset: Omit<Asset, 'id'>) => void;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
  onDeleteAsset: (id: string) => void;
}

export default function AssetControlModal({ 
  isOpen, 
  onClose, 
  assets, 
  structures,
  onAddAsset, 
  onUpdateAsset, 
  onDeleteAsset 
}: AssetControlModalProps) {
  const [newAsset, setNewAsset] = useState({
    symbol: '',
    name: '',
    quantity: 0,
    averagePrice: 0,
    marketPrice: 0,
    guaranteeReleased: 60, // Padrão de 60% para ações
    usedAsGuarantee: true,
    type: 'STOCK' as const
  });
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Generate assets from active structures
  const generateAssetsFromStructures = () => {
    const generatedAssets: Omit<Asset, 'id'>[] = [];
    
    structures
      .filter(s => s.status === 'ATIVA')
      .forEach(structure => {
        structure.legs.forEach(leg => {
          if (leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA') {
            // Check if asset already exists
            const existingAsset = assets.find(asset => asset.symbol === leg.ativo);
            
            if (!existingAsset) {
              generatedAssets.push({
                symbol: leg.ativo,
                name: `Ação ${leg.ativo}`,
                quantity: leg.quantidade,
                averagePrice: leg.precoEntrada || 0,
                marketPrice: leg.precoEntrada || 0,
                guaranteeReleased: 60, // Padrão de 60% para ações
                usedAsGuarantee: true,
                type: 'STOCK'
              });
            }
          }
        });
      });
    
    return generatedAssets;
  };

  const handleGenerateAssets = () => {
    const generatedAssets = generateAssetsFromStructures();
    
    if (generatedAssets.length === 0) {
      alert('Nenhum ativo novo encontrado nas estruturas ativas');
      return;
    }
    
    if (window.confirm(`Adicionar ${generatedAssets.length} ativo(s) das estruturas ativas?`)) {
      generatedAssets.forEach(asset => onAddAsset(asset));
    }
  };
  
  // Função para verificar se um ativo está vinculado a alguma estrutura
  const isAssetLinkedToStructure = (asset: Asset): boolean => {
    return structures.some(structure => {
      if (structure.status !== 'ATIVA') return false;
      
      return structure.legs.some(leg => {
        // Verificar ações
        if (leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA' && leg.ativo === asset.symbol) {
          return true;
        }
        
        // Verificar opções (símbolos com _OPT)
        if (asset.symbol.includes('_OPT')) {
          const baseAsset = asset.symbol.replace('_OPT', '');
          return (leg.tipo === 'CALL' || leg.tipo === 'PUT') && 
                 leg.posicao === 'COMPRADA' && 
                 leg.ativo.startsWith(baseAsset);
        }
        
        // Verificar futuros (símbolos com _FUT)
        if (asset.symbol.includes('_FUT')) {
          const baseAsset = asset.symbol.replace('_FUT', '');
          return (leg.tipo === 'WIN' || leg.tipo === 'WDO' || leg.tipo === 'BIT') && 
                 leg.posicao === 'COMPRADA' && 
                 leg.ativo.startsWith(baseAsset);
        }
        
        return false;
      });
    });
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editingAsset) return;
    
    onUpdateAsset(editingAsset.id, {
      symbol: editingAsset.symbol,
      name: editingAsset.name,
      quantity: editingAsset.quantity,
      averagePrice: editingAsset.averagePrice,
      marketPrice: editingAsset.marketPrice,
      guaranteeReleased: editingAsset.guaranteeReleased,
      usedAsGuarantee: editingAsset.usedAsGuarantee,
      type: editingAsset.type
    });
    
    setShowEditModal(false);
    setEditingAsset(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleAddAsset = () => {
    if (!newAsset.symbol.trim() || !newAsset.name.trim()) {
      alert('Por favor, preencha símbolo e nome do ativo');
      return;
    }
    
    if (newAsset.quantity <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }
    
    if (newAsset.averagePrice <= 0 || newAsset.marketPrice <= 0) {
      alert('Preços devem ser maiores que zero');
      return;
    }

    onAddAsset(newAsset);
    setNewAsset({
      symbol: '',
      name: '',
      quantity: 0,
      averagePrice: 0,
      marketPrice: 0,
      guaranteeReleased: 60, // Resetar para padrão de 60%
      usedAsGuarantee: true,
      type: 'STOCK'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Controle de Ativos</h3>
              <p className="text-blue-100">Gerencie ativos e garantias</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Add New Asset */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Adicionar Novo Ativo</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Símbolo</label>
                <input
                  type="text"
                  value={newAsset.symbol}
                  onChange={(e) => setNewAsset({...newAsset, symbol: e.target.value.toUpperCase()})}
                  placeholder="PETR4"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                <select
                  value={newAsset.type}
                  onChange={(e) => setNewAsset({...newAsset, type: e.target.value as any})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STOCK">Renda Variável</option>
                  <option value="RENDA_FIXA">Renda Fixa</option>
                  <option value="OPCOES">Opções</option>
                  <option value="FUTUROS">Futuros</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Ativo</label>
                <input
                  type="text"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset({...newAsset, name: e.target.value})}
                  placeholder={newAsset.type === 'STOCK' ? 'Petrobras' : 'Letra Financeira do Tesouro'}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade</label>
                <input
                  type="number"
                  value={newAsset.quantity}
                  onChange={(e) => setNewAsset({...newAsset, quantity: parseInt(e.target.value) || 0})}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preço Médio</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAsset.averagePrice}
                  onChange={(e) => setNewAsset({...newAsset, averagePrice: parseFloat(e.target.value) || 0})}
                  placeholder="22.50"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Preço a Mercado</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAsset.marketPrice}
                  onChange={(e) => setNewAsset({...newAsset, marketPrice: parseFloat(e.target.value) || 0})}
                  placeholder="25.50"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Preço atual do ativo no mercado
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={newAsset.usedAsGuarantee}
                    onChange={(e) => setNewAsset({
                      ...newAsset, 
                      usedAsGuarantee: e.target.checked,
                      guaranteeReleased: e.target.checked ? (newAsset.type === 'STOCK' ? 60 : 90) : 0
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-300">
                    Este ativo serve como garantia
                  </span>
                </label>
                {!newAsset.usedAsGuarantee && (
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                      SEM GARANTIA
                    </span>
                  </div>
                )}
              </div>
              
              <div className={!newAsset.usedAsGuarantee ? 'opacity-50' : ''}>
                <label className="block text-sm font-medium text-gray-300 mb-2">Garantia Liberada (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={newAsset.guaranteeReleased}
                  onChange={(e) => setNewAsset({...newAsset, guaranteeReleased: parseFloat(e.target.value) || 0})}
                  placeholder={newAsset.type === 'STOCK' ? '60.0' : '90.0'}
                  disabled={!newAsset.usedAsGuarantee}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newAsset.type === 'STOCK' 
                    ? 'Padrão: 60% para ações (conservador)'
                    : 'Padrão: 90% para renda fixa (alta liquidez)'
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handleGenerateAssets}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Gerar dos Ativos das Estruturas
              </button>
              <button
                onClick={handleAddAsset}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Ativo
              </button>
            </div>
          </div>

          {/* Assets List */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
              <h4 className="text-lg font-medium text-white">Ativos em Carteira ({assets.length})</h4>
            </div>
            
            <div className="p-6">
              {assets.length > 0 ? (
                <div className="space-y-4">
                  {assets.map((asset) => (
                    <div key={asset.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            asset.type === 'STOCK' ? 'bg-blue-500/20' :
                            'bg-green-500/20'
                          }`}>
                            {asset.type === 'STOCK' ? 
                              <TrendingUp className="w-4 h-4 text-blue-400" /> :
                              <Shield className="w-4 h-4 text-green-400" />
                            }
                          </div>
                          <div>
                            <h5 className="font-semibold text-white">{asset.symbol}</h5>
                            <p className="text-sm text-gray-400">{asset.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAsset(asset)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar ativo"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteAsset(asset.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Excluir ativo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Quantidade</p>
                          <p className="font-bold text-white">{asset.quantity}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Preço a Mercado</p>
                          <p className="font-bold text-white">{formatCurrency(asset.marketPrice)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Valor Total</p>
                          <p className="font-bold text-blue-400">
                            {formatCurrency(asset.quantity * asset.marketPrice)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-gray-700">
                        <div>
                          <p className="text-gray-400">Garantia Liberada</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-bold text-orange-400">{formatPercentage(asset.guaranteeReleased)}</p>
                            {!asset.usedAsGuarantee && (
                              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded border border-red-500/30">
                                SEM GARANTIA
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-400">Valor da Garantia</p>
                          <p className={`font-bold ${asset.usedAsGuarantee ? 'text-green-400' : 'text-gray-500'}`}>
                            {asset.usedAsGuarantee 
                              ? formatCurrency((asset.quantity * asset.marketPrice * asset.guaranteeReleased) / 100)
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Nenhum ativo cadastrado</p>
                  <p className="text-sm text-gray-500 mb-4">Adicione ativos para controle de garantias</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Asset Modal */}
      {showEditModal && editingAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Editar Ativo</h3>
                  <p className="text-purple-100">{editingAsset.symbol}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAsset(null);
                  }}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Símbolo</label>
                  <input
                    type="text"
                    value={editingAsset.symbol}
                    onChange={(e) => setEditingAsset({...editingAsset, symbol: e.target.value.toUpperCase()})}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                  <select
                    value={editingAsset.type}
                    onChange={(e) => setEditingAsset({...editingAsset, type: e.target.value as any})}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="STOCK">Renda Variável</option>
                    <option value="RENDA_FIXA">Renda Fixa</option>
                    <option value="OPCOES">Opções</option>
                    <option value="FUTUROS">Futuros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Ativo</label>
                  <input
                    type="text"
                    value={editingAsset.name}
                    onChange={(e) => setEditingAsset({...editingAsset, name: e.target.value})}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Quantidade</label>
                  <input
                    type="number"
                    value={editingAsset.quantity}
                    onChange={(e) => setEditingAsset({...editingAsset, quantity: parseInt(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço Médio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAsset.averagePrice}
                    onChange={(e) => setEditingAsset({...editingAsset, averagePrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Preço a Mercado</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingAsset.marketPrice}
                    onChange={(e) => setEditingAsset({...editingAsset, marketPrice: parseFloat(e.target.value) || 0})}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={editingAsset.usedAsGuarantee}
                      onChange={(e) => {
                        const defaultGuarantee = e.target.checked ? 
                          (editingAsset.type === 'STOCK' ? 60 : 
                           editingAsset.type === 'RENDA_FIXA' ? 90 : 0) : 0;
                        setEditingAsset({
                          ...editingAsset, 
                          usedAsGuarantee: e.target.checked,
                          guaranteeReleased: defaultGuarantee
                        });
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-300">
                      Este ativo serve como garantia
                    </span>
                  </label>
                </div>
                
                <div className={!editingAsset.usedAsGuarantee ? 'opacity-50' : ''}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Garantia Liberada (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editingAsset.guaranteeReleased}
                    onChange={(e) => setEditingAsset({...editingAsset, guaranteeReleased: parseFloat(e.target.value) || 0})}
                    disabled={!editingAsset.usedAsGuarantee}
                    className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editingAsset.type === 'STOCK' 
                      ? 'Padrão: 60% para ações (conservador)'
                      : editingAsset.type === 'RENDA_FIXA'
                      ? 'Padrão: 90% para renda fixa (alta liquidez)'
                      : 'Padrão: 0% para derivativos'
                    }
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAsset(null);
                  }}
                  className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}