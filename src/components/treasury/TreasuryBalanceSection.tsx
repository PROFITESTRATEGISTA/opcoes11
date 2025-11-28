import React from 'react';
import BalanceCards from './BalanceCards';
import BalanceChart from './BalanceChart';

interface TreasuryBalanceSectionProps {
  currentBalance: number;
  freeAmount: number;
  totalInvested: number;
  totalGuaranteeAvailable: number;
  cashFlowEntries: any[];
}

export default function TreasuryBalanceSection({
  currentBalance,
  freeAmount,
  totalInvested,
  totalGuaranteeAvailable,
  cashFlowEntries
}: TreasuryBalanceSectionProps) {
  return (
    <>
      <BalanceCards
        currentBalance={currentBalance}
        freeAmount={freeAmount}
        totalInvested={totalInvested}
        totalGuaranteeAvailable={totalGuaranteeAvailable}
      />

      <BalanceChart cashFlowEntries={cashFlowEntries} />
    </>
  );
}