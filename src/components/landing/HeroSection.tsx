import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  onNavigate: (page: 'login' | 'pricing') => void;
}

export default function HeroSection({ onNavigate }: HeroSectionProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  const dynamicTexts = [
    'Opções e Derivativos',
    'Rolagens e Exercícios',
    'Operações Estruturadas',
    'Tesouraria as a Service'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % dynamicTexts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-cyan-600/20 to-slate-800/40"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent mb-6">
            Strategos Partners
          </h1>

          <h2 className="text-xl lg:text-2xl font-medium text-blue-200/90 mb-12">
            Tecnologia em Tesouraria • Consultoria em Patrimônio
          </h2>

          <div className="mb-12">
            <p className="text-2xl lg:text-4xl font-bold text-white mb-4">
              Controle Profissional de
            </p>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent block text-4xl lg:text-6xl font-extrabold animate-pulse min-h-[80px] flex items-center justify-center">
              {dynamicTexts[currentTextIndex]}
            </span>
          </div>

          <p className="text-lg lg:text-xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
            Plataforma profissional que automatiza o controle de operações estruturadas, rolagens e exercícios de opções.
            Tecnologia de tesouraria para o mercado financeiro brasileiro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => onNavigate('login')}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-blue-500/25 transform hover:scale-105"
            >
              Acessar Plataforma
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="border-2 border-blue-400/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-300 hover:text-white px-8 py-4 rounded-xl font-bold text-lg transition-all backdrop-blur-sm"
            >
              Ver Planos
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}