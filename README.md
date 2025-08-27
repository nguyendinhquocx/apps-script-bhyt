# BHYT Data Processor

Hệ thống xử lý dữ liệu bảo hiểm y tế tự động, thay thế quy trình Power Query bằng Google Apps Script.

## Mục đích

Chuyển đổi dữ liệu BHYT từ text phức tạp thành format chuẩn và cập nhật địa chỉ theo cơ cấu hành chính mới của Việt Nam.

## Input và Output

**Dữ liệu đầu vào**: Text BHYT chứa thông tin thẻ, họ tên, địa chỉ cũ
**Dữ liệu đầu ra**: Bảng có cấu trúc với địa chỉ đã được cập nhật

## Cấu trúc file

```
Code.js           - Main processing pipeline
Parser.js         - Text parsing logic  
AddressMapper.js  - Address conversion
Utils.js          - Testing và debugging
xa phuong.json    - Mapping địa chỉ cũ sang mới
```

## Cách sử dụng

1. Mở Google Sheets với dữ liệu raw
2. Chạy Apps Script
3. Chọn "Xử Lý Dữ Liệu BHYT" từ menu
4. Kết quả xuất hiện trong sheet "processed_data"

## Xử lý đặc biệt

Hệ thống tự động nhận diện và xử lý:
- Địa chỉ Thành phố Thủ Đức (nested city structure)
- Format địa chỉ cũ sang tên phường/xã mới
- Tính toán thời hạn sử dụng theo quy định

## Testing

Chạy `runFullSystemTest()` trong Utils.js để kiểm tra toàn hệ thống.

## Lưu ý

Hệ thống được thiết kế để xử lý real-time trên web thay vì Excel/Power Query truyền thống.
