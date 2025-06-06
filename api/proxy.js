// File: /api/proxy.js

// Menggunakan sintaks module.exports untuk kompatibilitas yang lebih baik dengan Vercel
module.exports = async (request, response) => {
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
    
    // Ambil respons sebagai teks terlebih dahulu
    const responseText = await apiResponse.text();

    // Periksa apakah responsnya OK sebelum mencoba parsing
    if (!apiResponse.ok) {
        console.error(`Lulustream API Error (Status: ${apiResponse.status}):`, responseText);
        return response.status(apiResponse.status).json({ 
            msg: `Error dari Lulustream: ${responseText || apiResponse.statusText}`, 
            status: apiResponse.status 
        });
    }

    try {
        // Coba parsing teks sebagai JSON
        const data = JSON.parse(responseText);
        return response.status(200).json(data);
    } catch (jsonError) {
        // Jika parsing gagal, berarti respons bukan JSON (kemungkinan halaman error HTML)
        console.error('Proxy JSON Parse Error:', jsonError);
        console.error('Response text that failed to parse:', responseText);
        return response.status(500).json({
            msg: 'Gagal mem-parsing respons dari server. Server mungkin mengembalikan HTML atau teks biasa.',
            status: 500
        });
    }

  } catch (error) {
    // Menangani error jaringan atau fetch itu sendiri gagal
    console.error('Proxy Fetch Error:', error);
    response.status(500).json({ 
      msg: `Server Proxy Error: ${error.message}`, 
      status: 500 
    });
  }
};
