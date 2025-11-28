import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Wallet, Banknote, Target, Shield, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import GuaranteeFlowModal from './GuaranteeFlowModal';
import FutureSettlementsModal from './FutureSettlementsModal';
import { OptionStructure } from '../../types/trading';

interface BalanceCardsProps {
  currentBalance: number;
  freeAmount: number;
  totalGuaranteeAvailable: number;
  totalInvested: number; // Agora representa Exposição Total (Nocional)
  totalExposure: number; // Agora representa Patrimônio Total
  structures: OptionStructure[];
  assets: any[];
}

export default function BalanceCards({
  currentBalance,
  freeAmount,
  totalGuaranteeAvailable,
  totalInvested,
  totalExposure,
  structures = [],
  assets = []
}: BalanceCardsProps) {
  const [showGuaranteeFlow, setShowGuaranteeFlow] = useState(false);
  const [guaranteeFlowBalance, setGuaranteeFlowBalance] = useState(0);
  const [calculatedTotalInvested, setCalculatedTotalInvested] = useState(0);
  const [showFutureSettlements, setShowFutureSettlements] = useState(false);

  // Load guarantee flow balance
  useEffect(() => {
    loadGuaranteeBalance();
  }, []);

  const loadGuaranteeBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const savedEntries = localStorage.getItem(`guarantee_entries_${user.id}`);
      if (savedEntries) {
        const entries = JSON.parse(savedEntries);
        const balance = entries.length > 0 ? entries[entries.length - 1].balance : 0;
        console.log('🔍 Manual Guarantee Balance:', balance);
        setGuaranteeFlowBalance(balance);
      } else {
        setGuaranteeFlowBalance(0);
      }
    } catch (error) {
      console.error('Error loading guarantee balance:', error);
      setGuaranteeFlowBalance(0);
    }
  };

  // Reload guarantee balance when totalGuaranteeAvailable changes
  useEffect(() => {
    loadGuaranteeBalance();
  }, [totalGuaranteeAvailable]);

  // Calculate correct total invested
  useEffect(() => {
    const calculateRealTotalInvested = () => {
      // 1. Ativos em custódia (valor de mercado)
      const assetsValue = (assets || []).reduce((sum, asset) => {
        return sum + (asset.quantity * asset.marketPrice);
      }, 0);
      
      // 2. CORREÇÃO: Total Investido = apenas ativos em custódia
      // Estruturas já movimentaram o caixa e os ativos resultantes estão na custódia
      const realTotalInvested = Math.abs(assetsValue);
      
      console.log('🔍 BalanceCards - Real Total Investido:', {
        assetsValue,
        realTotalInvested,
        originalTotalInvested: totalInvested,
        note: 'Estruturas não são contadas separadamente - ativos resultantes estão na custódia'
      });
      
      setCalculatedTotalInvested(realTotalInvested);
    };
    
    calculateRealTotalInvested();
  }, [assets, structures, totalInvested]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const cards = [
    {
      title: 'Exposição Total',
      subtitle: '(Nocional)',
      value: totalInvested, // Agora mostra o nocional total
      icon: Target,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      clickable: false
    },
    {
      title: 'Caixa Livre',
      value: freeAmount,
      icon: Banknote,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      clickable: false
    },
    {
      title: 'Garantia Disponível',
      value: Math.max(0, totalGuaranteeAvailable) + guaranteeFlowBalance,
      icon: Shield,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      clickable: true,
      onClick: () => setShowGuaranteeFlow(true)
    },
    {
      title: 'Patrimônio Total',
      value: totalExposure, // Agora mostra o patrimônio total (capital real)
      icon: Wallet,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      clickable: false
    }
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${
              card.clickable ? 'cursor-pointer hover:border-orange-500/50 hover:bg-gray-700/50 transition-all' : ''
            }`}
            onClick={card.onClick}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-xl ${card.bgColor}`}>
                <card.icon className={`w-8 h-8 ${card.color}`} />
              </div>
              {card.clickable && (
                <div className="text-orange-400 text-xs font-medium">
                  Clique para gerenciar
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-base font-medium text-gray-400">{card.title}</h3>
                {'subtitle' in card && card.subtitle && (
                  <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
                )}
              </div>
              <p className={`text-3xl font-bold ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
              {card.title === 'Garantia Disponível' && guaranteeFlowBalance !== 0 && (
                <p className="text-sm text-gray-500">
                  Livre: {formatCurrency(Math.max(0, totalGuaranteeAvailable))} + Manual: {formatCurrency(guaranteeFlowBalance)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <GuaranteeFlowModal
        isOpen={showGuaranteeFlow}
        onClose={() => setShowGuaranteeFlow(false)}
        currentGuaranteeBalance={totalGuaranteeAvailable}
        onGuaranteeChange={loadGuaranteeBalance}
      />

      <FutureSettlementsModal
        isOpen={showFutureSettlements}
        onClose={() => setShowFutureSettlements(false)}
        currentBalance={currentBalance}
        assets={assets}
        structures={structures}
        onSettlementsChange={() => {
          // Force refresh of treasury data
          window.dispatchEvent(new CustomEvent('treasuryRefresh'));
        }}
      />
    </>
  );
}