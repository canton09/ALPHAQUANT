
import React, { useState } from 'react';

interface StockSearchProps {
  onSearch: (code: string) => void;
  onRecommend: () => void;
  isLoading: boolean;
  onResetKey: () => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSearch, onRecommend, isLoading, onResetKey }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-12 relative z-10 flex flex-col items-center gap-6 animate-slideUp">
      {/* Search Bar Container */}
      <form onSubmit={handleSubmit} className="relative group w-full">
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue rounded-lg opacity-30 group-hover:opacity-60 blur-md transition duration-500"></div>
        
        <div className="relative flex items-center bg-black border border-gray-700 rounded-lg p-1.5 shadow-2xl">
          <div className="pl-4 pr-2 text-cyber-blue font-mono text-xl select-none font-bold">CN:</div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入代码 (如: 600519)"
            className="flex-1 bg-transparent text-white p-3 focus:outline-none font-mono text-lg tracking-wider placeholder-gray-600 uppercase"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-8 py-3 rounded-md text-sm font-black tracking-widest uppercase transition-all duration-300 border border-transparent
              ${isLoading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-cyber-blue text-black hover:bg-white hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]'
              }`}
          >
            {isLoading ? 'ANALYZING...' : '立即分析'}
          </button>
        </div>
      </form>

      {/* Action Buttons Row */}
      <div className="flex w-full justify-center">
        <button
          onClick={onRecommend}
          disabled={isLoading}
          className={`
            group relative px-10 py-4 overflow-hidden rounded-full bg-transparent border-2 border-cyber-purple text-white font-bold tracking-widest uppercase transition-all duration-300 w-full max-w-md
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[0_0_30px_rgba(188,19,254,0.4)] hover:scale-105'}
          `}
        >
          <div className="absolute inset-0 w-full h-full bg-cyber-purple/10 group-hover:bg-cyber-purple/20 transition-all duration-300"></div>
          <span className="relative z-10 flex items-center justify-center">
            <span className="mr-2 text-2xl animate-pulse">⚡</span>
            <span>获取 AI 超短线金股推荐 (Top 5)</span>
          </span>
        </button>
      </div>

      <div className="flex justify-between items-center w-full max-w-3xl text-[10px] text-gray-500 font-mono px-4">
        <span>DATA STREAM: <span className="text-cyber-green">ACTIVE</span></span>
        
        {/* Reset Key Button */}
        <button 
          onClick={onResetKey}
          className="flex items-center space-x-2 text-gray-500 hover:text-cyber-blue transition-colors group cursor-pointer"
        >
           <svg className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
           <span>CHANGE API KEY</span>
        </button>

        <span>PROVIDER: <span className="text-cyber-green font-bold">DEEPSEEK V3</span></span>
      </div>
    </div>
  );
};

export default StockSearch;
