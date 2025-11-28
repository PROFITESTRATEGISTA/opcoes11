import React, { useState, useEffect } from 'react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';
import TreasuryHeader from './TreasuryHeader';
import TreasuryBalanceSection from './TreasuryBalanceSection';
import TreasuryChartsSection from './TreasuryChartsSection';
import TreasuryAssetsSection from './TreasuryAssetsSection';
import TreasuryCashFlowSection from './TreasuryCashFlowSection';
import NewEntryModal from './NewEntryModal';
import EntryDetailsModal from './EntryDetailsModal';
import AssetControlModal from './AssetControlModal';
import StructureViewModal from './StructureViewModal';
import { supabase } from '../../lib/supabase';

interface TreasuryMainProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises?: ExerciseRecord[];
}

interface CashFlowEntry {
  id: string;
  date: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'STRUCTURE_COST' | 'STRUCTURE_PREMIUM' | 'ROLL_COST' | 'EXERCISE_COST' | 'BROKERAGE' | 'TAX' | 'PROFIT';
  description: string;
  amount: number;
  balance: number;
  relatedStructureId?: string;
  relatedRollId?: string;
}

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

export default function TreasuryMain({ structures, rolls, exercises = [] }: TreasuryMainProps) {
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAssetControl, setShowAssetControl] = useState(false);
  const [showStructureView, setShowStructureView] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<OptionStructure | null>(null);
  const [newEntry, setNewEntry] = useState({
    type: 'DEPOSIT' as const,
    description: '',
    amount: 0
  });
  const [selectedEntry, setSelectedEntry] = useState<CashFlowEntry | null>(null);

  // Load cash flow entries from Supabase
  useEffect(() => {
    loadCashFlowEntries();
  }, [structures, rolls, exercises]);

  // Load assets from Supabase
  useEffect(() => {
    loadAssets();
  }, []);

  const loadCashFlowEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('cash_flow_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedEntries: CashFlowEntry[] = data?.map(entry => ({
        id: entry.id,
        date: entry.date,
        type: entry.type,
        description: entry.description,
        amount: Number(entry.amount),
        balance: Number(entry.balance),
        relatedStructureId: entry.related_structure_id,
        relatedRollId: entry.related_roll_id
      })) || [];

      setCashFlowEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading cash flow entries:', error);
    }
  };

  const loadAssets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('assets_custody')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAssets: Asset[] = data?.map(asset => ({
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        quantity: asset.quantity,
        averagePrice: Number(asset.average_price),
        marketPrice: Number(asset.market_price),
        guaranteeReleased: Number(asset.guarantee_released),
        usedAsGuarantee: asset.used_as_guarantee,
        type: asset.type
      })) || [];

      setAssets(formattedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const handleAddAsset = async (assetData: Omit<Asset, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('assets_custody')
        .insert({
          user_id: user.id,
          symbol: assetData.symbol,
          name: assetData.name,
          quantity: assetData.quantity,
          average_price: assetData.averagePrice,
          market_price: assetData.marketPrice,
          guarantee_released: assetData.guaranteeReleased,
          used_as_guarantee: assetData.usedAsGuarantee,
          type: assetData.type
        });

      if (error) throw error;
      await loadAssets();
    } catch (error) {
      console.error('Error adding asset:', error);
    }
  };

  const handleUpdateAsset = async (id: string, updates: Partial<Asset>) => {
    try {
      const { error } = await supabase
        .from('assets_custody')
        .update({
          symbol: updates.symbol,
          name: updates.name,
          quantity: updates.quantity,
          average_price: updates.averagePrice,
          market_price: updates.marketPrice,
          guarantee_released: updates.guaranteeReleased,
          used_as_guarantee: updates.usedAsGuarantee,
          type: updates.type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await loadAssets();
    } catch (error) {
      console.error('Error updating asset:', error);
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo?')) {
      try {
        const { error } = await supabase
          .from('assets_custody')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await loadAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.description.trim() || newEntry.amount === 0) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current balance
      const { data: lastEntry } = await supabase
        .from('cash_flow_entries')
        .select('balance')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const currentBalance = lastEntry?.balance || 0;
      const amount = newEntry.type === 'WITHDRAWAL' ? -Math.abs(newEntry.amount) : Math.abs(newEntry.amount);
      const newBalance = currentBalance + amount;

      const { error } = await supabase
        .from('cash_flow_entries')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          type: newEntry.type,
          description: newEntry.description,
          amount: amount,
          balance: newBalance
        });

      if (error) throw error;

      setNewEntry({ type: 'DEPOSIT', description: '', amount: 0 });
      setShowAddEntry(false);
      await loadCashFlowEntries();
    } catch (error) {
      console.error('Error adding entry:', error);
      alert('Erro ao adicionar lançamento');
    }
  };

  const handleViewStructure = (structure: OptionStructure) => {
    setSelectedStructure(structure);
    setShowStructureView(true);
  };

  // Calculate balances and allocations
  const currentBalance = cashFlowEntries[cashFlowEntries.length - 1]?.balance || 0;
  
  const stockValue = assets.filter(asset => asset.type === 'STOCK')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const rendaFixaValue = assets.filter(asset => asset.type === 'RENDA_FIXA')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const opcoesValue = assets.filter(asset => asset.type === 'OPCOES')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  const futurosValue = assets.filter(asset => asset.type === 'FUTUROS')
    .reduce((sum, asset) => sum + (asset.quantity * asset.marketPrice), 0);
  
  const structuresInvested = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      const stockValue = structure.legs
        .filter(leg => leg.tipo === 'ACAO' && leg.posicao === 'COMPRADA')
        .reduce((legSum, leg) => legSum + ((leg.precoEntrada || 0) * leg.quantidade), 0);
      
      const boughtOptionsValue = structure.legs
        .filter(leg => leg.posicao === 'COMPRADA' && (leg.tipo === 'CALL' || leg.tipo === 'PUT'))
        .reduce((legSum, leg) => legSum + (leg.premio * leg.quantidade), 0);
      
      return sum + stockValue + boughtOptionsValue;
    }, 0);
  
  const totalInvested = stockValue + rendaFixaValue + opcoesValue + futurosValue + structuresInvested;
  const totalBalance = currentBalance + stockValue + rendaFixaValue + opcoesValue + futurosValue;
  const freeAmount = totalBalance - totalInvested;
  
  const totalGuaranteeFromAssets = assets.reduce((sum, asset) => 
    sum + ((asset.quantity * asset.marketPrice * asset.guaranteeReleased) / 100), 0
  );
  
  const guaranteeUsed = structures
    .filter(s => s.status === 'ATIVA')
    .reduce((sum, structure) => {
      const soldOptionsValue = structure.legs
        .filter(leg => leg.posicao === 'VENDIDA' && (leg.tipo === 'CALL' || leg.tipo === 'PUT'))
        .reduce((legSum, leg) => legSum + (leg.strike * leg.quantidade), 0);
      return sum + soldOptionsValue;
    }, 0);
  
  const totalGuaranteeAvailable = totalGuaranteeFromAssets + Math.max(0, freeAmount);

  const assetAllocation = [
    {
      type: 'CASH' as const,
      label: 'Caixa Livre',
      amount: freeAmount,
      percentage: totalBalance > 0 ? (freeAmount / totalBalance) * 100 : 0,
      color: '#10B981'
    },
    {
      type: 'RENDA_FIXA' as const,
      label: 'Renda Fixa',
      amount: rendaFixaValue,
      percentage: totalBalance > 0 ? (rendaFixaValue / totalBalance) * 100 : 0,
      color: '#3B82F6'
    },
    {
      type: 'VARIABLE_INCOME' as const,
      label: 'Renda Variável',
      amount: stockValue + structuresInvested,
      percentage: totalBalance > 0 ? ((stockValue + structuresInvested) / totalBalance) * 100 : 0,
      color: '#EF4444'
    },
    {
      type: 'OPCOES' as const,
      label: 'Opções',
      amount: opcoesValue,
      percentage: totalBalance > 0 ? (opcoesValue / totalBalance) * 100 : 0,
      color: '#8B5CF6'
    },
    {
      type: 'FUTUROS' as const,
      label: 'Futuros',
      amount: futurosValue,
      percentage: totalBalance > 0 ? (futurosValue / totalBalance) * 100 : 0,
      color: '#F59E0B'
    }
  ];

  return (
    <div className="space-y-6">
      <TreasuryHeader 
        onAddEntry={() => setShowAddEntry(true)}
        onManageAssets={() => setShowAssetControl(true)}
      />

      <TreasuryBalanceSection
        currentBalance={totalBalance}
        freeAmount={freeAmount}
        totalInvested={totalInvested}
        totalGuaranteeAvailable={totalGuaranteeAvailable}
        cashFlowEntries={cashFlowEntries}
      />

      <TreasuryChartsSection 
        assetAllocation={assetAllocation}
        assets={assets}
        structures={structures}
        totalGuaranteeAvailable={totalGuaranteeAvailable}
        guaranteeUsed={guaranteeUsed}
      />

      <TreasuryAssetsSection
        assets={assets}
        structures={structures}
        onViewStructure={handleViewStructure}
      />

      <TreasuryCashFlowSection
        cashFlowEntries={cashFlowEntries}
        currentBalance={currentBalance}
        onViewEntry={setSelectedEntry}
      />

      <NewEntryModal
        isOpen={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        newEntry={newEntry}
        onEntryChange={(field, value) => setNewEntry(prev => ({ ...prev, [field]: value }))}
        onSave={handleAddEntry}
      />

      <EntryDetailsModal
        entry={selectedEntry}
        structures={structures}
        onClose={() => setSelectedEntry(null)}
      />

      <AssetControlModal
        isOpen={showAssetControl}
        onClose={() => setShowAssetControl(false)}
        assets={assets}
        onAddAsset={handleAddAsset}
        onUpdateAsset={handleUpdateAsset}
        onDeleteAsset={handleDeleteAsset}
      />

      <StructureViewModal
        isOpen={showStructureView}
        structure={selectedStructure}
        onClose={() => {
          setShowStructureView(false);
          setSelectedStructure(null);
        }}
      />
    </div>
  );
}