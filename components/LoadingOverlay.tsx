
import React, { useState, useEffect } from 'react';

const SINGLE_STEPS = [
  "正在初始化安全连接...",
  "正在连接东方财富 API 数据接口...",
  "获取实时行情与 K 线数据中...",
  "AI 正在阅读最新财报与公告...",
  "深度学习模型正在计算风险敞口...",
  "量化策略生成中..."
];

const MULTI_STEPS = [
  "正在扫描全市场实时行情...",
  "获取两市资金活跃度排名 (Top 30)...",
  "筛选高换手与动量突破标的...",
  "AI 正在交叉验证技术形态...",
  "计算超短线收益概率模型...",
  "生成最终 Top 5 金股名单..."
];

interface LoadingOverlayProps {
  mode?: 'single' | 'multi'; // Optional prop to distinguish modes
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ mode = 'single' }) => {
  const steps = mode === 'multi' ? MULTI_STEPS : SINGLE_STEPS;
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0); // Reset on mount
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="w-full h-96 flex flex-col items-center justify-center relative overflow-hidden bg-black/50 border border-gray-800 rounded-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,243,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,243,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Central Spinner */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 border-4 border-t-cyber-blue border-r-transparent border-b-cyber-purple border-l-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-2 border-t-transparent border-r-cyber-blue border-b-transparent border-l-cyber-purple rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-cyber-blue font-mono text-xs animate-pulse">PROCESSING</span>
          <span className="text-cyber-purple font-mono text-[10px]">{Math.min(99, Math.floor((stepIndex + 1) * (100 / steps.length)))}%</span>
        </div>
      </div>

      <div className="space-y-3 text-center z-10 max-w-md px-4">
         <p className="text-cyber-blue font-mono text-sm tracking-widest animate-pulse h-6">
           {steps[stepIndex]}
         </p>
         <div className="h-1 w-48 mx-auto bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyber-blue animate-scan w-full origin-left"></div>
         </div>
         <p className="text-gray-500 font-mono text-xs pt-2">
           EAST MONEY API // {mode === 'multi' ? 'SCANNING MARKET' : 'CONNECTING'}
         </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
