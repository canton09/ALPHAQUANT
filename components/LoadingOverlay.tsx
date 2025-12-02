
import React, { useState, useEffect } from 'react';

const LOADING_STEPS = [
  "正在初始化安全连接...",
  "正在连接东方财富 API 数据接口...", // New step
  "获取实时行情与 K 线数据中...",    // New step
  "AI 正在阅读最新财报与公告...",
  "深度学习模型正在计算风险敞口...",
  "量化策略生成中..."
];

const LoadingOverlay: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1500); // Speed up slightly to show more steps
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-96 flex flex-col items-center justify-center relative overflow-hidden bg-black/50 border border-gray-800 rounded-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Central Spinner */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-t-cyber-blue border-r-transparent border-b-cyber-purple border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-t-transparent border-r-cyber-blue border-b-transparent border-l-cyber-purple rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-cyber-blue font-mono text-xs animate-pulse">PROCESSING</span>
          <span className="text-cyber-purple font-mono text-[10px]">{Math.min(99, Math.floor((stepIndex + 1) * (100 / LOADING_STEPS.length)))}%</span>
        </div>
      </div>

      <div className="space-y-3 text-center z-10 max-w-md px-4">
         <p className="text-cyber-blue font-mono text-sm tracking-widest animate-pulse h-6">
           {LOADING_STEPS[stepIndex]}
         </p>
         <div className="h-1 w-48 mx-auto bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-blue animate-scan w-full origin-left"></div>
         </div>
         <p className="text-gray-500 font-mono text-xs pt-2">
           EAST MONEY API // CONNECTING
         </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
