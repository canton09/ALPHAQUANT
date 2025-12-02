
export interface SourceLink {
  title: string;
  url: string;
}

export interface StockAnalysis {
  stockCode: string;
  stockName: string;
  currentPrice: string; // approximate or "N/A"
  summary: string; // Max 200 words
  buyAdvice: {
    price: string;
    timing: string;
  };
  sellAdvice: {
    price: string;
    timing: string;
  };
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: SourceLink[];
  apiSuccess?: boolean; // 新增：是否成功连接API
  realtimeData?: {      // 新增：API返回的真实数据
    pe: number;
    pb: number;
    marketCap: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | StockAnalysis;
  type: 'text' | 'analysis';
}
