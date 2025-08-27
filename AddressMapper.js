/**
 * BHYT Address Mapper - Address Conversion Logic
 * Handles mapping from old administrative structure to new merged structure
 */

function convertAddress(oldAddress, addressMap) {
  if (!oldAddress || oldAddress.trim() === '') {
    return '';
  }
  
  try {
    console.log('Converting address:', oldAddress);
    
    // Clean and normalize address
    let cleanAddress = normalizeAddress(oldAddress);
    
    // Parse address components
    const addressParts = parseAddressComponents(cleanAddress);
    
    if (!addressParts) {
      console.log('Could not parse address components, returning original');
      return oldAddress;
    }
    
    // Look up new administrative structure
    const newMapping = lookupNewAddress(addressParts, addressMap);
    
    if (newMapping) {
      // Construct new address format
      const newAddress = constructNewAddress(addressParts, newMapping);
      console.log('Converted:', oldAddress, '->', newAddress);
      return newAddress;
    } else {
      console.log('No mapping found, returning original address');
      return oldAddress;
    }
    
  } catch (error) {
    console.error('Address conversion error:', error, 'for address:', oldAddress);
    return oldAddress; // Fallback to original
  }
}

function normalizeAddress(address) {
  return address
    .replace(/,\s*Phường\s*/g, ', ')  // Remove "Phường" prefix
    .replace(/,\s*Xã\s*/g, ', ')     // Remove "Xã" prefix  
    .replace(/,\s*Quận\s*/g, ', ')   // Remove "Quận" prefix
    .replace(/,\s*Huyện\s*/g, ', ')  // Remove "Huyện" prefix
    .replace(/,\s*Thành phố\s*/g, ', ') // Remove "Thành phố" prefix
    .replace(/\s+/g, ' ')            // Multiple spaces to single
    .trim();
}

function parseAddressComponents(address) {
  try {
    // Split by comma and clean each part
    const parts = address.split(',').map(part => part.trim()).filter(part => part);
    
    if (parts.length < 3) {
      return null; // Need at least street, ward, district
    }
    
    // Detect nested city structure (Thủ Đức case)
    if (isNestedCityAddress(address, parts)) {
      return parseNestedCityAddress(parts);
    }
    
    // Typical format: "Street, Ward, District, City"
    const streetAddress = parts[0];
    const ward = parts[1];
    const district = parts[2];  
    const city = parts[3] || 'Thành phố Hồ Chí Minh'; // Default city
    
    return {
      street: streetAddress,
      ward: ward,
      district: district,
      city: city
    };
    
  } catch (error) {
    console.error('Address parsing error:', error);
    return null;
  }
}

function isNestedCityAddress(address, parts) {
  // Detect patterns like: "..., Thành phố Thủ Đức, Thành phố Hồ Chí Minh"
  if (address.includes("Thành phố Thủ Đức, Thành phố Hồ Chí Minh")) {
    return true;
  }
  
  // More general detection for nested city structure
  const cityCount = parts.filter(part => 
    part.toLowerCase().includes('thành phố') ||
    part.toLowerCase().includes('tỉnh')
  ).length;
  
  return cityCount >= 2;
}

function parseNestedCityAddress(parts) {
  try {
    console.log('Parsing nested city address:', parts);
    
    // Expected format: ["Street", "Phường Ward", "Thành phố District", "Thành phố City"]
    const streetAddress = parts[0];
    
    // Extract ward (remove "Phường" prefix if present)
    const wardPart = parts[1] || '';
    const ward = wardPart.replace(/^Phường\s+/i, '').replace(/^Xã\s+/i, '').trim();
    
    // For nested city, the "district" is actually the inner city (like "Thành phố Thủ Đức")
    const districtPart = parts[2] || '';
    let district = districtPart.replace(/^Thành phố\s+/i, '').replace(/^Tỉnh\s+/i, '').trim();
    
    // If district is "Thủ Đức", keep it as "Thành phố Thủ Đức" for proper mapping
    if (district.toLowerCase() === 'thủ đức') {
      district = 'Thành phố Thủ Đức';
    }
    
    // The outer city
    const cityPart = parts[3] || 'Thành phố Hồ Chí Minh';
    const city = cityPart.replace(/^Thành phố\s+/i, '').replace(/^Tỉnh\s+/i, '').trim();
    
    const result = {
      street: streetAddress,
      ward: ward,
      district: district,
      city: city
    };
    
    console.log('Nested city parse result:', result);
    return result;
    
  } catch (error) {
    console.error('Nested city parsing error:', error);
    return null;
  }
}

function lookupNewAddress(addressParts, addressMap) {
  try {
    const { ward, district, city } = addressParts;
    
    // Try multiple lookup keys for flexibility
    const lookupKeys = [
      `${ward}_${district}_${city}`,
      `Phường ${ward}_${district}_${city}`,
      `Xã ${ward}_${district}_${city}`,
      `${ward}_Quận ${district}_${city}`,
      `${ward}_Huyện ${district}_${city}`,
      `Phường ${ward}_Quận ${district}_${city}`,
      `Xã ${ward}_Huyện ${district}_${city}`
    ];
    
    for (const key of lookupKeys) {
      if (addressMap[key]) {
        console.log('Found mapping with key:', key);
        return addressMap[key];
      }
    }
    
    // Try partial matching for ward numbers
    if (/^\d+$/.test(ward)) { // If ward is just a number
      for (const key of Object.keys(addressMap)) {
        if (key.includes(`Phường ${ward}_${district}_${city}`)) {
          console.log('Found mapping with partial key:', key);
          return addressMap[key];
        }
      }
    }
    
    console.log('No mapping found for:', lookupKeys[0]);
    return null;
    
  } catch (error) {
    console.error('Address lookup error:', error);
    return null;
  }
}

