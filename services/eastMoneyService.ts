
export interface EastMoneyData {
  name: string;
  code: string;
  price: number;
  changePercent: number;
  pe: number; // 市盈率
  pb: number; // 市净率
  marketCap: number; // 总市值 (亿)
  history: string[]; // 简单的历史K线描述
  success: boolean;
  isDataCorrupted?: boolean; // 新增：标记数据是否异常
}

export interface MarketStockItem {
  code: string;
  name: string;
  price: number;
  changePercent: number;
  turnoverRate: number; // 换手率
  volume: number;
}

// 辅助函数：根据股票代码判断市场ID
// 1: 沪 (6开头), 0: 深 (0, 3开头)
const getMarketId = (code: string): string => {
  if (code.startsWith('6')) return '1';
  return '0';
};

// 辅助函数：安全解析数值，处理 "-" 或 null
const safeParseNumber = (val: any): number => {
  if (val === '-' || val === null || val === undefined) return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
};

export const fetchEastMoneyData = async (stockCode: string): Promise<EastMoneyData | null> => {
  const marketId = getMarketId(stockCode);
  const secId = `${marketId}.${stockCode}`;
  
  // Use Vercel API Proxy to avoid CORS
  const apiUrl = `/api/stock?secid=${secId}`;

  try {
    const res = await fetch(apiUrl).then(r => r.json());

    if (!res || !res.spot || !res.spot.data) {
      console.warn("API Proxy: No spot data found");
      return {
        name: "Unknown",
        code: stockCode,
        price: 0,
        changePercent: 0,
        pe: 0,
        pb: 0,
        marketCap: 0,
        history: [],
        success: false,
        isDataCorrupted: true
      };
    }

    const d = res.spot.data;
    
    // 解析基础数据
    const price = safeParseNumber(d.f43);
    const changePercent = safeParseNumber(d.f170);
    const pe = safeParseNumber(d.f162);
    const pb = safeParseNumber(d.f167);
    const marketCapRaw = safeParseNumber(d.f116);
    
    const marketCapBillion = Number((marketCapRaw / 100000000).toFixed(2));

    const isPriceInvalid = price <= 0;
    const isNameInvalid = !d.f58 || d.f58 === '-';
    
    const isDataCorrupted = isPriceInvalid || isNameInvalid;

    // 格式化 K 线数据
    let historyStr: string[] = [];
    if (res.kline && res.kline.data && res.kline.data.klines) {
      historyStr = res.kline.data.klines.map((k: string) => {
        const parts = k.split(',');
        if (parts.length < 11) return "Data Error";
        return `Date:${parts[0]} Close:${parts[2]} Change:${parts[8]}%`; 
      });
    }

    return {
      name: d.f58 && d.f58 !== '-' ? d.f58 : "未知名称",
      code: d.f57 || stockCode,
      price: price,
      changePercent: changePercent,
      pe: pe,
      pb: pb,
      marketCap: marketCapBillion,
      history: historyStr.slice(-5),
      success: !isDataCorrupted,
      isDataCorrupted: isDataCorrupted
    };

  } catch (error) {
    console.error("API Fetch Error:", error);
    return {
      name: "Error",
      code: stockCode,
      price: 0,
      changePercent: 0,
      pe: 0,
      pb: 0,
      marketCap: 0,
      history: [],
      success: false,
      isDataCorrupted: true
    };
  }
};

// 新增：获取市场活跃股票列表（用于推荐分析）
export const fetchActiveStocks = async (): Promise<MarketStockItem[]> => {
  // Use Vercel API Proxy
  const apiUrl = `/api/market`;

  try {
    const res = await fetch(apiUrl).then(r => r.json());
    if (res && res.data && res.data.diff) {
      return res.data.diff.map((item: any) => ({
        code: item.f12,
        name: item.f14,
        price: safeParseNumber(item.f2),
        changePercent: safeParseNumber(item.f3),
        turnoverRate: safeParseNumber(item.f8),
        open: safeParseNumber(item.f17)
      })).filter((s: MarketStockItem) => s.price > 0 && s.name !== '-');
    }
    return [];
  } catch (e) {
    console.error("Failed to fetch active stock list via proxy", e);
    return [];
  }
}
