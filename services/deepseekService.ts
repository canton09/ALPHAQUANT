
import { StockAnalysis, ShortTermRecommendation } from "../types";
import { fetchEastMoneyData, fetchActiveStocks } from "./eastMoneyService";

// Helper to strip Markdown code blocks if present
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
};

export const analyzeStock = async (stockCode: string, apiKey: string): Promise<StockAnalysis> => {
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

  const systemPrompt = `
    你是一个专业的中国股市金融分析师 (AlphaQuant AI)。
    你的任务是根据提供的实时市场数据（如有）和你自身的金融知识，对指定股票进行分析。
    请务必返回标准的 JSON 格式数据。
  `;

  const userPrompt = `
    分析股票代码: ${stockCode}。
    
    ${apiDataString}

    任务：
    1. 结合 API 数据(权重高)和你对该公司的了解(行业地位、近期新闻)。
    2. 总结所有信息，并给出具体的投资建议。
    3. 必须输出且仅输出以下 JSON 格式，不要包含其他文字：
    {
      "stockName": "String",
      "currentPrice": "String",
      "summary": "String (Max 200 words)",
      "buyAdvice": { "price": "String", "timing": "String" },
      "sellAdvice": { "price": "String", "timing": "String" },
      "trend": "BULLISH | BEARISH | NEUTRAL",
      "riskLevel": "HIGH | MEDIUM | LOW"
    }
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 1.1 // High temperature for creative analysis but structured output
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `DeepSeek API Error: ${response.status}`);
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content || "";
    
    if (!text) throw new Error("Empty response from DeepSeek");

    const cleanText = cleanJsonString(text);
    const data = JSON.parse(cleanText);

    const sources = [
        { title: "DeepSeek V3 (AI Analysis)", url: "https://chat.deepseek.com/" }
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
  const activeStocks = await fetchActiveStocks();
  
  if (activeStocks.length === 0) {
    throw new Error("无法获取市场行情数据，无法进行推荐分析。");
  }

  const topStocksStr = JSON.stringify(activeStocks.slice(0, 20));

  const systemPrompt = `你是一个顶级的量化交易专家。请以 JSON 格式输出分析结果。`;
  
  const userPrompt = `
    任务：从给定的活跃股票列表中挑选 5 只你认为在未来 2 个交易日内，大概率能上涨超过 3% 的"超短线"金股。
    
    选择标准：
    1. 资金活跃度 (Turnover Rate) 高。
    2. 趋势向上。
    3. 结合板块热点。

    以下是当前中国 A 股市场换手率最高、资金最活跃的股票列表数据:
    ${topStocksStr}

    请输出且仅输出 JSON 数组格式，不要包含 Markdown 标记：
    [
      {
        "code": "String",
        "name": "String",
        "currentPrice": "String",
        "targetProfit": "String (e.g. >3%)",
        "reason": "String (简短理由)",
        "riskFactor": "HIGH | MEDIUM"
      }
    ]
  `;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 1.0
        })
      });
  
      if (!response.ok) {
          throw new Error(`DeepSeek API Error: ${response.status}`);
      }
  
      const json = await response.json();
      const text = json.choices?.[0]?.message?.content || "";

      if (!text) throw new Error("No response from DeepSeek");

      const cleanText = cleanJsonString(text);
      const recommendations = JSON.parse(cleanText);
      return recommendations.slice(0, 5);

  } catch (error) {
    console.error("Recommendation Generation Error:", error);
    throw new Error("AI 分析推荐失败，请检查 API Key 或稍后重试。");
  }
};
