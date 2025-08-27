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
    const addressMap = loadAddressMappingData();
    
    console.log(`Loaded ${rawData.length} raw records`);
    console.log(`Loaded ${Object.keys(addressMap).length} address mappings`);
    
    const processedResults = [];
    const errors = [];
    
    // Process each record
    rawData.forEach((record, index) => {
      try {
        const parsedInfo = parseThongTinField(record.thong_tin);
        const transformedRecord = transformRecord(record, parsedInfo, addressMap);
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
                   `📊 Tổng records: ${processedResults.length}\n` +
                   `✅ Thành công: ${processedResults.length - errors.length}\n` +
                   `❌ Lỗi: ${errors.length}`;
    
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
    const addressMap = {};
    
    // Skip header row, build lookup map
    data.slice(1).forEach(row => {
      const [tenTinh, tenPhuongXaMoi, tenQuanHuyenCu, xaPhuongTruocSapNhap] = row;
      
      if (tenTinh && tenPhuongXaMoi && tenQuanHuyenCu && xaPhuongTruocSapNhap) {
        // Handle multiple old wards mapping to new ward
        const oldWards = xaPhuongTruocSapNhap.toString().split(',');
        
        oldWards.forEach(oldWard => {
          const cleanOldWard = oldWard.trim();
          const key = `${cleanOldWard}_${tenQuanHuyenCu}_${tenTinh}`;
          
          addressMap[key] = {
            phuong_moi: tenPhuongXaMoi,
            quan_moi: '', // Removed district level in new structure
            tinh: tenTinh
          };
        });
      }
    });
    
    return addressMap;
    
  } catch (error) {
    throw new Error('Lỗi đọc dữ liệu mapping địa chỉ: ' + error.message);
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
      'bien lai', 'cccd', 'sdt'
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
    sdt: originalRecord.sdt || ''
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