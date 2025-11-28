import React from 'react';
import { RotateCcw, Shield, DollarSign, CheckCircle } from 'lucide-react';

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Por que escolher a Strategos Partners?
          </h3>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A única plataforma que combina tecnologia avançada com consultoria especializada
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-blue-500/50 transition-all">
            <div className="bg-blue-500/20 p-4 rounded-xl mb-6 w-fit">
              <RotateCcw className="w-8 h-8 text-blue-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-4">Controle Automático de Rolagens</h4>
            <p className="text-gray-300 mb-6">
              Fuja do Excel com controle automático de rolagens e exercícios. 
              Interface otimizada para operações ágeis e precisas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Rolagens automáticas
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Controle de exercícios
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Interface otimizada
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
            <div className="bg-purple-500/20 p-4 rounded-xl mb-6 w-fit">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-4">Consultoria Especializada CNPI</h4>
            <p className="text-gray-300 mb-6">
              Experts certificados CNPI com relatórios especializados. 
              Acompanhamento personalizado para renda passiva.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Analistas CNPI certificados
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Relatórios especializados
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Acompanhamento personalizado
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:border-green-500/50 transition-all">
            <div className="bg-green-500/20 p-4 rounded-xl mb-6 w-fit">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <h4 className="text-xl font-bold text-white mb-4">Carteira de Dividendos</h4>
            <p className="text-gray-300 mb-6">
              Dividendo sintético automático via copy Nelogica. 
              Remuneração passiva com estratégias avançadas.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Copy Nelogica automático
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Dividendo sintético
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                Remuneração automática
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}