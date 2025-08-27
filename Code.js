/**
 * BHYT Data Processor - Main Processing Pipeline
 * Replaces Power Query workflow with Apps Script
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('BHYT Processor')
    .addItem('Xử Lý Dữ Liệu BHYT', 'processInsuranceData')
    .addSeparator()
    .addItem('Hướng Dẫn', 'showInstructions')
    .addToUi();
}

function processInsuranceData() {
  try {
    const ui = SpreadsheetApp.getUi();
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Show processing message
    ui.alert('Bắt đầu xử lý dữ liệu BHYT...');
    
    // Load data sources
    const rawData = loadRawDataFromSheet();
    const addressMappingData = loadAddressMappingData();
    
    console.log(`Loaded ${rawData.length} raw records`);
    console.log(`Loaded ${addressMappingData.length} address mappings`);
    
    const processedResults = [];
    const errors = [];
    
    // Process each record
    rawData.forEach((record, index) => {
      try {
        const parsedInfo = parseThongTinField(record.thong_tin);
        const transformedRecord = transformRecord(record, parsedInfo, addressMappingData);
        processedResults.push(transformedRecord);
        
        // Progress indicator every 100 records
        if ((index + 1) % 100 === 0) {
          console.log(`Processed ${index + 1} records`);
        }
        
      } catch (error) {
        console.error(`Error processing row ${index + 2}: ${error.message}`);
        errors.push({
          row: index + 2,
          error: error.message,
          original: record
        });
        
        // Create error record to maintain alignment
        const errorRecord = createErrorRecord(record, 'Lỗi chuyển đổi');
        processedResults.push(errorRecord);
      }
    });
    
    // Write results to new sheet
    writeProcessedData(processedResults);
    
    // Show summary
    const summary = `Xử lý hoàn thành!\n\n` +
                   `Tổng records: ${processedResults.length}\n` +
                   `Thành công: ${processedResults.length - errors.length}\n` +
                   `Lỗi: ${errors.length}`;
    
    if (errors.length > 0) {
      console.log('Processing errors:', errors);
    }
    
    ui.alert('Kết quả xử lý', summary, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('Main processing error:', error);
    SpreadsheetApp.getUi().alert('Lỗi xử lý', 
      'Có lỗi xảy ra: ' + error.message, 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function loadRawDataFromSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('rawdata tong');
    
    if (!sheet) {
      throw new Error('Không tìm thấy sheet "rawdata tong"');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    console.log('Headers found:', headers);
    
    // Convert to objects with normalized headers
    return rows.filter(row => row[1]) // Filter non-empty thong tin
               .map(row => {
                 const record = {};
                 headers.forEach((header, index) => {
                   // Normalize header names
                   let normalizedHeader = header.toString().trim();
                   if (normalizedHeader === 'thong tin') {
                     normalizedHeader = 'thong_tin';
                   } else if (normalizedHeader === 'trang thai') {
                     normalizedHeader = 'trang_thai';
                   } else if (normalizedHeader === 'bien lai') {
                     normalizedHeader = 'bien_lai';
                   } else if (normalizedHeader === 'gia tien') {
                     normalizedHeader = 'gia_tien';
                   }
                   record[normalizedHeader] = row[index];
                 });
                 return record;
               });
               
  } catch (error) {
    throw new Error('Lỗi đọc dữ liệu raw: ' + error.message);
  }
}

function loadAddressMappingData() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('xa phuong');
    
    if (!sheet) {
      throw new Error('Không tìm thấy sheet "xa phuong"');
    }

    const data = sheet.getDataRange().getValues();
    console.log(`Loaded ${data.length - 1} address mapping records`);
    
    // Return array of mapping objects for easier processing
    return data.slice(1).map(row => {
      const [tenTinh, tenPhuongXaMoi, tenQuanHuyenCu, xaPhuongTruocSapNhap] = row;
      
      return {
        tinh: tenTinh?.toString().trim() || '',
        phuong_xa_moi: tenPhuongXaMoi?.toString().trim() || '',
        quan_huyen_cu: tenQuanHuyenCu?.toString().trim() || '',
        xa_phuong_truoc_sap_nhap: xaPhuongTruocSapNhap?.toString().trim() || ''
      };
    }).filter(item => item.tinh && item.phuong_xa_moi && item.quan_huyen_cu);
    
  } catch (error) {
    console.error('Error loading address mapping:', error);
    throw new Error('Lỗi đọc dữ liệu mapping địa chỉ: ' + error.message);
  }
}

function parseOldAddress(oldAddress) {
  /**
   * Parse địa chỉ cũ format: "13 CÁCH MẠNG THÁNG 8; Bến Thành; 1; Hồ Chí Minh"
   * Return: {street, ward, district, city}
   */
  try {
    console.log('Parsing old address:', oldAddress);
    
    if (!oldAddress || typeof oldAddress !== 'string') {
      return null;
    }
    
    const parts = oldAddress.split(';').map(part => part.trim()).filter(part => part);
    
    if (parts.length < 3) {
      console.warn('Address has too few parts:', parts.length);
      return null;
    }
    
    const result = {
      street: parts[0] || '',
      ward: parts[1] || '',
      district: parts[2] || '',
      city: parts[3] || 'Hồ Chí Minh'
    };
    
    // Normalize district - add "Quận" prefix if just number
    if (result.district && /^\d+$/.test(result.district)) {
      result.district = `Quận ${result.district}`;
    }
    
    console.log('Parsed address components:', result);
    return result;
    
  } catch (error) {
    console.error('Error parsing old address:', error);
    return null;
  }
}

