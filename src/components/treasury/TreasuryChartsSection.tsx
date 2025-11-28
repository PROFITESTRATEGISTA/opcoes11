import React from 'react';
import AllocationChart from './AllocationChart';
import GuaranteeUsageChart from './GuaranteeUsageChart';
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
  type: 'STOCK' | 'RENDA_FIXA' | 'OPCOES' | 'FUTUROS';
}

interface AssetAllocation {
  type: 'CASH' | 'RENDA_FIXA' | 'VARIABLE_INCOME' | 'OPCOES' | 'FUTUROS';
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

interface TreasuryChartsSectionProps {
  assetAllocation: AssetAllocation[];
  assets: Asset[];
  structures: OptionStructure[];
  totalGuaranteeAvailable: number;
  guaranteeUsed: number;
}

export default function TreasuryChartsSection({
  assetAllocation,
  assets,
  structures,
  totalGuaranteeAvailable,
  guaranteeUsed
}: TreasuryChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-6">
      <AllocationChart assetAllocation={assetAllocation} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuaranteeUsageChart 
          assets={assets} 
          structures={structures}
          totalGuaranteeAvailable={totalGuaranteeAvailable}
          guaranteeUsed={guaranteeUsed}
        />
      </div>
    </div>
  );
}