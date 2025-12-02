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
    ? 'text-cyber-red border-cyber-red shadow-[0_0_15px_rgba(255,0,60,0.3)]' 
    : isBearish 
      ? 'text-cyber-green border-cyber-green shadow-[0_0_15px_rgba(10,255,10,0.3)]' 
      : 'text-yellow-400 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]';

  // Check if API is healthy (Success AND No Corruption)
  const isApiHealthy = data.apiSuccess && !data.isDataCorrupted;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-slideUp p-2">
      
      {/* 1. API Status Indicator Bar (Full Width) */}
      <div className={`w-full border-l-4 p-4 rounded-r-lg flex items-center justify-between backdrop-blur-md shadow-lg transition-all duration-500 ${
        isApiHealthy 
          ? 'bg-cyber-dark/80 border-l-cyber-green border-y border-r border-gray-800' 
          : 'bg-red-950/40 border-l-red-500 border-y border-r border-red-900'
      }`}>
         <div className="flex items-center space-x-4">
           <div className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isApiHealthy ? 'bg-cyber-green' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isApiHealthy ? 'bg-cyber-green' : 'bg-red-500'}`}></span>
           </div>
           <div>
             <h3 className={`font-mono font-bold tracking-wider text-sm ${isApiHealthy ? 'text-white' : 'text-red-400'}`}>
               {isApiHealthy ? 'DATA LINK ESTABLISHED' : 'CONNECTION WARNING'}
             </h3>
             <p className="text-xs text-gray-500 font-mono">
               SOURCE: {isApiHealthy ? 'EAST MONEY REAL-TIME STREAM' : 'OFFLINE / FALLBACK MODE'}
             </p>
           </div>
         </div>
         <div className={`text-xs font-mono px-3 py-1 rounded border ${isApiHealthy ? 'text-cyber-green border-cyber-green/30 bg-cyber-green/5' : 'text-red-400 border-red-500/30 bg-red-500/10'}`}>
           {isApiHealthy ? 'PING: 24ms' : 'ERROR: 500'}
         </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Main Stock Card */}
        <div className="cyber-border p-6 flex flex-col justify-center items-center relative group min-h-[160px]">
          <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono border tracking-tighter uppercase ${
            isApiHealthy 
              ? 'text-cyber-green border-cyber-green bg-cyber-green/10' 
              : 'text-red-500 border-red-500 bg-red-500/10'
          }`}>
            {isApiHealthy ? 'LIVE' : 'N/A'}
          </div>
          <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-2">TARGET ASSET</h2>
          <div className="text-4xl font-black text-white neon-text mb-1">{data.stockName}</div>
          <div className="text-cyber-blue font-mono text-sm tracking-widest bg-cyber-blue/10 px-2 py-0.5 rounded">{data.stockCode}</div>
          {data.currentPrice !== "N/A" && (
             <div className="mt-4 flex items-baseline">
               <span className="text-xs text-gray-500 mr-2">PRICE</span>
               <span className={`font-mono text-2xl font-bold ${isApiHealthy ? 'text-white' : 'text-gray-500'}`}>{data.currentPrice}</span>
             </div>
          )}
        </div>
        
        {/* Fundamental Metrics with Glow */}
        {isApiHealthy && data.realtimeData ? (
          <div className="cyber-border p-5 flex flex-col justify-between relative overflow-hidden group min-h-[160px]">
             <div className="absolute -right-10 -top-10 w-32 h-32 bg-cyber-blue/10 blur-3xl rounded-full group-hover:bg-cyber-blue/20 transition duration-700"></div>
             
             <div className="space-y-4 relative z-10">
               <div className="flex justify-between items-end border-b border-gray-800/50 pb-2">
                 <span className="text-gray-500 text-[10px] font-mono">P/E RATIO</span>
                 <span className="text-cyber-blue font-mono font-bold text-xl drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                   {data.realtimeData.pe.toFixed(2)}
                 </span>
               </div>
               <div className="flex justify-between items-end border-b border-gray-800/50 pb-2">
                 <span className="text-gray-500 text-[10px] font-mono">P/B RATIO</span>
                 <span className="text-cyber-blue font-mono font-bold text-xl drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                   {data.realtimeData.pb.toFixed(2)}
                 </span>
               </div>
               <div className="flex justify-between items-end">
                 <span className="text-gray-500 text-[10px] font-mono">MKT CAP (B)</span>
                 <span className="text-white font-mono font-bold text-xl">
                   {data.realtimeData.marketCap.toFixed(2)}
                 </span>
               </div>
             </div>
          </div>
        ) : (
          <div className="cyber-border p-6 flex flex-col justify-center items-center relative overflow-hidden bg-red-950/5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAwLCAwLCAwLjEpIi8+PC9zdmc+')] opacity-20"></div>
            <span className="text-red-500 font-bold text-xs font-mono mb-2 animate-pulse bg-red-500/10 px-2 py-1 rounded">DATA UNAVAILABLE</span>
            <div className="text-gray-600 text-xs text-center font-mono">无法连接至数据源<br/>仅显示 AI 估算值</div>
          </div>
        )}

        {/* Trend Analysis */}
        <div className={`cyber-border p-6 flex flex-col justify-center items-center border-t-4 ${sentimentColor.includes('red') ? 'border-t-cyber-red' : sentimentColor.includes('green') ? 'border-t-cyber-green' : 'border-t-yellow-400'}`}>
           <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-2">MARKET TREND</h2>
           <div className={`text-2xl font-black ${sentimentColor.split(' ')[0]}`}>
             {getTrendText(data.trend)}
           </div>
        </div>

        {/* Risk Level */}
        <div className="cyber-border p-6 flex flex-col justify-center items-center">
           <h2 className="text-gray-400 text-xs font-mono tracking-widest mb-2">RISK PROFILE</h2>
           <div className={`text-lg font-bold font-mono px-6 py-2 rounded border-2 ${
             data.riskLevel === 'HIGH' ? 'text-red-500 border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
             data.riskLevel === 'MEDIUM' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
             'text-green-500 border-green-500 bg-green-500/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
           }`}>
             {getRiskText(data.riskLevel)}
           </div>
        </div>
      </div>

      {/* 3. Main Analysis & Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Summary Panel */}
        <div className="lg:col-span-2 cyber-border p-8 min-h-[300px]">
          <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
            <h3 className="text-cyber-blue font-mono text-xl flex items-center tracking-wide">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              智能研报 SUMMARY
            </h3>
            <span className="text-xs text-gray-500 font-mono border border-gray-800 px-2 py-1 rounded">ID: {Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
          </div>
          <p className="text-gray-300 leading-8 text-justify whitespace-pre-wrap text-lg font-light">
            {data.summary}
          </p>
        </div>

        {/* Trade Signals */}
        <div className="space-y-6">
          {/* Buy Signal */}
          <div className="cyber-border p-6 border-l-4 border-l-cyber-red relative overflow-hidden group hover:bg-white/5 transition duration-300">
            <h3 className="text-cyber-red font-bold text-lg mb-4 flex items-center">
              <span className="w-2 h-8 bg-cyber-red mr-3 rounded-full"></span>
              买入建议 (BUY)
            </h3>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-gray-800">
                <span className="text-gray-500 text-xs font-mono">ENTRY PRICE</span>
                <span className="text-white font-mono font-bold">{data.buyAdvice.price}</span>
              </div>
              <div className="flex flex-col bg-black/30 p-2 rounded border border-gray-800">
                <span className="text-gray-500 text-xs font-mono mb-1">TIMING STRATEGY</span>
                <span className="text-gray-300 text-sm">{data.buyAdvice.timing}</span>
              </div>
            </div>
          </div>

          {/* Sell Signal */}
          <div className="cyber-border p-6 border-l-4 border-l-cyber-green relative overflow-hidden group hover:bg-white/5 transition duration-300">
            <h3 className="text-cyber-green font-bold text-lg mb-4 flex items-center">
              <span className="w-2 h-8 bg-cyber-green mr-3 rounded-full"></span>
              卖出建议 (SELL)
            </h3>
            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-gray-800">
                <span className="text-gray-500 text-xs font-mono">EXIT PRICE</span>
                <span className="text-white font-mono font-bold">{data.sellAdvice.price}</span>
              </div>
              <div className="flex flex-col bg-black/30 p-2 rounded border border-gray-800">
                <span className="text-gray-500 text-xs font-mono mb-1">TIMING STRATEGY</span>
                <span className="text-gray-300 text-sm">{data.sellAdvice.timing}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sources Footer */}
      {data.sources.length > 0 && (
        <div className="cyber-border p-4 mt-8 bg-black/40">
          <h4 className="text-[10px] text-gray-500 font-mono mb-3 uppercase tracking-widest border-b border-gray-800 pb-2">DATA REFERENCES</h4>
          <div className="flex flex-wrap gap-4">
            {data.sources.map((source, idx) => (
              <a key={idx} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs text-cyber-blue hover:text-white transition-colors bg-cyber-blue/5 px-3 py-1.5 rounded border border-cyber-blue/20 hover:border-cyber-blue/50">
                <span className="w-1.5 h-1.5 bg-cyber-blue rounded-full mr-2"></span>
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDashboard;