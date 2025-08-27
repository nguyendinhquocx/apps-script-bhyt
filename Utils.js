/**
 * BHYT Utils - Helper Functions and Testing
 * Utility functions for debugging and performance optimization
 */

// Comprehensive testing function
function runFullSystemTest() {
  console.log('Starting BHYT Data Processor system test...');
  
  try {
    // Test 1: Data loading
    console.log('\n=== Test 1: Data Loading ===');
    testDataLoading();
    
    // Test 2: Text parsing
    console.log('\n=== Test 2: Text Parsing ===');
    testTextParsing();
    
    // Test 3: Address conversion
    console.log('\n=== Test 3: Address Conversion ===');
    testAddressConversion();
    
    // Test 4: Address mapping (NEW)
    console.log('\n=== Test 4: Address Mapping ===');
    testAddressMapping();
    
    // Test 5: Full pipeline with sample data
    console.log('\n=== Test 5: Full Pipeline ===');
    testFullPipeline();
    
    console.log('\n✅ All tests completed successfully!');
    SpreadsheetApp.getUi().alert('Test Results', 'All system tests passed! Check console for details.', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ System test failed:', error);
    SpreadsheetApp.getUi().alert('Test Failed', 'System test failed: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function testDataLoading() {
  try {
    // Test raw data loading
    const rawData = loadRawDataFromSheet();
    console.log(`✅ Raw data loaded: ${rawData.length} records`);
    
    if (rawData.length > 0) {
      console.log('Sample raw record:', rawData[0]);
    }
    
    // Test address mapping loading
    const addressMap = loadAddressMappingData();
    const mapKeys = Object.keys(addressMap);
    console.log(`✅ Address mapping loaded: ${mapKeys.length} mappings`);
    
    if (mapKeys.length > 0) {
      console.log('Sample mapping:', mapKeys[0], '→', addressMap[mapKeys[0]]);
    }
    
  } catch (error) {
    console.error('❌ Data loading test failed:', error);
    throw error;
  }
}

function testTextParsing() {
  const testCases = [
    {
      name: "Standard format",
      input: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797938929139, Họ tên: Trần Thị Ánh Tuyết, Ngày sinh: 02/11/1959, Giới tính : Nữ! (ĐC: 13 CÁCH MẠNG THÁNG 8, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 04/09/2024 - 03/09/2025; Thời điểm đủ 5 năm liên tục: 01/09/2027)."
    },
    {
      name: "Go Vap format", 
      input: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797930799936, Họ tên: Đinh Tuấn Anh, Ngày sinh: 30/01/1982, Giới tính : Nam! (ĐC: 72/21 đường số 2, Phường 03, Quận Gò Vấp, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 01/09/2024 - 31/08/2025; Thời điểm đủ 5 năm liên tục: 01/08/2019)."
    },
    {
      name: "Thu Duc nested city - Long Binh",
      input: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797929604186, Họ tên: Nguyễn Thị Kim Dung, Năm sinh: 1964, Giới tính : Nữ! (ĐC: 81/15 KHU PHỐ VĨNH THUẬN, Phường Long Bình, Thành phố Thủ Đức, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 04/09/2024 - 03/09/2025; Thời điểm đủ 5 năm liên tục: 01/09/2019). Thẻ bảo hiểm sẽ hết hạn trong 26 ngày tới."
    },
    {
      name: "Thu Duc nested city - Hiep Binh Chanh",
      input: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797938369137, Họ tên: Huỳnh Quốc Huân, Ngày sinh: 27/10/1983, Giới tính : Nam! (ĐC: 97/53A ĐƯỜNG 48, Phường Hiệp Bình Chánh, Thành phố Thủ Đức, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 09/06/2025 - 31/08/2025; Thời điểm đủ 5 năm liên tục: 01/09/2022)."
    },
    {
      name: "Thu Duc nested city - Thao Dien",
      input: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797932109238, Họ tên: Nguyễn Thị Ngọc Phượng, Ngày sinh: 14/01/1986, Giới tính : Nữ! (ĐC: 219A NGUYỄN VĂN HưỞNG, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 01/09/2024 - 31/08/2025; Thời điểm đủ 5 năm liên tục: 01/09/2023)."
    }
  ];
  
  testCases.forEach(testCase => {
    try {
      console.log(`Testing: ${testCase.name}`);
      const result = parseThongTinField(testCase.input);
      console.log('✅ Parsed successfully:', {
        name: result.ho_va_ten,
        bhyt: result.bhyt,
        gender: result.gioi_tinh,
        birth: result.ngay_sinh,
        address: result.dia_chi
      });
    } catch (error) {
      console.error(`❌ Parse failed for ${testCase.name}:`, error.message);
      throw error;
    }
  });
}

function testAddressConversion() {
  const testAddresses = [
    "13 CÁCH MẠNG THÁNG 8, Bến Thành, Quận 1, Thành phố Hồ Chí Minh",
    "72/21 đường số 2, Phường 03, Quận Gò Vấp, Thành phố Hồ Chí Minh",
    "736/170 lê đức thọ, 15, Quận Gò Vấp, Thành phố Hồ Chí Minh",
    // Test Thu Duc nested city cases
    "81/15 KHU PHỐ VĨNH THUẬN; Long Bình; Thành phố Thủ Đức; Hồ Chí Minh",
    "97/53A ĐƯỜNG 48; Hiệp Bình Chánh; Thành phố Thủ Đức; Hồ Chí Minh",
    "219A NGUYỄN VĂN HưỞNG; Thảo Điền; Thành phố Thủ Đức; Hồ Chí Minh",
    // Test mapping cases - format after parsing
    "13 CÁCH MẠNG THÁNG 8; Bến Thành; 1; Hồ Chí Minh",
    "72/21 đường số 2; 03; Gò Vấp; Hồ Chí Minh",
    "736/170 lê đức thọ; 15; Gò Vấp; Hồ Chí Minh"
  ];
  
  const addressMappingData = loadAddressMappingData();
  
  testAddresses.forEach(address => {
    try {
      console.log(`\nTesting address: ${address}`);
      
      // Test address mapping với new logic
      const newAddress = mapOldAddressToNew(address, addressMappingData);
      console.log(`✅ Address mapped: ${address.substring(0, 40)}... → ${newAddress.substring(0, 50)}...`);
      
    } catch (error) {
      console.error(`❌ Address conversion failed for: ${address}`, error);
      throw error;
    }
  });
}

function testAddressMapping() {
  console.log('\n=== Testing Address Mapping ===');
  
  const testAddresses = [
    // Test các địa chỉ parsed format
    "13 CÁCH MẠNG THÁNG 8; Bến Thành; 1; Hồ Chí Minh",
    "72/21 đường số 2; 03; Gò Vấp; Hồ Chí Minh", 
    "736/170 lê đức thọ; 15; Gò Vấp; Hồ Chí Minh",
    "81/15 KHU PHỐ VĨNH THUẬN; Long Bình; Thành phố Thủ Đức; Hồ Chí Minh"
  ];
  
  try {
    const addressMappingData = loadAddressMappingData();
    
    testAddresses.forEach((address, index) => {
      try {
        console.log(`\nTest ${index + 1}: ${address}`);
        
        // Parse components
        const components = parseOldAddress(address);
        if (components) {
          console.log('  Parsed:', components);
          
          // Find mapping
          const newWardName = findNewWardName(components, addressMappingData);
          console.log('  New ward:', newWardName || 'Not found');
          
          // Full mapping
          const newAddress = mapOldAddressToNew(address, addressMappingData);
          console.log('  Result:', newAddress);
          console.log('  ✅ Success');
        } else {
          console.log('  ❌ Could not parse');
        }
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Address mapping test setup failed:', error);
    throw error;
  }
}

function testFullPipeline() {
  try {
    // Get sample data (first 3 records)
    const rawData = loadRawDataFromSheet().slice(0, 3);
    const addressMappingData = loadAddressMappingData();
    
    console.log(`Processing ${rawData.length} sample records...`);
    
    const results = [];
    
    rawData.forEach((record, index) => {
      try {
        const parsedInfo = parseThongTinField(record['thong_tin']);
        const transformedRecord = transformRecord(record, parsedInfo, addressMappingData);
        results.push(transformedRecord);
        console.log(`✅ Record ${index + 1} processed successfully`);
        console.log('  Address mapping result:', {
          original: transformedRecord['dia chi'],
          mapped: transformedRecord['dia chi sau sap nhap']
        });
      } catch (error) {
        console.error(`❌ Record ${index + 1} failed:`, error.message);
        throw error;
      }
    });
    
    console.log('✅ Full pipeline test completed successfully');
    
  } catch (error) {
    console.error('❌ Full pipeline test failed:', error);
    throw error;
  }
}

// Performance monitoring
function measurePerformance(functionName, func, ...args) {
  const startTime = new Date().getTime();
  
  try {
    const result = func.apply(this, args);
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    
    console.log(`⏱️ ${functionName} completed in ${duration}ms`);
    return result;
    
  } catch (error) {
    const endTime = new Date().getTime();
    const duration = endTime - startTime;
    console.error(`❌ ${functionName} failed after ${duration}ms:`, error);
    throw error;
  }
}

// Data validation helpers
function validateParsedData(parsedData) {
  const errors = [];
  
  // Check required fields
  if (!parsedData.ho_va_ten || parsedData.ho_va_ten.trim() === '') {
    errors.push('Thiếu họ tên');
  }
  
  if (!parsedData.bhyt || parsedData.bhyt.length !== 10) {
    errors.push('Mã BHYT không hợp lệ');
  }
  
  if (!parsedData.ngay_sinh || !(parsedData.ngay_sinh instanceof Date)) {
    errors.push('Ngày sinh không hợp lệ');
  }
  
  if (!parsedData.gioi_tinh || !['Nam', 'Nữ'].includes(parsedData.gioi_tinh)) {
    errors.push('Giới tính không hợp lệ');
  }
  
  return errors;
}

// Batch processing with progress tracking
function processBatchWithProgress(data, batchSize = 50) {
  const results = [];
  const errors = [];
  const totalBatches = Math.ceil(data.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize;
    const endIndex = Math.min(startIndex + batchSize, data.length);
    const batch = data.slice(startIndex, endIndex);
    
    console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} records)`);
    
    batch.forEach((record, recordIndex) => {
      const globalIndex = startIndex + recordIndex;
      try {
        // Process individual record
        const parsedInfo = parseThongTinField(record['thong_tin']);
        const addressMap = loadAddressMappingData(); // Consider caching this
        const transformedRecord = transformRecord(record, parsedInfo, addressMap);
        
        results.push(transformedRecord);
        
      } catch (error) {
        errors.push({
          index: globalIndex,
          error: error.message,
          record: record
        });
        
        // Add error record
        results.push(createErrorRecord(record, 'Lỗi chuyển đổi'));
      }
    });
    
    // Progress update
    const progress = Math.round(((batchIndex + 1) / totalBatches) * 100);
    console.log(`Batch ${batchIndex + 1} completed. Progress: ${progress}%`);
  }
  
  return { results, errors };
}

// Export functions for debugging
function exportProcessingLog() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = spreadsheet.getSheetByName('processing_log');
    
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('processing_log');
    }
    
    // Create simple log entry
    const timestamp = new Date();
    const logEntry = [
      [timestamp, 'System', 'Processing completed', 'Success']
    ];
    
    if (logSheet.getLastRow() === 0) {
      // Add headers
      logSheet.getRange(1, 1, 1, 4).setValues([['Timestamp', 'Component', 'Message', 'Status']]);
    }
    
    logSheet.getRange(logSheet.getLastRow() + 1, 1, 1, 4).setValues(logEntry);
    
    console.log('✅ Processing log exported to processing_log sheet');
    
  } catch (error) {
    console.error('❌ Failed to export processing log:', error);
  }
}

// Configuration and settings
const CONFIG = {
  BATCH_SIZE: 100,
  MAX_PROCESSING_TIME: 300000, // 5 minutes in milliseconds
  DEFAULT_CUTOFF_DATE: '2025-05-03',
  SUPPORTED_PROVINCES: ['Thành phố Hồ Chí Minh', 'Bà Rịa - Vũng Tàu', 'Bình Dương'],
  ERROR_MESSAGES: {
    EMPTY_FIELD: 'Trường thông tin trống',
    PARSE_ERROR: 'Lỗi chuyển đổi',
    MAPPING_NOT_FOUND: 'Không tìm thấy mapping địa chỉ',
    INVALID_DATE: 'Ngày tháng không hợp lệ'
  }
};

// Test Thu Duc nested hierarchy cases
function testThuDucCases() {
  const testCases = [
    {
      name: "Thu Duc - Long Binh ward",
      text: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797929604186, Họ tên: Nguyễn Thị Kim Dung, Năm sinh: 1964, Giới tính : Nữ! (ĐC: 81/15 KHU PHỐ VĨNH THUẬN, Phường Long Bình, Thành phố Thủ Đức, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 04/09/2024 - 03/09/2025; Thời điểm đủ 5 năm liên tục: 01/09/2019).",
      expected: "81/15 KHU PHỐ VĨNH THUẬN; Long Bình; Thủ Đức; Hồ Chí Minh"
    },
    {
      name: "Thu Duc - Hiep Binh Chanh ward",
      text: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797938369137, Họ tên: Huỳnh Quốc Huân, Ngày sinh: 27/10/1983, Giới tính : Nam! (ĐC: 97/53A ĐƯỜNG 48, Phường Hiệp Bình Chánh, Thành phố Thủ Đức, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 09/06/2025 - 31/08/2025).",
      expected: "97/53A ĐƯỜNG 48; Hiệp Bình Chánh; Thủ Đức; Hồ Chí Minh"
    },
    {
      name: "Thu Duc - Thao Dien ward",
      text: "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797932109238, Họ tên: Nguyễn Thị Ngọc Phượng, Ngày sinh: 14/01/1986, Giới tính : Nữ! (ĐC: 219A NGUYỄN VĂN HưỞNG, Phường Thảo Điền, Thành phố Thủ Đức, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 01/09/2024 - 31/08/2025).",
      expected: "219A NGUYỄN VĂN HưỞNG; Thảo Điền; Thủ Đức; Hồ Chí Minh"
    }
  ];
  
  console.log('=== Testing Thu Duc Nested Hierarchy ===');
  
  testCases.forEach((testCase, index) => {
    try {
      console.log(`\nTest ${index + 1}: ${testCase.name}`);
      
      const parsed = parseThongTinField(testCase.text);
      
      console.log('Address result:', parsed.dia_chi);
      console.log('Expected:', testCase.expected);
      
      const isMatch = parsed.dia_chi === testCase.expected;
      console.log('Match:', isMatch ? 'PASS' : 'FAIL');
      
      if (!isMatch) {
        console.log('Parts analysis:');
        const parts = parsed.dia_chi.split('; ');
        const expectedParts = testCase.expected.split('; ');
        parts.forEach((part, i) => {
          const exp = expectedParts[i] || '';
          console.log(`  Part ${i}: "${part}" vs "${exp}" ${part === exp ? 'OK' : 'DIFF'}`);
        });
      }
      
      console.log('Name:', parsed.ho_va_ten);
      
    } catch (error) {
      console.error(`Test ${index + 1} failed:`, error.message);
    }
  });
  
  SpreadsheetApp.getUi().alert('Thu Duc Tests', 
    'Thu Duc hierarchy tests completed. Check console for results.', 
    SpreadsheetApp.getUi().ButtonSet.OK);
}

// Combined comprehensive test
function runAllAddressTests() {
  console.log('=== COMPREHENSIVE ADDRESS TESTS ===');
  
  // Test edge cases first
  console.log('\n1. Testing edge cases...');
  testEdgeCaseAddresses();
  
  // Test Thu Duc cases
  console.log('\n2. Testing Thu Duc hierarchy...');
  testThuDucCases();
  
  console.log('\n=== ALL ADDRESS TESTS COMPLETED ===');
}

// Quick diagnostic for address parsing only
function testAddressParsing() {
  const testAddresses = [
    "22/17 Nguyễn Hiền, Phường 4, Quận 3, Phường 04, Quận 3, Thành phố Hồ Chí Minh",
    "chung cư The Estella, PHƯỜNG AN PHÚ; THÀNH PHỐ THỦ ĐỨC, THÀNH PHỐ HỒ CHÍ MINH",
    "32 Đường Số 4, CXĐT, Phường 04, Quận 3, Thành phố Hồ Chí Minh",
    "82/36 Lý Chính Thắng , Phường Võ Thị Sáu , Quận 3, Phường Võ Thị Sáu, Quận 3, Thành phố Hồ Chí Minh"
  ];
  
  console.log('=== Address Parsing Tests ===');
  
  testAddresses.forEach((address, index) => {
    try {
      console.log(`\nTest ${index + 1}:`);
      console.log('Input:', address);
      const cleaned = cleanAddressFormat(address);
      console.log('Output:', cleaned);
    } catch (error) {
      console.error(`Address test ${index + 1} failed:`, error);
    }
  });
}

// Test numerical ward mapping
function testNumericalWardMapping() {
  console.log('=== Testing Numerical Ward Mapping ===');
  
  const testAddresses = [
    // Test các phường số
    "72/21 đường số 2; 03; Gò Vấp; Hồ Chí Minh",
    "736/170 lê đức thọ; 15; Gò Vấp; Hồ Chí Minh",
    "22/17 Nguyễn Hiền; 04; 3; Hồ Chí Minh",
    "123 Main Street; 01; 1; Hồ Chí Minh",
    "456 Test Road; 02; Tân Bình; Hồ Chí Minh"
  ];
  
  try {
    const addressMappingData = loadAddressMappingData();
    
    testAddresses.forEach((address, index) => {
      try {
        console.log(`\nTest ${index + 1}: ${address}`);
        
        // Parse components
        const components = parseOldAddress(address);
        if (components) {
          console.log('  Parsed:', components);
          
          // Find mapping
          const newWardName = findNewWardName(components, addressMappingData);
          console.log('  New ward:', newWardName || 'Not found');
          
          if (newWardName) {
            // Full mapping
            const newAddress = mapOldAddressToNew(address, addressMappingData);
            console.log('  Mapped to:', newAddress);
            console.log('  ✅ Success - Found mapping');
          } else {
            console.log('  ⚠️ No mapping found - will keep original');
          }
        } else {
          console.log('  ❌ Could not parse');
        }
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
      }
    });
    
    console.log('\n=== Numerical Ward Mapping Test Completed ===');
    
  } catch (error) {
    console.error('❌ Numerical ward mapping test setup failed:', error);
    throw error;
  }
}

// Test prefix removal from ward names
function testWardPrefixRemoval() {
  console.log('=== Testing Ward Prefix Removal ===');
  
  const testAddresses = [
    // Test Thu Duc cases that should have prefix removed
    "81/15 KHU PHỐ VĨNH THUẬN; Long Bình; Thành phố Thủ Đức; Hồ Chí Minh",
    "97/53A ĐƯỜNG 48; Hiệp Bình Chánh; Thành phố Thủ Đức; Hồ Chí Minh",
    "219A NGUYỄN VĂN HưỞNG; Thảo Điền; Thành phố Thủ Đức; Hồ Chí Minh",
    // Test regular district cases
    "13 CÁCH MẠNG THÁNG 8; Bến Thành; 1; Hồ Chí Minh"
  ];
  
  try {
    const addressMappingData = loadAddressMappingData();
    
    testAddresses.forEach((address, index) => {
      try {
        console.log(`\nTest ${index + 1}: ${address}`);
        
        const originalComponents = parseOldAddress(address);
        if (originalComponents) {
          console.log('  Original ward:', originalComponents.ward);
          
          const mappedAddress = mapOldAddressToNew(address, addressMappingData);
          console.log('  Result:', mappedAddress);
          
          // Check if prefix was removed
          const resultParts = mappedAddress.split('; ');
          if (resultParts.length >= 2) {
            const resultWard = resultParts[1];
            console.log('  Final ward name:', `"${resultWard}"`);
            
            if (resultWard.match(/^(Phường|Xã)\s+/)) {
              console.log('  ❌ ISSUE: Prefix not removed!');
            } else {
              console.log('  ✅ SUCCESS: Prefix properly removed');
            }
          }
        }
        
      } catch (error) {
        console.error(`  ❌ Failed: ${error.message}`);
      }
    });
    
    console.log('\n=== Ward Prefix Removal Test Completed ===');
    
  } catch (error) {
    console.error('❌ Ward prefix removal test setup failed:', error);
    throw error;
  }
}