function findNewWardName(addressComponents, mappingData) {
  /**
   * Tìm tên phường mới dựa trên mapping data
   * Input: {street, ward, district, city}, mappingData array
   * Return: tên phường mới hoặc null
   */
  try {
    if (!addressComponents || !mappingData) {
      return null;
    }
    
    const { ward, district } = addressComponents;
    console.log(`Looking up: ward="${ward}", district="${district}"`);
    
    // Tìm trong mapping data
    for (const mapping of mappingData) {
      // Check if district matches (cần chuẩn hóa tên quận/huyện)
      const normalizedMappingDistrict = mapping.quan_huyen_cu.replace(/^(Quận|Huyện|Thành phố)\s+/i, '').trim();
      const normalizedCurrentDistrict = district.replace(/^(Quận|Huyện|Thành phố)\s+/i, '').trim();
      
      if (normalizedMappingDistrict !== normalizedCurrentDistrict) {
        continue;
      }
      
      // Check if ward is in the old ward list
      const oldWards = mapping.xa_phuong_truoc_sap_nhap.split(',').map(w => w.trim());
      
      // Try multiple matching patterns for ward
      let wardFound = false;
      
      for (const oldWard of oldWards) {
        const cleanOldWard = oldWard.replace(/^(Phường|Xã)\s+/i, '').trim();
        const cleanCurrentWard = ward.replace(/^(Phường|Xã)\s+/i, '').trim();
        
        // Pattern 1: Exact match
        if (cleanOldWard === cleanCurrentWard) {
          wardFound = true;
          break;
        }
        
        // Pattern 2: Number matching (handle "03" vs "3", "01" vs "1")
        if (/^\d+$/.test(cleanCurrentWard) && /^\d+$/.test(cleanOldWard)) {
          const currentNum = parseInt(cleanCurrentWard, 10);
          const oldNum = parseInt(cleanOldWard, 10);
          if (currentNum === oldNum) {
            wardFound = true;
            break;
          }
        }
        
        // Pattern 3: With "Phường" prefix
        const wardWithPrefix = `Phường ${cleanCurrentWard}`;
        if (oldWard.trim() === wardWithPrefix) {
          wardFound = true;
          break;
        }
        
        // Pattern 4: Number with "Phường" prefix (handle "Phường 3" vs "03")
        if (/^\d+$/.test(cleanCurrentWard)) {
          const expectedWardName = `Phường ${parseInt(cleanCurrentWard, 10)}`;
          if (oldWard.trim() === expectedWardName) {
            wardFound = true;
            break;
          }
        }
      }
      
      if (wardFound) {
        console.log(`Found mapping: ${ward} -> ${mapping.phuong_xa_moi}`);
        return mapping.phuong_xa_moi;
      }
    }
    
    console.log(`No mapping found for ward="${ward}", district="${district}"`);
    return null;
    
  } catch (error) {
    console.error('Error finding new ward name:', error);
    return null;
  }
}

