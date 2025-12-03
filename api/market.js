
export default async function handler(request, response) {
  // Fetch Top 30 active stocks
  const listUrl = `https://4.push2.eastmoney.com/api/qt/clist/get?pn=1&pz=30&po=1&np=1&ut=bd1d9ddb04089700cf9c27f6f7426281&fltt=2&invt=2&fid=f8&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f14,f2,f3,f8,f17`;

  try {
    const data = await fetch(listUrl).then(r => r.json());
    response.status(200).json(data);
  } catch (error) {
    console.error('Market Proxy Error:', error);
    response.status(500).json({ error: 'Failed to fetch market data' });
  }
}
