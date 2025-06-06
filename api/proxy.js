// File: /api/proxy.js

export default async function handler(request, response) {
  // Mengizinkan permintaan dari domain Vercel Anda
  response.setHeader('Access-Control-Allow-Origin', `https://${request.headers.host}`);
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Menangani permintaan pre-flight OPTIONS dari browser
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Ambil endpoint target dan parameter dari query string
  const { endpoint, ...queryParams } = request.query;

  // Ambil API key rahasia dari Environment Variable di Vercel
  const apiKey = process.env.LULU_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ 
      msg: 'Server Error: API key tidak dikonfigurasi.', 
      status: 500 
    });
  }

  // Tambahkan API key ke parameter yang akan dikirim ke Lulustream
  queryParams.key = apiKey;

  const luluApiUrl = 'https://lulustream.com/api';
  const targetUrl = `${luluApiUrl}${endpoint}?${new URLSearchParams(queryParams).toString()}`;

  try {
    const apiResponse = await fetch(targetUrl);
    const data = await apiResponse.json();

    // Kirim kembali respons dari Lulustream ke browser
    response.status(200).json(data);
  } catch (error) {
    console.error('Proxy Error:', error);
    response.status(500).json({ 
      msg: `Server Proxy Error: ${error.message}`, 
      status: 500 
    });
  }
}