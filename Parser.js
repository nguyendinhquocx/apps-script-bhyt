// Helper function to clean and normalize text
function normalizeVietnameseText(text) {
  if (!text) return '';
  
  return text.trim()
             .replace(/\s+/g, ' ') // Multiple spaces to single space
             .replace(/[""]/g, '"') // Normalize quotes
             .replace(/['']/g, "'"); // Normalize apostrophes
}/**
 * BHYT Data Parser - Text Parsing Functions
 * Replicates Power Query text splitting and extraction logic
 */

function parseThongTinField(thongTinText) {
  if (!thongTinText || thongTinText.trim() === '') {
    throw new Error('Trường thông tin trống');
  }
  
  try {
    const text = thongTinText.toString().trim();
    console.log('Parsing text length:', text.length);
    
    // Initialize result object
    const result = {
      bhyt: '',
      ho_va_ten: '',
      ngay_sinh: null,
      gioi_tinh: '',
      dia_chi: '',
      ngay_bat_dau: null,
      ngay_ket_thuc: null
    };
    
    // Extract Mã thẻ BHYT using regex
    const maTheMatch = text.match(/Mã thẻ:\s*([A-Z]{2}\d+)/i);
    if (maTheMatch) {
      const fullCode = maTheMatch[1];
      result.bhyt = fullCode.slice(-10); // Last 10 digits
    }
    
    // Extract Họ tên using regex  
    const hoTenMatch = text.match(/Họ tên:\s*([^,]+)/i);
    if (hoTenMatch) {
      result.ho_va_ten = hoTenMatch[1].trim();
    }
    
    // Extract Ngày sinh using flexible regex (support both full date and year only)
    let ngaySinhMatch = text.match(/Ngày sinh:\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (ngaySinhMatch) {
      result.ngay_sinh = parseVietnameseDate(ngaySinhMatch[1]);
    } else {
      // Try year-only format: "Năm sinh: YYYY"
      const namSinhMatch = text.match(/Năm sinh:\s*(\d{4})/i);
      if (namSinhMatch) {
        const year = namSinhMatch[1];
        result.ngay_sinh = parseVietnameseDate(`01/01/${year}`); // Default to Jan 1st
        console.log('Year-only birth date converted:', year, '->', result.ngay_sinh);
      }
    }
    
    // Extract Giới tính using regex
    const gioiTinhMatch = text.match(/Giới tính\s*:\s*(Nam|Nữ)/i);
    if (gioiTinhMatch) {
      result.gioi_tinh = gioiTinhMatch[1].trim();
    }
    
    // Extract Địa chỉ from ĐC: section và clean format
    const diaChiMatch = text.match(/ĐC:\s*([^;]+)/i);
    if (diaChiMatch) {
      let rawAddress = diaChiMatch[1].trim();
      // Clean address format - remove prefixes and convert to semicolon format
      result.dia_chi = cleanAddressFormat(rawAddress);
    }
    
    // Extract Hạn thẻ date range
    const hanTheMatch = text.match(/Hạn thẻ:\s*(\d{2}\/\d{2}\/\d{4})\s*-\s*(\d{2}\/\d{2}\/\d{4})/i);
    if (hanTheMatch) {
      result.ngay_bat_dau = parseVietnameseDate(hanTheMatch[1]);
      result.ngay_ket_thuc = parseVietnameseDate(hanTheMatch[2]);
    }
    
    // Validate critical fields
    if (!result.ho_va_ten) {
      console.warn('Could not extract họ tên from:', text.substring(0, 200));
    }
    
    if (!result.bhyt) {
      console.warn('Could not extract BHYT code from:', text.substring(0, 200));
    }
    
    console.log('Parse result:', {
      name: result.ho_va_ten,
      bhyt: result.bhyt,
      gender: result.gioi_tinh
    });
    
    return result;
    
  } catch (error) {
    console.error('Parse error for text:', thongTinText.substring(0, 200));
    console.error('Error details:', error);
    throw new Error('Lỗi parse: ' + error.message);
  }
}

function parseVietnameseDate(dateStr) {
  if (!dateStr || !dateStr.match(/\d{2}\/\d{2}\/\d{4}/)) {
    return null;
  }
  
  try {
    const [day, month, year] = dateStr.split('/').map(n => parseInt(n));
    
    // Validate date components
    if (year < 1900 || year > 2100) return null;
    if (month < 1 || month > 12) return null;
    if (day < 1 || day > 31) return null;
    
    return new Date(year, month - 1, day); // month is 0-indexed in JS
    
  } catch (error) {
    console.error('Date parsing error:', dateStr, error);
    return null;
  }
}

function extractAddress(addressSection) {
  if (!addressSection) return '';
  
  try {
    // Remove extra parentheses and clean up
    let cleanAddress = addressSection.replace(/^\(|\)$/g, '').trim();
    
    // Remove "ĐC:" prefix if present
    cleanAddress = cleanAddress.replace(/^ĐC:\s*/, '');
    
    // Split by semicolon to separate address parts
    const parts = cleanAddress.split(';').map(part => part.trim());
    
    if (parts.length >= 4) {
      // Format: street, ward, district, city
      return parts.slice(0, 4).join(', ');
    } else {
      // Return as-is if format is unexpected
      return cleanAddress;
    }
    
  } catch (error) {
    console.error('Address extraction error:', addressSection, error);
    return addressSection;
  }
}

function transformRecord(rawRecord, parsedInfo, addressMap) {
  try {
    console.log('Transforming record for:', parsedInfo.ho_va_ten);
    
    // Calculate thời hạn sử dụng
    const thoiHanSuDung = calculateThoiHanSuDung(
      rawRecord.trang_thai || rawRecord['trang thai'], 
      parsedInfo.ngay_ket_thuc,
      rawRecord.muc
    );
    
    // Convert address - handle safely
    let convertedAddress = parsedInfo.dia_chi;
    try {
      convertedAddress = convertAddress(parsedInfo.dia_chi, addressMap);
    } catch (addrError) {
      console.warn('Address conversion failed, using original:', addrError.message);
    }
    
    // Build output record with proper field mapping
    const result = {
      date: rawRecord.date,
      'trang thai': rawRecord.trang_thai === 'GH' ? 'Gia hạn thẻ' : 
                   rawRecord.trang_thai === 'MM' ? 'Tăng mới' : 
                   rawRecord['trang thai'] === 'GH' ? 'Gia hạn thẻ' :
                   rawRecord['trang thai'] === 'MM' ? 'Tăng mới' : 'Gia hạn thẻ',
      'ho va ten': parsedInfo.ho_va_ten || '',
      bhyt: parsedInfo.bhyt || '',
      'gioi tinh': parsedInfo.gioi_tinh || '',
      'ngay sinh': parsedInfo.ngay_sinh,
      'dia chi': convertedAddress || '',
      'thoi han su dung': thoiHanSuDung,
      muc: rawRecord.muc,
      'bien lai': rawRecord.bien_lai || rawRecord['bien lai'] || '',
      cccd: rawRecord.cccd || '',
      sdt: rawRecord.sdt || ''
    };
    
    console.log('Transform successful:', result['ho va ten']);
    return result;
    
  } catch (error) {
    console.error('Transform error:', error);
    console.error('Raw record:', rawRecord);
    console.error('Parsed info:', parsedInfo);
    throw new Error('Lỗi transform: ' + error.message);
  }
}

function calculateThoiHanSuDung(trangThai, ngayKetThuc, mucBaoHiem) {
  try {
    const cutoffDate = new Date('2025-05-03');
    
    if (trangThai === 'GH') { // Gia hạn thẻ
      if (ngayKetThuc && ngayKetThuc > cutoffDate) {
        // Add 1 day to end date
        return new Date(ngayKetThuc.getTime() + 24 * 60 * 60 * 1000);
      } else {
        return cutoffDate;
      }
    } else { // Mới (MM)
      // Add 1 month to cutoff date
      const newDate = new Date(cutoffDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    }
    
  } catch (error) {
    console.error('Date calculation error:', error);
    return new Date('2025-05-03'); // Fallback date
  }
}

// Test function for debugging parser
function testParser() {
  const testData = `Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797938929139, Họ tên: Trần Thị Ánh Tuyết, Ngày sinh: 02/11/1959, Giới tính : Nữ! (ĐC: 13 CÁCH MẠNG THÁNG 8, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 04/09/2024 - 03/09/2025; Thời điểm đủ 5 năm liên tục: 01/09/2027).`;
  
  try {
    const result = parseThongTinField(testData);
    console.log('Test parse result:', result);
    return result;
  } catch (error) {
    console.error('Test parse error:', error);
    return null;
  }
}

function cleanAddressFormat(rawAddress) {
  try {
    console.log('Cleaning address:', rawAddress);
    
    // Handle special nested city format first (Thủ Đức case)
    if (rawAddress.includes('Thành phố Thủ Đức, Thành phố Hồ Chí Minh')) {
      return cleanNestedCityFormat(rawAddress);
    }
    
    // Handle special formats with semicolons
    if (rawAddress.includes(';')) {
      return cleanSemicolonFormat(rawAddress);
    }
    
    // Split by comma and clean each part
    let parts = rawAddress.split(',').map(part => part.trim()).filter(part => part);
    
    if (parts.length < 3) {
      return rawAddress; // Return original if too few parts
    }
    
    // Smart deduplication and cleaning
    parts = smartAddressDeduplication(parts);
    
    // Extract and clean components
    const street = parts[0]; // Always keep first part as street
    const cleanedParts = parts.slice(1).map(part => cleanAddressPart(part));
    
    // Identify city (usually contains "Hồ Chí Minh", "Thủ Đức", etc.)
    let city = findCityPart(cleanedParts);
    
    // Remove city from cleanedParts to avoid duplication
    const nonCityParts = cleanedParts.filter(part => 
      !isCityPart(part) && part !== city
    );
    
    // Ensure we have city - default to "Hồ Chí Minh" if not found
    if (!city) {
      city = "Hồ Chí Minh";
    }
    
    // Build final address: street; ward; district; city
    let finalParts = [street];
    
    // Add ward and district (take up to 2 non-city parts)
    if (nonCityParts.length >= 2) {
      finalParts.push(nonCityParts[0], nonCityParts[1]);
    } else if (nonCityParts.length === 1) {
      finalParts.push(nonCityParts[0], ''); // Missing district
    }
    
    finalParts.push(city);
    
    const result = finalParts.join('; ');
    console.log('Address cleaned result:', result);
    return result;
    
  } catch (error) {
    console.error('Address cleaning error:', error);
    return rawAddress; // Safe fallback
  }
}

function cleanSemicolonFormat(address) {
  // Handle addresses that already use semicolons (like Thủ Đức format)
  const parts = address.split(/[;,]/).map(part => part.trim()).filter(part => part);
  
  const street = parts[0];
  const remainingParts = parts.slice(1).map(part => cleanAddressPart(part));
  
  // Analyze structure for nested hierarchy
  const structure = analyzeAddressStructure(remainingParts);
  
  // Build final address
  return buildFinalAddress(street, structure);
}

function cleanNestedCityFormat(rawAddress) {
  try {
    console.log('Cleaning nested city format:', rawAddress);
    
    // Split by comma to get parts
    const parts = rawAddress.split(',').map(part => part.trim()).filter(part => part);
    
    if (parts.length < 4) {
      console.warn('Expected at least 4 parts for nested city format, got:', parts.length);
      return rawAddress;
    }
    
    // Extract components
    const street = parts[0];
    
    // Ward: remove "Phường" prefix
    const wardPart = parts[1];
    const ward = wardPart.replace(/^Phường\s+/i, '').replace(/^Xã\s+/i, '').trim();
    
    // District: should be "Thành phố Thủ Đức" - keep as is for proper identification
    const districtPart = parts[2];
    let district = districtPart.trim();
    
    // City: should be "Thành phố Hồ Chí Minh" - extract just "Hồ Chí Minh"
    const cityPart = parts[3];
    const city = cityPart.replace(/^Thành phố\s+/i, '').replace(/^Tỉnh\s+/i, '').trim();
    
    // For nested city format, format as: street; ward; district; city
    const result = `${street}; ${ward}; ${district}; ${city}`;
    
    console.log('Nested city cleaned result:', result);
    return result;
    
  } catch (error) {
    console.error('Nested city cleaning error:', error);
    return rawAddress; // Safe fallback
  }
}

function smartAddressDeduplication(parts) {
  const uniqueParts = [];
  const seen = new Set();
  
  for (const part of parts) {
    const normalized = cleanAddressPart(part).toLowerCase();
    
    // Skip if we've seen this exact part before
    if (seen.has(normalized)) {
      console.log('Skipping duplicate part:', part);
      continue;
    }
    
    // Skip if this is a variant of something we've already seen
    let isDuplicate = false;
    for (const seenPart of seen) {
      if (areAddressPartsSimilar(normalized, seenPart)) {
        console.log('Skipping similar part:', part, 'vs', seenPart);
        isDuplicate = true;
        break;
      }
    }
    
    if (!isDuplicate) {
      uniqueParts.push(part);
      seen.add(normalized);
    }
  }
  
  return uniqueParts;
}

function areAddressPartsSimilar(part1, part2) {
  // Remove common prefixes for comparison
  const clean1 = part1.replace(/^(phường|xã|quận|huyện|thành phố|tỉnh)\s*/i, '');
  const clean2 = part2.replace(/^(phường|xã|quận|huyện|thành phố|tỉnh)\s*/i, '');
  
  return clean1 === clean2;
}

function cleanAddressPart(part) {
  if (!part) return '';
  
  return part.trim()
    .replace(/^(Phường|Xã)\s+/i, '')
    .replace(/^(Quận|Huyện)\s+/i, '')
    .replace(/^(Thành phố|Tỉnh)\s+/i, '')
    .replace(/^(PHƯỜNG|XÃ)\s+/i, '')
    .replace(/^(QUẬN|HUYỆN)\s+/i, '') 
    .replace(/^(THÀNH PHỐ|TỈNH)\s+/i, '')
    .trim();
}

function findCityPart(parts) {
  for (const part of parts) {
    if (isCityPart(part)) {
      return cleanAddressPart(part);
    }
  }
  return null;
}

function isCityPart(part) {
  const lowerPart = part.toLowerCase();
  return lowerPart.includes('hồ chí minh') ||
         lowerPart.includes('thủ đức') ||
         lowerPart.includes('thành phố') ||
         lowerPart.includes('tỉnh') ||
         lowerPart.includes('hcm');
}