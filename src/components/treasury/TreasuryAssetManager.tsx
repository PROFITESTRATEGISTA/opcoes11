import React, { useState } from 'react';

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

interface TreasuryAssetManagerProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
}

export default function TreasuryAssetManager({ assets, onAssetsChange }: TreasuryAssetManagerProps) {
  const saveAssets = (newAssets: Asset[]) => {
    localStorage.setItem('treasury_assets', JSON.stringify(newAssets));
    onAssetsChange(newAssets);
  };

  const handleAddAsset = (assetData: Omit<Asset, 'id'>) => {
    const newAsset: Asset = {
      ...assetData,
      id: crypto.randomUUID()
    };
    saveAssets([...assets, newAsset]);
  };

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    const updatedAssets = assets.map(asset => 
      asset.id === id ? { ...asset, ...updates } : asset
    );
    saveAssets(updatedAssets);
  };

  const handleDeleteAsset = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ativo?')) {
      saveAssets(assets.filter(asset => asset.id !== id));
    }
  };

  return {
    handleAddAsset,
    handleUpdateAsset,
    handleDeleteAsset
  };
}