// utils/geocoding.js
export const getAddressFromCoords = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    if (data && data.address) {
      const addr = data.address;
      let addressParts = [];
      
      if (addr.road) addressParts.push(addr.road);
      if (addr.house_number) addressParts.push(addr.house_number);
      if (addr.suburb && !addressParts.includes(addr.suburb)) addressParts.push(addr.suburb);
      if (addr.city || addr.town || addr.village) {
        const city = addr.city || addr.town || addr.village;
        if (!addressParts.includes(city)) addressParts.push(city);
      }
      
      const finalAddress = addressParts.join(', ');
      return finalAddress;
    }
    
    return "Ubicación seleccionada";
  } catch (error) {
    console.error("❌ Error in getAddressFromCoords:", error);
    return `📍 ${lat?.toFixed(4) || 'N/A'}, ${lng?.toFixed(4) || 'N/A'}`;
  }
};