
export default async function handler(request, response) {
  const { secid } = request.query;

  if (!secid) {
    return response.status(400).json({ error: 'Missing secid parameter' });
  }

  // 1. Spot Data URL
  const spotUrl = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43,f57,f58,f162,f167,f170,f116&invt=2&fltt=2&fid=f43&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048`;

  // 2. K-Line Data URL
  const klineUrl = `https://push2his.eastmoney.com/api/qt/stock/kline/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6&fields2=f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61&klt=101&fqt=1&end=20500101&lmt=30`;

  try {
    const [spotRes, klineRes] = await Promise.all([
      fetch(spotUrl).then(r => r.json()),
      fetch(klineUrl).then(r => r.json())
    ]);

    response.status(200).json({
      spot: spotRes,
      kline: klineRes
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    response.status(500).json({ error: 'Failed to fetch data from source' });
  }
}
