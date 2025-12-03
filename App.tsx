import React, { useState } from 'react';
import StockSearch from './components/StockSearch';
import ResultDashboard from './components/ResultDashboard';
import RecommendationList from './components/RecommendationList';
import LoadingOverlay from './components/LoadingOverlay';
import { StockAnalysis, ShortTermRecommendation } from './types';
import { analyzeStock, generateShortTermRecommendations } from './services/geminiService';

const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<StockAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<ShortTermRecommendation[] | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMode, setLoadingMode] = useState<'single' | 'multi'>('single');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (stockCode: string) => {
    setLoading(true);
    setLoadingMode('single');
    setError(null);
    setAnalysisData(null);
    setRecommendations(null);
    
    try {
      // API Key is handled internally by the service via process.env.API_KEY
      const result = await analyzeStock(stockCode);
      setAnalysisData(result);
    } catch (err: any) {
      setError("无法获取该股票数据，请检查代码或稍后重试。错误: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    setLoading(true);
    setLoadingMode('multi');
    setError(null);
    setAnalysisData(null);
    setRecommendations(null);

    try {
      const results = await generateShortTermRecommendations();
      setRecommendations(results);
    } catch (err: any) {
      setError(err.message || "无法生成推荐列表，请检查网络连接。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative font-sans text-gray-100 overflow-x-hidden selection:bg-cyber-blue selection:text-black">
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.15]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyber-black via-transparent to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        
        {/* Header */}
        <header className="mb-12 text-center relative">
           <div className="absolute top-0 right-0 flex items-center space-x-3">
              <div className="hidden md:flex items-center px-3 py-1 rounded-full border border-cyber-green/30 bg-cyber-green/10">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
                  </span>
                  <span className="text-[10px] text-cyber-green font-mono font-bold tracking-wider">GEMINI API ACTIVE</span>
              </div>
           </div>

          <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 cursor-pointer hover:text-white transition-colors" onClick={() => window.location.reload()}>
            ALPHA<span className="text-cyber-blue">QUANT</span>
          </h1>
          <p className="text-cyber-blue/80 font-mono tracking-widest text-sm md:text-base">
            智能 AI 股票投资决策系统 (Powered by Google Gemini 2.5)
          </p>
        </header>

        {/* Search & Actions */}
        <StockSearch 
          onSearch={handleSearch} 
          onRecommend={handleRecommend}
          isLoading={loading} 
        />

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading && <LoadingOverlay mode={loadingMode} />}
          
          {error && (
            <div className="max-w-2xl mx-auto cyber-border p-6 bg-red-900/10 border-red-500/50 text-center animate-pulse">
              <p className="text-red-400 font-mono text-lg">系统警告: {error}</p>
            </div>
          )}

          {/* Single Stock Analysis View */}
          {analysisData && !loading && <ResultDashboard data={analysisData} />}

          {/* Recommendations View */}
          {recommendations && !loading && <RecommendationList recommendations={recommendations} />}
          
          {/* Empty State */}
          {!analysisData && !recommendations && !loading && !error && (
            <div className="text-center text-gray-600 mt-20">
              <div className="inline-block p-4 border border-gray-800 rounded-full mb-4 opacity-50 animate-pulse-slow">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <p className="font-mono text-sm tracking-widest">AWAITING INPUT COMMAND...</p>
              <p className="text-xs text-gray-700 mt-2">
                系统就绪，请输入代码
              </p>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <footer className="mt-20 border-t border-gray-900 pt-8 text-center text-gray-600 text-xs">
          <p className="mb-2 font-bold text-gray-500">⚠️ 风险免责声明</p>
          <p className="max-w-3xl mx-auto leading-relaxed">
            本应用利用人工智能技术聚合分析东方财富网等公开财经资讯。
            所有生成内容仅供参考，不构成任何投资建议。
            股市有风险，入市需谨慎。Gemini 模型可能会产生幻觉，请在投资前务必进行独立核实。
          </p>
          <p className="mt-4 font-mono">v2.0.0-gemini // POWERED BY GOOGLE GENAI</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
