import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, TrendingUp } from 'lucide-react';
import { OptionStructure, TradingOperation } from '../types/trading';

interface StructureCSVUploaderProps {
  structure: OptionStructure;
  onUpload: (operations: TradingOperation[]) => void;
  onCancel: () => void;
  isZeroMode?: boolean;
}

export default function StructureCSVUploader({ structure, onUpload, onCancel, isZeroMode = false }: StructureCSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [previewData, setPreviewData] = useState<TradingOperation[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const template = `ativo,tipo,pm,alta,quantidade,premio,taxaColeta,custoExercicio,corretagem,dataEntrada,dataSaida,status
${structure.legs.map(leg => 
  `${leg.ativo},Opções,${leg.strike},${leg.strike * 1.05},${leg.quantidade},${leg.premio},2.50,0.75,2.50,${new Date().toISOString().split('T')[0]},${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]},Fechada`
).join('\n')}`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operacoes_${structure.nome.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): TradingOperation[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const requiredHeaders = ['ativo', 'tipo', 'pm', 'quantidade', 'premio', 'dataEntrada', 'status'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      throw new Error(`Colunas obrigatórias ausentes: ${missingHeaders.join(', ')}`);
    }

    return lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i];
      });

      // Validate and convert data types
      if (!row.ativo) throw new Error(`Linha ${index + 2}: Ativo é obrigatório`);
      
      const pm = parseFloat(row.pm);
      if (isNaN(pm)) throw new Error(`Linha ${index + 2}: PM inválido`);
      
      const quantidade = parseInt(row.quantidade);
      if (isNaN(quantidade)) throw new Error(`Linha ${index + 2}: Quantidade inválida`);
      
      const premio = parseFloat(row.premio || '0');
      const taxaColeta = parseFloat(row.taxaColeta || '0');
      const custoExercicio = parseFloat(row.custoExercicio || '0');
      const corretagem = parseFloat(row.corretagem || '2.50');
      
      if (!row.dataEntrada) throw new Error(`Linha ${index + 2}: Data de entrada é obrigatória`);

      // Calculate result considering all costs
      const alta = parseFloat(row.alta || '0');
      const recompensa = parseFloat(row.recompensa || '0');
      
      let resultado = 0;
      if (row.status === 'Fechada') {
        // Resultado = (Preço Saída - Preço Entrada) * Quantidade + Prêmio + Recompensa - Custos
        const resultadoOperacao = (alta - pm) * quantidade;
        const totalCustos = taxaColeta + custoExercicio + corretagem;
        resultado = resultadoOperacao + premio + recompensa - totalCustos;
      }

      return {
        id: crypto.randomUUID(),
        tipo: row.tipo as any,
        ativo: row.ativo.toUpperCase(),
        pm,
        strike: parseFloat(row.strike || pm),
        quantidade,
        premio,
        taxaColeta,
        custoExercicio,
        corretagem,
        alta,
        recompensa,
        dataEntrada: row.dataEntrada,
        dataSaida: row.dataSaida || '',
        status: row.status as any,
        resultado,
        estrutura: structure
      };
    });
  };

  const handleFile = async (file: File) => {
    setUploadStatus('processing');
    setErrorMessage('');

    try {
      const text = await file.text();
      const data = parseCSV(text);
      setPreviewData(data);
      setUploadStatus('success');
    } catch (error) {
      setErrorMessage((error as Error).message);
      setUploadStatus('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      handleFile(csvFile);
    } else {
      setErrorMessage('Por favor, selecione um arquivo CSV válido');
      setUploadStatus('error');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const confirmUpload = () => {
    onUpload(previewData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">
                  {isZeroMode ? 'Zerar Estrutura' : 'Ativar Estrutura'}
                </h2>
                <p className="text-green-100">
                  {isZeroMode 
                    ? `Upload dos preços de saída para zerar ${structure.nome}`
                    : `Upload das operações executadas para ${structure.nome}`
                  }
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Structure Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">{structure.nome}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Pernas: </span>
                <span className="font-medium">{structure.legs.length}</span>
              </div>
              <div>
                <span className="text-blue-700">Prêmio Teórico: </span>
                <span className="font-medium">{formatCurrency(structure.premioLiquido)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Upload className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {isZeroMode ? 'Upload dos Preços de Saída' : 'Upload das Operações'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isZeroMode 
                    ? 'Importe os preços de saída para zerar as posições'
                    : 'Importe as operações reais executadas'
                  }
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Criar dados mock baseados na estrutura ou operações existentes
                  const mockOperations: TradingOperation[] = isZeroMode && structure.operacoes 
                    ? structure.operacoes.map(op => ({
                        ...op,
                        dataSaida: new Date().toISOString().split('T')[0],
                        status: 'Fechada' as any,
                        alta: op.pm * (1 + (Math.random() - 0.5) * 0.1), // Simula preço de saída próximo ao PM
                        resultado: 0 // Será recalculado
                      }))
                    : structure.legs.map((leg, index) => ({
                    id: crypto.randomUUID(),
                    tipo: 'Opções' as any,
                    ativo: leg.ativo,
                    pm: leg.strike * 0.95, // PM ligeiramente abaixo do strike
                    strike: leg.strike,
                    quantidade: leg.quantidade,
                    premio: leg.premio,
                    taxaColeta: 2.50,
                    alta: leg.posicao === 'VENDIDA' ? leg.premio * 0.5 : leg.strike * 1.05, // Simula fechamento
                    recompensa: Math.random() > 0.5 ? Math.random() * 50 : 0,
                    dataEntrada: new Date().toISOString().split('T')[0],
                    dataSaida: leg.posicao === 'VENDIDA' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
                    status: Math.random() > 0.3 ? 'Fechada' as any : 'Aberta' as any,
                    resultado: 0,
                    estrutura: structure
                  }));
                  
                  // Calcular resultado para cada operação
                  mockOperations.forEach(op => {
                    if (op.status === 'Fechada') {
                      const resultadoOperacao = (op.alta - op.pm) * op.quantidade;
                      const totalCustos = op.taxaColeta + (op.custoExercicio || 0) + (op.corretagem || 2.50);
                      op.resultado = resultadoOperacao + op.premio + op.recompensa - totalCustos;
                    }
                  });
                  
                  setPreviewData(mockOperations);
                  setUploadStatus('success');
                }}
                className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border border-purple-200"
              >
                🧪 {isZeroMode ? 'Simular Saídas' : 'Dados Mock'}
              </button>
              <button
                onClick={downloadTemplate}
                className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Template
              </button>
            </div>
          </div>

          {uploadStatus === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
            >
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isZeroMode ? 'Arraste o CSV com preços de saída' : 'Arraste seu arquivo CSV aqui'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                ou clique para selecionar
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Selecionar Arquivo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {uploadStatus === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processando arquivo...</p>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">Erro no upload</p>
              </div>
              <p className="text-red-700 mt-2">{errorMessage}</p>
              <button
                onClick={() => setUploadStatus('idle')}
                className="mt-3 text-sm text-red-600 hover:text-red-800"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {uploadStatus === 'success' && previewData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center text-green-600 mb-4">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {previewData.length} operações encontradas
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Ativo
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Preço Entrada
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Preço Saída
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Qtd
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Prêmio
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Custos
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Resultado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.map((row, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {row.ativo}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {formatCurrency(row.pm)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.alta > 0 ? formatCurrency(row.alta) : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {row.quantidade}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <span className={row.premio >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {row.premio >= 0 ? '+' : ''}{formatCurrency(row.premio)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600">
                          -{formatCurrency(row.taxaColeta + (row.recompensa || 0))}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            row.status === 'Fechada' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          <span className={row.resultado >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(row.resultado)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Resumo</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-green-700">Total de Operações</p>
                    <p className="font-bold text-green-900">{previewData.length}</p>
                  </div>
                  <div>
                    <p className="text-green-700">Operações Fechadas</p>
                    <p className="font-bold text-green-900">
                      {previewData.filter(op => op.status === 'Fechada').length}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">Total de Custos</p>
                    <p className="font-bold text-red-900">
                      {formatCurrency(previewData.reduce((sum, op) => 
                        sum + op.taxaColeta + (op.custoExercicio || 0) + (op.corretagem || 0), 0
                      ))}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-700">Resultado Total</p>
                    <p className={`font-bold ${
                      previewData.reduce((sum, op) => sum + op.resultado, 0) >= 0 
                        ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(previewData.reduce((sum, op) => sum + op.resultado, 0))}
                    </p>
                  </div>
                </div>
                
                {/* Breakdown detalhado dos custos */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  <h5 className="text-sm font-medium text-green-800 mb-2">Breakdown de Custos:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600">Corretagem Total</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(previewData.reduce((sum, op) => sum + (op.corretagem || 0), 0))}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600">Taxas de Coleta</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(previewData.reduce((sum, op) => sum + op.taxaColeta, 0))}
                      </p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-gray-600">Custos de Exercício</p>
                      <p className="font-bold text-red-600">
                        {formatCurrency(previewData.reduce((sum, op) => sum + (op.custoExercicio || 0), 0))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setUploadStatus('idle');
                    setPreviewData([]);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmUpload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  {isZeroMode ? 'Zerar Estrutura' : 'Ativar Estrutura'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}