
import { GoogleGenAI } from "@google/genai";
import { StockAnalysis, SourceLink, ShortTermRecommendation } from "../types";
import { fetchEastMoneyData, fetchActiveStocks, MarketStockItem } from "./eastMoneyService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Existing analyzeStock function...
export const analyzeStock = async (stockCode: string): Promise<StockAnalysis> => {
  const model = "gemini-2.5-flash";
  
  // 1. 尝试从东方财富 API 获取数据
  let apiDataString = "无法直接连接东方财富API，请依赖Google搜索工具获取数据。";
  let eastMoneyData = null;

  try {
    eastMoneyData = await fetchEastMoneyData(stockCode);
    if (eastMoneyData && eastMoneyData.success) {
      apiDataString = `
      【东方财富 API 实时数据 (已验证)】
      - 股票名称: ${eastMoneyData.name}
      - 最新价格: ${eastMoneyData.price} (注意：如果数值异常请校验)
      - 今日涨跌幅: ${eastMoneyData.changePercent}%
      - 市盈率 (PE-Dynamic): ${eastMoneyData.pe}
      - 市净率 (PB): ${eastMoneyData.pb}
      - 总市值: ${eastMoneyData.marketCap} 亿
      - 最近5个交易日走势: ${JSON.stringify(eastMoneyData.history)}
      
      请基于以上真实数据，结合 Google Search 的新闻进行分析。如果 API 数据显示"0"或异常，请忽略API数据并以搜索结果为准。
      `;
    }
  } catch (e) {
    console.warn("API Fetch failed, falling back to pure AI", e);
  }

  const prompt = `
    你是一个专业的中国股市金融分析师。请分析股票代码: ${stockCode}。
    
    ${apiDataString}

    任务：
    1. 使用 Google Search 工具去查询"东方财富网" (East Money) 和其他权威财经网站关于该股票的最新资讯（财报、公告、新闻）。
    2. 将 API 提供的硬数据（如有）与搜索到的软消息结合。
    3. 总结所有信息，并给出具体的投资建议。

    输出格式要求：
    请直接返回一个纯 JSON 字符串，不要包含 Markdown 格式化（如 \`\`\`json ... \`\`\`）。JSON 对象必须包含以下字段：
    - stockName: 股票名称 (优先使用 API 数据: ${eastMoneyData?.name || '未知'})
    - currentPrice: 当前价格 (优先使用 API 数据: ${eastMoneyData?.price || '未知'})
    - summary: 总体判断总结，严格控制在200字以内。
    - buyAdvice: 一个对象，包含 'price' (建议买入价格区间) 和 'timing' (建议买入时机)。
    - sellAdvice: 一个对象，包含 'price' (建议卖出价格区间) 和 'timing' (建议卖出时机)。
    - trend: 字符串，只能是 'BULLISH', 'BEARISH', 或 'NEUTRAL'。
    - riskLevel: 字符串，只能是 'HIGH', 'MEDIUM', 或 'LOW'。

    如果搜索不到该股票，请在 summary 中说明。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "{}";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract sources
    const sources: SourceLink[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
      }));
    
    // Add East Money as a source if API worked
    if (eastMoneyData?.success) {
      sources.unshift({ title: "东方财富数据中心 (API)", url: "https://data.eastmoney.com/" });
    }

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let data: any;
    try {
      data = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON", cleanText);
      throw new Error("Analysis failed: Invalid data format returned.");
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

// New Function: Generate Top 5 Short Term Recommendations
export const generateShortTermRecommendations = async (): Promise<ShortTermRecommendation[]> => {
  // 1. Get raw active market data
  const activeStocks = await fetchActiveStocks();
  
  if (activeStocks.length === 0) {
    throw new Error("无法获取市场行情数据，无法进行推荐分析。");
  }

  // Limit to top 20 to avoid token limits
  const topStocksStr = JSON.stringify(activeStocks.slice(0, 20));

  const prompt = `
    你是一个顶级的量化交易专家。以下是当前中国 A 股市场换手率最高、资金最活跃的股票列表数据 (JSON 格式):
    
    ${topStocksStr}

    任务：
    从中挑选 5 只你认为在未来 2 个交易日内，大概率能上涨超过 3% 的"超短线"金股。
    选择标准：
    1. 资金活跃度 (Turnover Rate) 高。
    2. 趋势向上 (Change Percent 为正但不过热，或者有突破迹象)。
    3. 结合你的知识库中对这些板块近期热点的理解。

    输出格式要求：
    返回一个纯 JSON 数组 (Array)，不要包含 Markdown。每个对象包含：
    - code: 股票代码
    - name: 股票名称
    - currentPrice: 当前价格 (string)
    - targetProfit: 预期收益 (e.g. ">3%" or "3-5%")
    - riskFactor: "HIGH" 或 "MEDIUM" (短线通常风险较高)
    - reason: 推荐理由，严格限制在 100 字以内，简明扼要地说明技术面或消息面逻辑。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "[]";
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const recommendations: ShortTermRecommendation[] = JSON.parse(cleanText);
    return recommendations.slice(0, 5); // Ensure exactly 5

  } catch (error) {
    console.error("Recommendation Generation Error:", error);
    throw new Error("AI 分析推荐失败，请稍后重试。");
  }
};
