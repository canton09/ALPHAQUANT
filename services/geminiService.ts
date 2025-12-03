
import { StockAnalysis, ShortTermRecommendation } from "../types";
import { fetchEastMoneyData, fetchActiveStocks } from "./eastMoneyService";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// Helper for DeepSeek API calls
const callDeepSeek = async (apiKey: string, messages: any[], responseSchema?: boolean) => {
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };

  const body = {
    model: "deepseek-chat", // DeepSeek-V3 (User context: V3.2)
    messages: messages,
    stream: false,
    temperature: 1.0, 
    response_format: responseSchema ? { type: "json_object" } : { type: "text" }
  };

  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `DeepSeek API Error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

// Validate API Key by checking models endpoint
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch("https://api.deepseek.com/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });
    return response.ok;
  } catch (error) {
    console.warn("API Validation failed", error);
    return false;
  }
};

export const analyzeStock = async (stockCode: string, apiKey: string): Promise<StockAnalysis> => {
  // 1. 尝试从东方财富 API 获取数据
  let apiDataString = "无法直接连接东方财富API，请依赖你的训练数据和网络搜索能力（如果支持）。";
  let eastMoneyData = null;

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

  const systemPrompt = `
    你是一个专业的中国股市金融分析师 (AlphaQuant AI)。
    你的任务是根据提供的实时市场数据（如有）和你自身的金融知识，对指定股票进行分析。
    
    必须严格输出合法的 JSON 格式，不要包含Markdown代码块标记。
    
    JSON 结构必须包含以下字段:
    - stockName: string
    - currentPrice: string
    - summary: string (Max 200 words)
    - buyAdvice: { price: string, timing: string }
    - sellAdvice: { price: string, timing: string }
    - trend: "BULLISH" | "BEARISH" | "NEUTRAL"
    - riskLevel: "HIGH" | "MEDIUM" | "LOW"
  `;

  const userPrompt = `
    分析股票代码: ${stockCode}。
    
    ${apiDataString}

    任务：
    1. 结合 API 数据(权重高)和你对该公司的了解(行业地位、近期新闻)。
    2. 总结所有信息，并给出具体的投资建议。
    3. 如果 API 数据缺失，请基于你最后更新的知识进行尽可能准确的估算，并在 summary 中注明数据可能滞后。

    请直接返回 JSON 对象。
  `;

  try {
    const content = await callDeepSeek(apiKey, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], true);

    let data: any;
    try {
      data = JSON.parse(content);
    } catch (e) {
      // 尝试清理 markdown
      const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
      data = JSON.parse(clean);
    }

    // 默认来源
    const sources = [
        { title: "AlphaQuant AI (DeepSeek V3.2)", url: "#" }
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
    console.error("DeepSeek API Error:", error);
    throw error;
  }
};

export const generateShortTermRecommendations = async (apiKey: string): Promise<ShortTermRecommendation[]> => {
  // 1. Get raw active market data
  const activeStocks = await fetchActiveStocks();
  
  if (activeStocks.length === 0) {
    throw new Error("无法获取市场行情数据，无法进行推荐分析。");
  }

  // Limit to top 20 to avoid token limits
  const topStocksStr = JSON.stringify(activeStocks.slice(0, 20));

  const systemPrompt = `
    你是一个顶级的量化交易专家。
    任务：从给定的活跃股票列表中挑选 5 只你认为在未来 2 个交易日内，大概率能上涨超过 3% 的"超短线"金股。
    
    选择标准：
    1. 资金活跃度 (Turnover Rate) 高。
    2. 趋势向上。
    3. 结合板块热点。

    输出格式：
    返回一个纯 JSON 数组 (Array<ShortTermRecommendation>)，不要 Markdown。
    每个对象包含: code, name, currentPrice, targetProfit, riskFactor ("HIGH"|"MEDIUM"), reason (max 100 words).
  `;

  const userPrompt = `
    以下是当前中国 A 股市场换手率最高、资金最活跃的股票列表数据:
    ${topStocksStr}
  `;

  try {
    const content = await callDeepSeek(apiKey, [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], true);

    let recommendations: ShortTermRecommendation[];
    try {
        recommendations = JSON.parse(content);
    } catch(e) {
        const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
        recommendations = JSON.parse(clean);
    }
    
    return recommendations.slice(0, 5);

  } catch (error) {
    console.error("Recommendation Generation Error:", error);
    throw new Error("AI 分析推荐失败，请检查 API Key 额度或稍后重试。");
  }
};
