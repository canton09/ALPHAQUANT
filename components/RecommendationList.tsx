import React from 'react';
import { ShortTermRecommendation } from '../types';

interface RecommendationListProps {
  recommendations: ShortTermRecommendation[];
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
  return (
    <div className="w-full max-w-7xl mx-auto animate-fadeIn p-4">
      {/* Header Title */}
      <div className="flex items-center justify-center mb-10 relative">
        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-cyber-purple to-transparent opacity-50"></div>
        <div className="relative bg-[#050505] px-6 py-2 border border-cyber-purple/30 rounded-full backdrop-blur-xl">
          <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple via-white to-cyber-purple tracking-[0.2em] uppercase text-center">
            AI Alpha Picks
          </h2>
          <p className="text-center text-[10px] text-cyber-purple font-mono tracking-widest mt-1">SHORT TERM HIGH VELOCITY TARGETS</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {recommendations.map((stock, index) => (
          <div key={stock.code} className="relative group perspective-1000 animate-slideUp" style={{ animationDelay: `${index * 100}ms` }}>
             {/* Glow Behind */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple to-blue-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition duration-500"></div>
            
            <div className="relative h-full bg-[#0a0a0f] border border-gray-800 group-hover:border-cyber-purple rounded-2xl p-6 flex flex-col transition-all duration-300 group-hover:-translate-y-2 shadow-2xl overflow-hidden">
              
              {/* Number Badge */}
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-cyber-purple/10 rounded-full blur-xl"></div>
              <div className="absolute top-4 right-4 text-4xl font-black text-gray-800 group-hover:text-cyber-purple/20 transition-colors select-none">
                0{index + 1}
              </div>

              {/* Header */}
              <div className="mb-4 relative z-10">
                 <div className="flex items-baseline gap-3 mb-1">
                   <h3 className="text-3xl font-bold text-white tracking-tight group-hover:text-cyber-blue transition-colors">{stock.name}</h3>
                   <span className="text-sm font-mono text-gray-500">{stock.code}</span>
                 </div>
                 <div className="flex items-center gap-4 text-sm">
                   <div className="bg-gray-900 px-2 py-1 rounded text-gray-300 border border-gray-700">
                     现价: <span className="font-mono text-white">{stock.currentPrice}</span>
                   </div>
                 </div>
              </div>

              {/* Profit Target */}
              <div className="mb-6 p-4 bg-cyber-purple/5 border border-cyber-purple/20 rounded-xl flex items-center justify-between">
                <span className="text-xs text-cyber-purple font-mono uppercase">Target Yield</span>
                <span className="text-2xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{stock.targetProfit}</span>
              </div>

              {/* Reason */}
              <div className="flex-1 mb-6">
                 <h4 className="text-[10px] text-gray-500 font-mono mb-2 uppercase tracking-widest flex items-center">
                   <span className="w-1 h-1 bg-cyber-blue rounded-full mr-2"></span>
                   Analysis Logic
                 </h4>
                 <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-gray-800 pl-3 group-hover:border-cyber-purple transition-colors">
                   {stock.reason}
                 </p>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-800 relative z-10">
                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                    stock.riskFactor === 'HIGH' ? 'text-red-400 border-red-900 bg-red-950/30' : 'text-yellow-400 border-yellow-900 bg-yellow-900/30'
                }`}>
                  {stock.riskFactor === 'HIGH' ? 'High Volatility' : 'Med Volatility'}
                </span>
                <button className="text-xs text-cyber-purple hover:text-white transition-colors font-mono flex items-center">
                  DETAILS <span className="ml-1">→</span>
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;