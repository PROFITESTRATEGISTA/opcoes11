import React from 'react';
import { LogOut } from 'lucide-react';

interface ActionButtonsProps {
  onShowPricing: () => void;
  onLogout: () => void;
}

export default function ActionButtons({ onShowPricing, onLogout }: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
      <button
        onClick={onShowPricing}
        className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Ver Planos de Consultoria
      </button>
      
      <button
        onClick={onLogout}
        className="border border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800 px-8 py-4 rounded-xl font-semibold transition-all flex items-center justify-center"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Sair da Conta
      </button>
    </div>
  );
}