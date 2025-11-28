import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  RotateCcw, 
  Activity, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  Target,
  PieChart,
  Shield,
  Zap,
  Calculator
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ isOpen, onToggle, activeSection, onSectionChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'treasury', label: 'Tesouraria', icon: DollarSign },
    { id: 'results', label: 'Resultados', icon: PieChart },
    { id: 'simulation', label: 'Análise de IA', icon: Calculator },
    { id: 'default', label: 'Estruturas', icon: Target },
    { id: 'operations', label: 'Operações', icon: Activity },
    { id: 'rolls', label: 'Rolagens', icon: RotateCcw },
    { id: 'exercises', label: 'Exercícios', icon: Zap },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
    { id: 'admin', label: 'Admin', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-gray-900 border-r border-gray-800 z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-72 sm:w-64
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center">
            <div>
              <h1 className="text-xl font-bold text-white">Strategos Partners</h1>
              <p className="text-xs text-gray-400">Tecnologia em Tesouraria</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`
                    w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => onSectionChange('settings')}
            className={`
              w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 mb-2
              ${activeSection === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg' 
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
              }
            `}
          >
            <Settings className="w-5 h-5 mr-3" />
            <span className="font-medium">Configurações</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-3 rounded-lg text-left text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-30 p-3 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-700"
      >
        <Menu className="w-6 h-6" />
      </button>
    </>
  );
}