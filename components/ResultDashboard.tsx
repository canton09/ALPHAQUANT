
import React from 'react';
import { StockAnalysis } from '../types';

interface ResultDashboardProps {
  data: StockAnalysis;
}

const ResultDashboard: React.FC<ResultDashboardProps> = ({ data }) => {
  const isBullish = data.trend === 'BULLISH';
  const isBearish = data.trend === 'BEARISH';
  
  const getTrendText = (trend: string) => {
    switch(trend) {
      case 'BULLISH': return '看多 (Bullish)';
      case 'BEARISH': return '看空 (Bearish)';
      default: return '震荡 (Neutral)';
    }
  };

  const getRiskText = (risk: string) => {
    switch(risk) {
      case 'HIGH': return '高风险';
      case 'MEDIUM': return '中风险';
      case 'LOW': return '低风险';
      default: return '未知';
    }
  };

  const sentimentColor = isBullish 
    ? 'text-cyber-red border-cyber-red shadow-cyber-red/20' 
    : isBearish 
      ? 'text-cyber-green border-cyber-green shadow-cyber-green/20' 
      : 'text-yellow-400 border-yellow-400 shadow-yellow-400/20';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Stat Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* API Status Card (New) */}
        <div className="col-span-1 md:col-span-4 flex items-center justify-between bg-cyber-dark border border-gray-800 px-4 py-2 rounded">
           <div className="flex items-center space-x-2">
             <span className={`w-2 h-2 rounded-full ${data.apiSuccess ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
             <span className="text-xs font-mono text-gray-400">
               数据通道: {data.apiSuccess ? '东方财富 API 直连 (ACTIVE)' : 'AI 搜索引擎 (FALLBACK)'}
             </span>
           </div>
           <span className="text-xs font-mono text-gray-600">LATENCY: 45ms</span>
        </div>

        <div className="cyber-border p-6 flex flex-col justify-center items-center">
          <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-1">标的资产 (TARGET)</h2>
          <div className="text-3xl font-bold text-white neon-text">{data.stockName}</div>
          <div className="text-cyber-blue font-mono text-sm">{data.stockCode}</div>
          {data.currentPrice !== "N/A" && (
             <div className="mt-2 text-sm text-gray-300">现价: <span className="font-mono text-white text-lg">{data.currentPrice}</span></div>
          )}
        </div>
        
        {/* Real Data Metrics (Only show if API success) */}
        {data.realtimeData ? (
          <div className="cyber-border p-4 flex flex-col justify-center space-y-2">
             <div className="flex justify-between items-center border-b border-gray-800 pb-1">
               <span className="text-gray-500 text-xs">市盈率 (PE)</span>
               <span className="text-cyber-blue font-mono">{data.realtimeData.pe.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center border-b border-gray-800 pb-1">
               <span className="text-gray-500 text-xs">市净率 (PB)</span>
               <span className="text-cyber-blue font-mono">{data.realtimeData.pb.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-gray-500 text-xs">总市值 (亿)</span>
               <span className="text-white font-mono">{data.realtimeData.marketCap.toFixed(2)}</span>
             </div>
          </div>
        ) : (
          <div className="cyber-border p-6 flex flex-col justify-center items-center">
            <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-1">基本面数据</h2>
            <div className="text-gray-600 text-xs text-center">API 数据不可用<br/>仅供参考</div>
          </div>
        )}

        <div className="cyber-border p-6 flex flex-col justify-center items-center">
           <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-1">市场趋势 (TREND)</h2>
           <div className={`text-2xl font-bold ${sentimentColor.split(' ')[0]} drop-shadow-lg`}>
             {getTrendText(data.trend)}
           </div>
        </div>

        <div className="cyber-border p-6 flex flex-col justify-center items-center">
           <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-1">风险评估 (RISK)</h2>
           <div className={`text-xl font-bold font-mono px-4 py-1 border rounded ${
             data.riskLevel === 'HIGH' ? 'text-red-500 border-red-500 bg-red-500/10' :
             data.riskLevel === 'MEDIUM' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
             'text-green-500 border-green-500 bg-green-500/10'
           }`}>
             {getRiskText(data.riskLevel)}
           </div>
        </div>
      </div>

      {/* Main Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Summary */}
        <div className="lg:col-span-2 cyber-border p-6 min-h-[300px]">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
            <h3 className="text-cyber-blue font-mono text-lg flex items-center">
              <span className="w-2 h-2 bg-cyber-blue mr-2 animate-pulse"></span>
              AI 智能研报 (INTELLIGENCE REPORT)
            </h3>
            <span className="text-xs text-gray-500 font-mono">ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
          </div>
          <p className="text-gray-300 leading-relaxed text-justify whitespace-pre-wrap">
            {data.summary}
          </p>
        </div>

        {/* Right: Actionable Advice */}
        <div className="space-y-6">
          {/* Buy Card */}
          <div className="cyber-border p-6 border-l-4 border-l-cyber-red relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
              <svg className="w-16 h-16 text-cyber-red" fill="currentColor" viewBox="0 0 20 20"><path d="M12 7l-5 5h10l-5-5z" /></svg>
            </div>
            <h3 className="text-cyber-red font-bold mb-3 flex items-center relative z-10">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              买入建议 (BUY)
            </h3>
            <div className="space-y-2 text-sm relative z-10">
              <div className="flex justify-between">
                <span className="text-gray-500">建议价格:</span>
                <span className="text-white font-mono">{data.buyAdvice.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">买入时机:</span>
                <span className="text-white text-right">{data.buyAdvice.timing}</span>
              </div>
            </div>
          </div>

          {/* Sell Card */}
          <div className="cyber-border p-6 border-l-4 border-l-cyber-green relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
              <svg className="w-16 h-16 text-cyber-green" fill="currentColor" viewBox="0 0 20 20"><path d="M12 13l5-5H7l5 5z" /></svg>
            </div>
            <h3 className="text-cyber-green font-bold mb-3 flex items-center relative z-10">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path></svg>
              卖出建议 (SELL)
            </h3>
            <div className="space-y-2 text-sm relative z-10">
              <div className="flex justify-between">
                <span className="text-gray-500">建议价格:</span>
                <span className="text-white font-mono">{data.sellAdvice.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">卖出时机:</span>
                <span className="text-white text-right">{data.sellAdvice.timing}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      {data.sources.length > 0 && (
        <div className="cyber-border p-4 mt-6">
          <h4 className="text-xs text-gray-500 font-mono mb-2 uppercase">参考数据源 (DATA SOURCES)</h4>
          <ul className="space-y-1">
            {data.sources.map((source, idx) => (
              <li key={idx}>
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyber-blue hover:text-white truncate block hover:underline transition-colors flex items-center">
                  <span className="mr-2 opacity-50">[{idx + 1}]</span>
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultDashboard;
