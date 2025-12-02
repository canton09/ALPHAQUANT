
import React, { useState } from 'react';

interface StockSearchProps {
  onSearch: (code: string) => void;
  onRecommend: () => void; // New prop
  isLoading: boolean;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSearch, onRecommend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-10 relative z-10 flex flex-col items-center gap-4">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative group w-full">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded opacity-25 group-hover:opacity-75 blur transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-cyber-dark border border-gray-800 rounded-lg p-1">
          <span className="pl-4 text-cyber-blue font-mono text-xl select-none">CN-</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="请输入股票代码 (如: 600519)"
            className="flex-1 bg-transparent text-white p-3 focus:outline-none font-mono tracking-wider placeholder-gray-600 uppercase"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 rounded text-sm font-bold tracking-widest uppercase transition-all duration-300
              ${isLoading 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-cyber-blue/10 text-cyber-blue hover:bg-cyber-blue hover:text-black shadow-[0_0_10px_rgba(0,243,255,0.3)] hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]'
              }`}
          >
            {isLoading ? '分析中...' : '开始分析'}
          </button>
        </div>
      </form>

      {/* Action Buttons Row */}
      <div className="flex w-full justify-center">
        <button
          onClick={onRecommend}
          disabled={isLoading}
          className={`
            group relative px-8 py-3 overflow-hidden rounded bg-cyber-dark border border-cyber-purple/50 text-cyber-purple font-bold tracking-wider uppercase transition-all
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-cyber-purple hover:shadow-[0_0_15px_rgba(188,19,254,0.4)]'}
          `}
        >
          <span className="relative z-10 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            获取超短线金股推荐 (AI 选股)
          </span>
          <div className="absolute inset-0 h-full w-full scale-0 rounded transition-all duration-300 group-hover:scale-100 group-hover:bg-cyber-purple/10"></div>
        </button>
      </div>

      <div className="mt-2 text-xs text-gray-500 font-mono text-center flex justify-between px-2 w-full max-w-2xl">
        <span>数据源: 东方财富 (EAST MONEY)</span>
        <span>系统状态: 在线 (ONLINE)</span>
      </div>
    </div>
  );
};

export default StockSearch;
