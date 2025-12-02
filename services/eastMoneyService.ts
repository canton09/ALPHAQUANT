
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
  
  // 1. 获取实时行情 (Spot Data)
  // f43:最新价, f57:代码, f58:名称, f162:市盈率(动), f167:市净率, f170:涨跌幅, f116:总市值
  const spotUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secId}&fields=f43,f57,f58,f162,f167,f170,f116&invt=2&fltt=2&fid=f43&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048`;

  // 2. 获取K线数据 (History Data) - 最近30天日K
  const klineUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secId}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&end=20500101&lmt=30`;

  try {
    const [spotRes, klineRes] = await Promise.all([
      fetch(spotUrl).then(r => r.json()),
      fetch(klineUrl).then(r => r.json())
    ]);

    // 检查 Spot 数据是否有效
    if (!spotRes || !spotRes.data) {
      console.warn("East Money API: No spot data found");
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

    const d = spotRes.data;
    
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
    if (klineRes && klineRes.data && klineRes.data.klines) {
      historyStr = klineRes.data.klines.map((k: string) => {
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
    console.error("East Money API Fetch Error:", error);
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
// 获取沪深A股，按换手率(f8)倒序排列，取前30个。高换手率通常意味着资金活跃，适合短线。
export const fetchActiveStocks = async (): Promise<MarketStockItem[]> => {
  // f12:代码, f14:名称, f2:最新价, f3:涨跌幅, f8:换手率, f17:开盘价
  // fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23 (沪深A股)
  const listUrl = `https://4.push2.eastmoney.com/api/qt/clist/get?pn=1&pz=30&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f8&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f2,f3,f8,f17`;

  try {
    const res = await fetch(listUrl).then(r => r.json());
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
    console.error("Failed to fetch active stock list", e);
    return [];
  }
}
