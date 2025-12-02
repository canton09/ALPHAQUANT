import React, { useState } from 'react';

interface StockSearchProps {
  onSearch: (code: string) => void;
  isLoading: boolean;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 relative z-10">
      <form onSubmit={handleSubmit} className="relative group">
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
      <div className="mt-2 text-xs text-gray-500 font-mono text-center flex justify-between px-2">
        <span>数据源: 东方财富 (EAST MONEY)</span>
        <span>系统状态: 在线 (ONLINE)</span>
      </div>
    </div>
  );
};

export default StockSearch;