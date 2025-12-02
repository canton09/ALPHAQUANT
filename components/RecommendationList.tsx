
import React from 'react';
import { ShortTermRecommendation } from '../types';

interface RecommendationListProps {
  recommendations: ShortTermRecommendation[];
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-center mb-8">
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyber-purple"></div>
        <h2 className="mx-4 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple to-white tracking-widest">
          AI 优选 · 超短线突击池
        </h2>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-cyber-purple"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((stock, index) => (
          <div key={stock.code} className="relative group perspective-1000">
             {/* Card Frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/20 to-cyber-blue/5 rounded-xl blur-sm opacity-50 group-hover:opacity-100 transition duration-500"></div>
            
            <div className="relative h-full bg-black/80 backdrop-blur-md border border-gray-800 hover:border-cyber-purple/50 rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(188,19,254,0.15)]">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4 border-b border-gray-800 pb-3">
                <div>
                   <div className="flex items-center gap-2">
                     <span className="text-3xl font-bold text-white tracking-tighter">{stock.name}</span>
                     <span className="text-xs font-mono text-gray-500 px-1 border border-gray-800 rounded">{stock.code}</span>
                   </div>
                   <div className="mt-1 text-sm text-gray-400">现价: <span className="text-cyber-blue font-mono">{stock.currentPrice}</span></div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-mono text-gray-500 mb-1">预期收益</span>
                   <span className="text-xl font-bold text-cyber-green">{stock.targetProfit}</span>
                </div>
              </div>

              {/* Reason */}
              <div className="flex-1 mb-4">
                 <h4 className="text-xs text-cyber-purple font-mono mb-2 uppercase flex items-center">
                   <span className="w-1.5 h-1.5 bg-cyber-purple rounded-full mr-2 animate-pulse"></span>
                   AI 核心逻辑
                 </h4>
                 <p className="text-sm text-gray-300 leading-relaxed text-justify">
                   {stock.reason}
                 </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-800/50">
                <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    stock.riskFactor === 'HIGH' ? 'text-red-400 border-red-900 bg-red-900/10' : 'text-yellow-400 border-yellow-900 bg-yellow-900/10'
                }`}>
                  {stock.riskFactor === 'HIGH' ? '高波动' : '中高波动'}
                </span>
                <span className="text-[10px] text-gray-600 font-mono">2日内策略</span>
              </div>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyber-purple opacity-50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyber-purple opacity-50"></div>

            </div>
          </div>
        ))}
        
        {/* Placeholder / Ad Card if odd number, or just decorative */}
        <div className="hidden lg:flex flex-col items-center justify-center border border-dashed border-gray-800 rounded-xl p-6 text-center opacity-30">
           <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
           <p className="text-xs font-mono">ALGORITHM TUNING...</p>
        </div>
      </div>
    </div>
  );
};

export default RecommendationList;