function mapOldAddressToNew(oldAddress, mappingData) {
  /**
   * Chuyển đổi địa chỉ cũ sang địa chỉ mới sau sáp nhập
   * Input: "13 CÁCH MẠNG THÁNG 8; Bến Thành; 1; Hồ Chí Minh"
   * Output: "13 CÁCH MẠNG THÁNG 8; Bến Thành; Hồ Chí Minh"
   */
  try {
    console.log('Mapping old address to new:', oldAddress);
    
    if (!oldAddress || !mappingData) {
      return oldAddress; // Fallback to original
    }
    
    // Parse address components
    const components = parseOldAddress(oldAddress);
    if (!components) {
      return oldAddress;
    }
    
    // Find new ward name
    const newWardName = findNewWardName(components, mappingData);
    
    if (newWardName) {
      // Build new address: street; new_ward; city (bỏ cấp quận)
      const newAddress = `${components.street}; ${newWardName}; ${components.city}`;
      console.log(`Address mapped: ${oldAddress} -> ${newAddress}`);
      return newAddress;
    } else {
      // No mapping found, return original
      console.log('No mapping found, returning original address');
      return oldAddress;
    }
    
  } catch (error) {
    console.error('Error mapping address:', error);
    return oldAddress; // Safe fallback
  }
}

function writeProcessedData(processedData) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Create or get processed data sheet
    let outputSheet = spreadsheet.getSheetByName('processed_data');
    if (!outputSheet) {
      outputSheet = spreadsheet.insertSheet('processed_data');
    } else {
      outputSheet.clear(); // Clear existing data
    }
    
    if (processedData.length === 0) {
      throw new Error('Không có dữ liệu để ghi');
    }
    
    // Prepare headers and data
    const headers = [
      'date', 'trang thai', 'ho va ten', 'bhyt', 'gioi tinh', 
      'ngay sinh', 'dia chi', 'thoi han su dung', 'muc', 
      'bien lai', 'cccd', 'sdt', 'dia chi sau sap nhap'
    ];
    
    const outputData = [headers];
    
    processedData.forEach(record => {
      const row = headers.map(header => record[header] || '');
      outputData.push(row);
    });
    
    // Write data in batch
    const range = outputSheet.getRange(1, 1, outputData.length, headers.length);
    range.setValues(outputData);
    
    // Format headers
    outputSheet.getRange(1, 1, 1, headers.length)
             .setBackground('#4285F4')
             .setFontColor('white')
             .setFontWeight('bold');
    
    // Auto-resize columns
    outputSheet.autoResizeColumns(1, headers.length);
    
    console.log(`Written ${processedData.length} records to processed_data sheet`);
    
  } catch (error) {
    throw new Error('Lỗi ghi dữ liệu: ' + error.message);
  }
}

function createErrorRecord(originalRecord, errorMessage) {
  return {
    date: originalRecord.date || '',
    'trang thai': errorMessage,
    'ho va ten': errorMessage,
    bhyt: '',
    'gioi tinh': '',
    'ngay sinh': '',
    'dia chi': '',
    'thoi han su dung': '',
    muc: originalRecord.muc || '',
    'bien lai': originalRecord.bien_lai || originalRecord['bien lai'] || '',
    cccd: originalRecord.cccd || '',
    sdt: originalRecord.sdt || '',
    'dia chi sau sap nhap': '' // Thêm cột mới
  };
}

function showInstructions() {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
      <h2 style="color: #1a73e8;">🏥 Hướng Dẫn Xử Lý Dữ Liệu BHYT</h2>
      
      <h3>📋 Yêu Cầu:</h3>
      <ul>
        <li><strong>Sheet 'rawdata tong':</strong> Chứa dữ liệu đầu vào với cột "thong tin"</li>
        <li><strong>Sheet 'xa phuong':</strong> Chứa mapping địa chỉ mới</li>
      </ul>
      
      <h3>🔧 Cách Sử Dụng:</h3>
      <ol>
        <li>Đảm bảo dữ liệu đã được nhập vào sheet 'rawdata tong'</li>
        <li>Click menu "🏥 BHYT Processor" → "📊 Xử Lý Dữ Liệu BHYT"</li>
        <li>Chờ processing hoàn thành (có thể mất vài phút)</li>
        <li>Kết quả sẽ xuất hiện trong sheet 'processed_data'</li>
      </ol>
      
      <h3>⚠️ Lưu Ý:</h3>
      <ul>
        <li>Records có lỗi sẽ hiển thị "Lỗi chuyển đổi"</li>
        <li>Kiểm tra console log để xem chi tiết lỗi</li>
        <li>Backup dữ liệu trước khi chạy</li>
      </ul>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        💡 Tip: Sử dụng Ctrl+Shift+J để mở console và xem logs chi tiết
      </p>
    </div>
  `;
  
  const htmlOutput = HtmlService.createHtml(html)
    .setWidth(500)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Hướng Dẫn Sử Dụng');
}