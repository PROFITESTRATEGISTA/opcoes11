import React, { useState, useEffect, useMemo } from 'react';
import { OptionStructure, RollPosition, ExerciseRecord } from '../../types/trading';
import { calculateTreasuryBalances, generateCashFlowEntries, TreasuryBalances } from './TreasuryCalculations';
import { supabase } from '../../lib/supabase';

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

interface FutureSettlement {
  id: string;
  date: string;
  type: 'STOCK_SETTLEMENT' | 'FUTURES_SETTLEMENT' | 'FIXED_INCOME_SETTLEMENT';
  description: string;
  amount: number;
  asset_symbol: string;
  settlement_days: number;
  trade_date: string;
  status: 'PENDING' | 'EXECUTED' | 'CANCELLED';
  created_at: string;
}

interface AssetAllocation {
  type: 'CASH' | 'GUARANTEE' | 'INVESTED' | 'BLOCKED';
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

interface TreasuryData {
  balances: TreasuryBalances;
  cashFlowEntries: CashFlowEntry[];
  assets: Asset[];
  assetAllocation: AssetAllocation[];
  futureSettlements: FutureSettlement[];
  projectedBalance: number;
}

interface TreasuryDataProviderProps {
  structures: OptionStructure[];
  rolls: RollPosition[];
  exercises: ExerciseRecord[];
  refreshKey?: number;
  children: (data: TreasuryData) => React.ReactNode;
}

export default function TreasuryDataProvider({ 
  structures, 
  rolls, 
  exercises, 
  refreshKey = 0,
  children 
}: TreasuryDataProviderProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
  const [futureSettlements, setFutureSettlements] = useState<FutureSettlement[]>([]);

  // Load assets from localStorage
  useEffect(() => {
    loadAssets();
  }, [refreshKey]);

  const loadAssets = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
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
      // Fallback to localStorage if Supabase fails
      const savedAssets = localStorage.getItem('treasury_assets');
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }
    }
  };

  // Load cash flow entries from Supabase
  useEffect(() => {
    loadCashFlowEntries();
    loadFutureSettlements();
  }, [structures, rolls, exercises, refreshKey]);

  // Listen for treasury refresh events
  useEffect(() => {
    const handleTreasuryRefresh = () => {
      loadCashFlowEntries();
      // Reload assets
      const savedAssets = localStorage.getItem('treasury_assets');
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }
    };

    window.addEventListener('treasuryRefresh', handleTreasuryRefresh);
    return () => window.removeEventListener('treasuryRefresh', handleTreasuryRefresh);
  }, []);

  const loadFutureSettlements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const savedSettlements = localStorage.getItem(`future_settlements_${user.id}`);
      if (savedSettlements) {
        const settlements = JSON.parse(savedSettlements);
        setFutureSettlements(settlements.filter((s: FutureSettlement) => s.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Error loading future settlements:', error);
    }
  };

  const loadCashFlowEntries = async () => {
    try {
      const { supabase } = await import('../../lib/supabase');
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
      // Fallback to generated entries if Supabase fails
      setCashFlowEntries(generateCashFlowEntries(structures, rolls, exercises));
    }
  };

  // Calculate all balances
  const balances = useMemo(() => {
    console.log('🔍 TreasuryDataProvider - Recalculando balances...');
    console.log('🔍 CashFlow entries:', cashFlowEntries.length);
    console.log('🔍 Assets:', assets.length);
    console.log('🔍 Structures:', structures.length);
    return calculateTreasuryBalances(cashFlowEntries, assets, structures);
  }, [cashFlowEntries, assets, structures]);

  // Force refresh when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      loadCashFlowEntries();
      loadFutureSettlements();
      // Force re-render of assets
      const savedAssets = localStorage.getItem('treasury_assets');
      if (savedAssets) {
        setAssets(JSON.parse(savedAssets));
      }
    }
  }, [refreshKey]);

  // Calculate asset allocation
  const assetAllocation = useMemo((): AssetAllocation[] => {
    return [
      {
        type: 'CASH' as const,
        label: 'Caixa Livre',
        amount: balances.freeAmount,
        percentage: balances.totalBalance > 0 ? (balances.freeAmount / balances.totalBalance) * 100 : 0,
        color: '#10B981'
      },
      {
        type: 'INVESTED' as const,
        label: 'Renda Fixa',
        amount: balances.lftValue || 0,
        percentage: balances.totalBalance > 0 ? ((balances.lftValue || 0) / balances.totalBalance) * 100 : 0,
        color: '#3B82F6'
      },
      {
        type: 'INVESTED' as const,
        label: 'Renda Variável',
        amount: (balances.stockValue || 0) + (balances.totalNocional || 0),
        percentage: balances.totalBalance > 0 ? (((balances.stockValue || 0) + (balances.totalNocional || 0)) / balances.totalBalance) * 100 : 0,
        color: '#EF4444'
      },
      {
        type: 'INVESTED' as const,
        label: 'Opções',
        amount: balances.opcoesValue || 0,
        percentage: balances.totalBalance > 0 ? ((balances.opcoesValue || 0) / balances.totalBalance) * 100 : 0,
        color: '#8B5CF6'
      },
      {
        type: 'INVESTED' as const,
        label: 'Futuros',
        amount: balances.futurosValue || 0,
        percentage: balances.totalBalance > 0 ? ((balances.futurosValue || 0) / balances.totalBalance) * 100 : 0,
        color: '#F59E0B'
      }
    ];
  }, [balances]);

  // Calculate projected balance including future settlements
  const projectedBalance = useMemo(() => {
    const pendingSettlements = futureSettlements
      .filter(s => s.status === 'PENDING')
      .reduce((sum, settlement) => sum + settlement.amount, 0);
    
    return balances.currentBalance + pendingSettlements;
  }, [balances.currentBalance, futureSettlements]);

  // Debug logs
  console.log('🔍 TreasuryDataProvider - Balances:', balances);
  console.log('🔍 TreasuryDataProvider - FINAL Total Invested:', balances.totalInvested);
  console.log('🔍 TreasuryDataProvider - Total Nocional:', balances.totalNocional);
  console.log('🔍 TreasuryDataProvider - Stock Value:', balances.stockValue);
  console.log('🔍 TreasuryDataProvider - LFT Value:', balances.lftValue);
  console.log('🔍 TreasuryDataProvider - Cash Flow Entries:', cashFlowEntries.length);
  console.log('🔍 TreasuryDataProvider - Assets:', assets.length);

  const treasuryData: TreasuryData = {
    balances,
    cashFlowEntries,
    assets,
    assetAllocation,
    futureSettlements,
    projectedBalance
  };

  return <>{children(treasuryData)}</>;
}