// File: /api/proxy.js

try {
  const apiResponse = await fetch(targetUrl);
  
  // 1. Baca respons sebagai TEKS biasa terlebih dahulu, bukan JSON
  const responseText = await apiResponse.text();

  // 2. Periksa apakah status HTTP dari server Lulustream adalah error (misal: 404, 502)
  if (!apiResponse.ok) {
      console.error(`Lulustream API Error (Status: ${apiResponse.status}):`, responseText);
      return response.status(apiResponse.status).json({ 
          msg: `Error dari Lulustream: ${responseText || apiResponse.statusText}`, 
          status: apiResponse.status 
      });
  }

  // 3. Setelah yakin responsnya OK, baru coba parsing sebagai JSON di dalam blok try-catch sendiri
  try {
      const data = JSON.parse(responseText);
      return response.status(200).json(data);
  } catch (jsonError) {
      // 4. Jika parsing gagal, kirim pesan error yang spesifik
      console.error('Proxy JSON Parse Error:', jsonError);
      console.error('Response text that failed to parse:', responseText);
      return response.status(500).json({
          msg: 'Gagal mem-parsing respons dari server. Server mungkin mengembalikan HTML atau teks biasa.',
          status: 500
      });
  }

} catch (error) {
  // Blok ini sekarang hanya menangani error jaringan (misalnya, tidak bisa terhubung ke server)
  console.error('Proxy Fetch Error:', error);
  response.status(500).json({ 
    msg: `Server Proxy Error: ${error.message}`, 
    status: 500 
  });
}
