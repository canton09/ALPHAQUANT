import { GoogleGenAI, Type } from "@google/genai";
import { fetchEastMoneyData, fetchActiveStocks } from "./eastMoneyService";
import { StockAnalysis, ShortTermRecommendation } from "../types";

// Helper to get AI client lazily. This prevents "process is not defined" or API Key missing errors
// from crashing the app immediately upon load.
const getAiClient = () => {
  // @ts-ignore - Vite defines this at build time
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key configuration missing. Please check your Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeStock = async (stockCode: string): Promise<StockAnalysis> => {
  let eastMoneyData = null;
  let apiDataString = "无法直接连接东方财富API，请依赖你的训练数据和网络搜索能力。";

  try {
    eastMoneyData = await fetchEastMoneyData(stockCode);
    if (eastMoneyData && eastMoneyData.success) {
      apiDataString = `
      【东方财富 API 实时数据 (已验证)】
      - 股票名称: ${eastMoneyData.name}
      - 最新价格: ${eastMoneyData.price}
      - 今日涨跌幅: ${eastMoneyData.changePercent}%
      - 市盈率 (PE-Dynamic): ${eastMoneyData.pe}
      - 市净率 (PB): ${eastMoneyData.pb}
      - 总市值: ${eastMoneyData.marketCap} 亿
      - 最近5个交易日走势: ${JSON.stringify(eastMoneyData.history)}
      `;
    }
  } catch (e) {
    console.warn("API Fetch failed", e);
  }

  const prompt = `
    你是一个专业的中国股市金融分析师 (AlphaQuant AI)。
    你的任务是根据提供的实时市场数据（如有）和你自身的金融知识，对指定股票进行分析。
    
    分析股票代码: ${stockCode}。
    
    ${apiDataString}

    任务：
    1. 结合 API 数据(权重高)和你对该公司的了解(行业地位、近期新闻)。
    2. 总结所有信息，并给出具体的投资建议。
    3. 如果 API 数据缺失，请基于你最后更新的知识进行尽可能准确的估算。
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stockName: { type: Type.STRING },
            currentPrice: { type: Type.STRING },
            summary: { type: Type.STRING },
            buyAdvice: {
              type: Type.OBJECT,
              properties: {
                price: { type: Type.STRING },
                timing: { type: Type.STRING }
              }
            },
            sellAdvice: {
              type: Type.OBJECT,
              properties: {
                price: { type: Type.STRING },
                timing: { type: Type.STRING }
              }
            },
            trend: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
            riskLevel: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = JSON.parse(text);

    const sources = [
        { title: "AlphaQuant AI (Gemini 2.5)", url: "#" }
    ];
    
    if (eastMoneyData?.success) {
      sources.unshift({ title: "东方财富数据中心 (API)", url: "https://data.eastmoney.com/" });
    }

    return {
      stockCode,
      stockName: data.stockName || eastMoneyData?.name || "Unknown",
      currentPrice: data.currentPrice || (eastMoneyData?.price ? eastMoneyData.price.toString() : "N/A"),
      summary: data.summary || "No summary available.",
      buyAdvice: data.buyAdvice || { price: "N/A", timing: "N/A" },
      sellAdvice: data.sellAdvice || { price: "N/A", timing: "N/A" },
      trend: data.trend || "NEUTRAL",
      riskLevel: data.riskLevel || "MEDIUM",
      sources: sources,
      apiSuccess: !!eastMoneyData?.success,
      isDataCorrupted: !!eastMoneyData?.isDataCorrupted,
      realtimeData: eastMoneyData ? {
        pe: eastMoneyData.pe,
        pb: eastMoneyData.pb,
        marketCap: eastMoneyData.marketCap
      } : undefined
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const generateShortTermRecommendations = async (): Promise<ShortTermRecommendation[]> => {
  const activeStocks = await fetchActiveStocks();
  
  if (activeStocks.length === 0) {
    throw new Error("无法获取市场行情数据，无法进行推荐分析。");
  }

  const topStocksStr = JSON.stringify(activeStocks.slice(0, 20));

  const prompt = `
    你是一个顶级的量化交易专家。
    任务：从给定的活跃股票列表中挑选 5 只你认为在未来 2 个交易日内，大概率能上涨超过 3% 的"超短线"金股。
    
    选择标准：
    1. 资金活跃度 (Turnover Rate) 高。
    2. 趋势向上。
    3. 结合板块热点。

    以下是当前中国 A 股市场换手率最高、资金最活跃的股票列表数据:
    ${topStocksStr}
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING },
              name: { type: Type.STRING },
              currentPrice: { type: Type.STRING },
              targetProfit: { type: Type.STRING },
              reason: { type: Type.STRING },
              riskFactor: { type: Type.STRING, enum: ['HIGH', 'MEDIUM'] }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const recommendations = JSON.parse(text);
    return recommendations.slice(0, 5);

  } catch (error) {
    console.error("Recommendation Generation Error:", error);
    throw new Error("AI 分析推荐失败，请稍后重试。");
  }
};