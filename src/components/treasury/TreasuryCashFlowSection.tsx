import React from 'react';
import CashFlowTable from './CashFlowTable';

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

interface TreasuryCashFlowSectionProps {
  cashFlowEntries: CashFlowEntry[];
  currentBalance: number;
  onViewEntry: (entry: CashFlowEntry) => void;
}

export default function TreasuryCashFlowSection({
  cashFlowEntries,
  currentBalance,
  onViewEntry
}: TreasuryCashFlowSectionProps) {
  return (
    <CashFlowTable
      cashFlowEntries={cashFlowEntries}
      currentBalance={currentBalance}
      onViewEntry={onViewEntry}
    />
  );
}