function constructNewAddress(originalParts, newMapping) {
  try {
    const { street } = originalParts;
    const { phuong_moi, tinh } = newMapping;
    
    // New format: "Street; New Ward; City"
    // Remove district level as per new administrative structure
    return `${street}; ${phuong_moi}; ${tinh}`;
    
  } catch (error) {
    console.error('Address construction error:', error);
    return `${originalParts.street}; ${originalParts.ward}; ${originalParts.city}`;
  }
}

// Helper function to test address conversion
function testAddressConversion() {
  const testAddresses = [
    "736/170 lê đức thọ, 15, Quận Gò Vấp, Thành phố Hồ Chí Minh",
    "13 CÁCH MẠNG THÁNG 8, Bến Thành, Quận 1, Thành phố Hồ Chí Minh", 
    "72/21 đường số 2, Phường 03, Quận Gò Vấp, Thành phố Hồ Chí Minh"
  ];
  
  const addressMap = loadAddressMappingData();
  
  testAddresses.forEach(address => {
    console.log('Testing:', address);
    const converted = convertAddress(address, addressMap);
    console.log('Result:', converted);
    console.log('---');
  });
}

// Batch address conversion for performance
function convertAddressBatch(addresses, addressMap) {
  const results = [];
  const errors = [];
  
  addresses.forEach((address, index) => {
    try {
      const converted = convertAddress(address, addressMap);
      results.push(converted);
    } catch (error) {
      console.error(`Batch conversion error at index ${index}:`, error);
      results.push(address); // Fallback to original
      errors.push({ index, error: error.message });
    }
  });
  
  if (errors.length > 0) {
    console.log('Batch conversion errors:', errors);
  }
  
  return results;
}

// Function to analyze address mapping coverage
function analyzeAddressMappingCoverage(rawAddresses, addressMap) {
  const stats = {
    total: rawAddresses.length,
    mapped: 0,
    unmapped: 0,
    unmappedAddresses: []
  };
  
  rawAddresses.forEach(address => {
    const parts = parseAddressComponents(normalizeAddress(address));
    if (parts) {
      const mapping = lookupNewAddress(parts, addressMap);
      if (mapping) {
        stats.mapped++;
      } else {
        stats.unmapped++;
        stats.unmappedAddresses.push(address);
      }
    } else {
      stats.unmapped++;
      stats.unmappedAddresses.push(address);
    }
  });
  
  console.log('Address mapping coverage:', stats);
  return stats;
}

// Handle special cases for HCM administrative changes
function handleSpecialCases(addressParts) {
  const { ward, district, city } = addressParts;
  
  // Handle Thu Duc city merger
  if (district.includes('Thủ Đức') || 
      ['Quận 2', 'Quận 9', 'Quận Thủ Đức'].includes(district)) {
    return {
      ...addressParts,
      city: 'Thành phố Thủ Đức',
      district: district
    };
  }
  
  // Handle Bình Dương merger cases
  if (city.includes('Bình Dương')) {
    return {
      ...addressParts,
      city: 'Thành phố Hồ Chí Minh' // Merged into HCM
    };
  }
  
  // Handle Ba Ria - Vung Tau cases
  if (city.includes('Bà Rịa') || city.includes('Vũng Tàu')) {
    return {
      ...addressParts,
      city: 'Thành phố Hồ Chí Minh' // Merged into HCM
    };
  }
  
  return addressParts; // No special handling needed
}

// Enhanced mapping with fallback strategies
function findBestAddressMatch(addressParts, addressMap) {
  // Strategy 1: Exact match
  let mapping = lookupNewAddress(addressParts, addressMap);
  if (mapping) return mapping;
  
  // Strategy 2: Try with special case handling
  const specialCaseAddress = handleSpecialCases(addressParts);
  mapping = lookupNewAddress(specialCaseAddress, addressMap);
  if (mapping) return mapping;
  
  // Strategy 3: Fuzzy matching for common variations
  mapping = fuzzyAddressMatch(addressParts, addressMap);
  if (mapping) return mapping;
  
  return null;
}

function fuzzyAddressMatch(addressParts, addressMap) {
  const { ward, district } = addressParts;
  
  // Try different ward number formats
  if (/^\d+$/.test(ward)) {
    const variations = [
      `Phường ${ward}`,
      `P${ward}`,
      `P.${ward}`,
      ward.padStart(2, '0') // 01, 02, etc.
    ];
    
    for (const variation of variations) {
      const testParts = { ...addressParts, ward: variation };
      const mapping = lookupNewAddress(testParts, addressMap);
      if (mapping) return mapping;
    }
  }
  
  return null;
}