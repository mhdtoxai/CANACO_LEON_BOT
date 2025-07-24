const axios = require('axios');

async function shortenUrl(longUrl) {
  try {
    // Versión correcta para la API pública (GET con parámetro en URL)
    const response = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`
    );
    
    return response.data; // Devuelve directamente la URL acortada como string
  } catch (error) {
    console.error('Error al acortar URL:', error.message);
    return longUrl; // Devuelve la URL original como fallback
  }
}

module.exports = shortenUrl;