
import { GoogleGenAI } from "@google/genai";
import { StockAnalysis, SourceLink } from "../types";
import { fetchEastMoneyData } from "./eastMoneyService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
