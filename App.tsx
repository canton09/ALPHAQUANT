import React, { useState } from 'react';
import StockSearch from './components/StockSearch';
import ResultDashboard from './components/ResultDashboard';
import LoadingOverlay from './components/LoadingOverlay';
import { StockAnalysis } from './types';
import { analyzeStock } from './services/geminiService';

const App: React.FC = () => {
  const [data, setData] = useState<StockAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (stockCode: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await analyzeStock(stockCode);
      setData(result);
    } catch (err) {
      setError("无法获取该股票数据，请检查代码是否正确或稍后重试。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-gray-100 overflow-x-hidden selection:bg-cyber-blue selection:text-black">
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
            ALPHA<span className="text-cyber-blue">QUANT</span>
          </h1>
          <p className="text-cyber-blue/80 font-mono tracking-widest text-sm md:text-base">
            智能 AI 股票投资决策系统
          </p>
        </header>

        {/* Search Section */}
        <StockSearch onSearch={handleSearch} isLoading={loading} />

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading && <LoadingOverlay />}
          
          {error && (
            <div className="max-w-2xl mx-auto cyber-border p-6 bg-red-900/10 border-red-500/50 text-center animate-pulse">
              <p className="text-red-400 font-mono text-lg">系统警告: {error}</p>
            </div>
          )}

          {data && !loading && <ResultDashboard data={data} />}
          
          {!data && !loading && !error && (
            <div className="text-center text-gray-600 mt-20">
              <div className="inline-block p-4 border border-gray-800 rounded-full mb-4 opacity-50">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <p className="font-mono text-sm">等待输入目标指令...</p>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <footer className="mt-20 border-t border-gray-900 pt-8 text-center text-gray-600 text-xs">
          <p className="mb-2 font-bold text-gray-500">⚠️ 风险免责声明</p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            本应用利用人工智能技术聚合分析东方财富网等公开财经资讯。
            所有生成内容仅供参考，不构成任何投资建议。
            股市有风险，入市需谨慎。AI 可能会产生幻觉或数据延迟，请在投资前务必进行独立核实。
          </p>
          <p className="mt-4 font-mono">v1.0.5-cn // CONNECTED TO GEMINI API</p>
        </footer>
      </div>
    </div>
  );
};

export default App;