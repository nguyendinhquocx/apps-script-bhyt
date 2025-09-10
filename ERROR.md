# Error Log - BHYT Data Processor

## 1. Date Parsing Day Off By One Bug
**Ngày:** 10/09/2025 | **Severity:** High

### Lỗi gì
Date parsing trả về ngày sai: input "02/06/1952" output "01/06/1952" (thiếu 1 ngày)

### Vì sao  
JavaScript Date constructor với timezone local gây day shift. `new Date(1952, 5, 2)` bị affected bởi timezone offset làm ngày bị lệch.

### Fix thế nào
```javascript
// BEFORE:
return new Date(year, month - 1, day);

// AFTER: 
return new Date(Date.UTC(year, month - 1, day));
```

### Bài học
- Luôn dùng `Date.UTC()` cho date parsing từ input string để tránh timezone issues
- Thêm validation console.log để verify parsing result
- Test với multiple date formats khi dealing với Date objects