// utils/geocoding.js
const getAddressFromCoords = async (lat, lng, retries = 2) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;

  const fetchWithTimeout = (url, timeout = 10000) =>
    Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out')), timeout)
      ),
    ]);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      const addr = data.address;
      if (!addr) return "Ubicación seleccionada";

      const parts = [
        addr.road,
        addr.house_number,
        addr.suburb,
        addr.city || addr.town || addr.village,
      ].filter(Boolean);

      return parts.join(', ');
    } catch (error) {
      if (attempt < retries) {
        console.warn(`Intento ${attempt + 1} fallido, reintentando...`);
        await new Promise(r => setTimeout(r, 1000)); // espera 1s antes de reintentar
      } else {
        return `📍 ${lat?.toFixed(4) || 'N/A'}, ${lng?.toFixed(4) || 'N/A'}`;
      }
    }
  }
};

export default getAddressFromCoords;
