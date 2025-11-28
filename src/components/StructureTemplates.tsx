import React from 'react';

interface StructureTemplatesProps {
  onSelectTemplate: (template: any) => void;
}

export default function StructureTemplates({ onSelectTemplate }: StructureTemplatesProps) {
  const templates = [
    { name: 'Venda Coberta', description: 'Estratégia conservadora com ações + venda de call' },
    { name: 'Venda Coberta Dupla', description: 'Venda coberta com duas calls diferentes' },
    { name: 'Long Straddle', description: 'Compra de call e put no mesmo strike' },
    { name: 'Short Straddle', description: 'Venda de call e put no mesmo strike' },
    { name: 'Long Strangle', description: 'Compra de call e put em strikes diferentes' },
    { name: 'Short Strangle', description: 'Venda de call e put em strikes diferentes' },
    { name: 'Trava de Alta', description: 'Bull spread com calls' },
    { name: 'Trava de Baixa', description: 'Bear spread com puts' },
    { name: 'Iron Condor', description: 'Combinação de bull put e bear call spreads' },
    { name: 'Iron Butterfly', description: 'Short straddle protegido com long strangle' },
    { name: 'Condor', description: 'Quatro opções com três strikes diferentes' },
    { name: 'Butterfly', description: 'Três strikes, posições simétricas' },
    { name: 'TNL (Trava Horizontal)', description: 'Mesmo strike, vencimentos diferentes' },
    { name: 'Calendar Spread', description: 'Vencimentos diferentes, mesmo strike' },
    { name: 'Ratio Spread', description: 'Quantidades diferentes de opções' },
    { name: 'Collar', description: 'Ação + put comprada + call vendida' },
    { name: 'Protective Put', description: 'Ação + put comprada para proteção' },
    { name: 'Cash Secured Put', description: 'Venda de put com garantia em dinheiro' }
  ];

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Estruturas Populares</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
        {templates.map((template, index) => (
          <button
            key={index}
            onClick={() => onSelectTemplate(template)}
            className="text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            <div className="font-medium text-gray-900">{template.name}</div>
            <div className="text-sm text-gray-600 mt-1">{template.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}