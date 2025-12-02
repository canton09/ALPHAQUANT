
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
  apiSuccess?: boolean;
  isDataCorrupted?: boolean;
  realtimeData?: {
    pe: number;
    pb: number;
    marketCap: number;
  };
}

// 新增：短线推荐股票的数据结构
export interface ShortTermRecommendation {
  code: string;
  name: string;
  currentPrice: string;
  targetProfit: string; // e.g. ">3%"
  reason: string; // Max 100 words
  riskFactor: 'HIGH' | 'MEDIUM';
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | StockAnalysis;
  type: 'text' | 'analysis';
}
