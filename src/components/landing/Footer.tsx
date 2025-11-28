import React from 'react';
import { TrendingUp, Shield, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white">Strategos Partners</h3>
              <p className="text-sm text-gray-400">Tecnologia em Tesouraria</p>
            </div>
            <p className="text-gray-300 text-sm">
              Consultoria em Patrimônio com tecnologia avançada em tesouraria e 
              operações estruturadas para o mercado financeiro brasileiro.
            </p>
          </div>

          {/* WhatsApp Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contato</h4>
            <a
              href="https://wa.me/5511975333355"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Phone className="w-5 h-5 mr-2" />
              WhatsApp
            </a>
            <p className="text-gray-400 text-sm">
              Entre em contato via WhatsApp para consultoria especializada
            </p>
          </div>

          {/* Analyst Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Analista Responsável</h4>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Shield className="w-5 h-5 text-green-400 mr-2" />
                <span className="text-white font-semibold">Stefano Padula</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Analista CNPI Certificado</p>
              <p className="text-xs text-gray-400">
                Responsável técnico pelas análises e recomendações de investimento
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <h5 className="text-yellow-300 font-semibold mb-2">⚠️ Disclaimer Importante</h5>
            <div className="text-yellow-400 text-sm space-y-1">
              <p>• As projeções apresentadas não constituem oferta de investimento (COE)</p>
              <p>• Operações estruturadas envolvem riscos e podem resultar em perdas</p>
              <p>• Rentabilidade passada não garante resultados futuros</p>
              <p>• Consulte sempre um analista certificado antes de investir</p>
              <p>• Operações com foco no cliente sem comissionamento e sem spread</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Strategos Partners. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Tecnologia em Tesouraria • Consultoria em Patrimônio • Analista CNPI: Stefano Padula
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}