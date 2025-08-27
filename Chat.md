---
title: Note

---

Tốt, tôi đang có 1 vấn đề. Tôi đang làm trong lĩnh vực bảo hiểm y tế. Hiện tại khi người dùng đến mua bảo hiểm y tế. họ sẽ tôi sẽ nhập các thông tin vào file google sheet như thế này. Tôi đã chuyển qua định dạng Json để bạn dễ hình dung
"[
  {
    "date": "01/08/2025",
    "thong tin": "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797938929139, Họ tên: Trần Thị Ánh Tuyết, Ngày sinh: 02/11/1959, Giới tính : Nữ! (ĐC: 13 CÁCH MẠNG THÁNG 8, Phường Bến Thành, Quận 1, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 04/09/2024 - 03/09/2025; Thời điểm đủ 5 năm liên tục: 01/09/2027).",
    "cccd": "064159000022",
    "stt": 1,
    "muc": 100,
    "trang thai": "GH",
    "sdt": "0933330433",
    "bien lai": "0003976",
    "gia tien": "1,264,000"
  },
  {
    "date": "01/08/2025",
    "thong tin": "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797930799936, Họ tên: Đinh Tuấn Anh, Ngày sinh: 30/01/1982, Giới tính : Nam! (ĐC: 72/21 đường số 2, Phường 03, Quận Gò Vấp, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 01/09/2024 - 31/08/2025; Thời điểm đủ 5 năm liên tục: 01/08/2019).",
    "cccd": "082082013452",
    "stt": 2,
    "muc": 100,
    "trang thai": "GH",
    "sdt": "0368074977",
    "bien lai": "0003977",
    "gia tien": "1,264,000"
  },
  {
    "date": "01/08/2025",
    "thong tin": "Thông báo: Thẻ còn giá trị sử dụng! Mã thẻ: GD4797930290982, Họ tên: Phạm Thị Cẩm Vân, Ngày sinh: 02/11/1982, Giới tính : Nữ! (ĐC: 72/21 đường số 2, Phường 03, Quận Gò Vấp, Thành phố Hồ Chí Minh; Nơi KCBBĐ: 79071; Hạn thẻ: 01/09/2024 - 31/08/2025; Thời điểm đủ 5 năm liên tục: 01/08/2019). Thẻ bảo hiểm sẽ hết hạn trong 30 ngày tới. Đề nghị chủ thẻ đến các đại lý thu BHYT tự nguyện bao gồm tất cả các chi nhánh của Tổng công ty bưu điện Việt Nam, cơ quan BHXH cấp huyện, UBND xã ... hoặc liên hệ Trung tâm hỗ trợ khách hàng của BHXH Việt Nam theo số điện thoại: 19009068 để được hỗ trợ.",
    "cccd": "080182009314",
    "stt": 3,
    "muc": 70,
    "trang thai": "GH",
    "sdt": "0368074977",
    "bien lai": "0003977",
    "gia tien": "885,000"
  }
]"

Sau đó tôi xử lí dữ liệu với file excel (sử dụng power query lấy link từ google sheet sau đó load dữ liệu và xử lí với power query). Sau khi xử lí xong thì nó sẽ có các cột như thế này.Tôi cũng đã chuyển qua định dạng Json
"[
  {
    "date": "01/08/2025",
    "trang thai": "Gia hạn thẻ",
    "ho va ten": "Trần Thị Ánh Tuyết",
    "bhyt": 7938929139,
    "gioi tinh": "Nữ",
    "ngay sinh": "02/11/1959",
    "dia chi": "13 CÁCH MẠNG THÁNG 8; Bến Thành; 1; Hồ Chí Minh",
    "thoi han su dung": "04/09/2025",
    "muc": 100,
    "bien lai": "0003976",
    "cccd": "064159000022",
    "sdt": "0933330433"
  },
  {
    "date": "01/08/2025",
    "trang thai": "Gia hạn thẻ",
    "ho va ten": "Đinh Tuấn Anh",
    "bhyt": 7930799936,
    "gioi tinh": "Nam",
    "ngay sinh": "30/01/1982",
    "dia chi": "72/21 đường số 2; 3; Gò Vấp; Hồ Chí Minh",
    "thoi han su dung": "01/09/2025",
    "muc": 100,
    "bien lai": "0003977",
    "cccd": "082082013452",
    "sdt": "0368074977"
  },
  {
    "date": "01/08/2025",
    "trang thai": "Gia hạn thẻ",
    "ho va ten": "Phạm Thị Cẩm Vân",
    "bhyt": 7930290982,
    "gioi tinh": "Nữ",
    "ngay sinh": "02/11/1982",
    "dia chi": "72/21 đường số 2; 3; Gò Vấp; Hồ Chí Minh",
    "thoi han su dung": "01/09/2025",
    "muc": 70,
    "bien lai": "0003977",
    "cccd": "080182009314",
    "sdt": "0368074977"
  }
]"

Và đây là code trong power query tôi xử lí các bước:
"let
    Nguồn = Excel.Workbook(Web.Contents("https://docs.google.com/spreadsheets/d/14gOH8VWyiyiz9J4xzuopyVl3OORPI87ov5LAtC7i_dI/export?format=xlsx&gid=0"), null, true),
    #"rawdata tong_Sheet" = Nguồn{[Item="rawdata tong",Kind="Sheet"]}[Data],
    #"Tiêu đề được Tăng cấp" = Table.PromoteHeaders(#"rawdata tong_Sheet", [PromoteAllScalars=true]),
    #"Đã lọc Hàng" = Table.SelectRows(#"Tiêu đề được Tăng cấp", each ([thong tin] <> null)),
    #"Văn bản Cắt xén2" = Table.TransformColumns(#"Đã lọc Hàng",{{"cccd", Text.Trim, type text}, {"trang thai", Text.Trim, type text}}),
    #"Tách Cột bằng Dấu tách" = Table.SplitColumn(#"Đã lọc Hàng", "thong tin", Splitter.SplitTextByDelimiter(":", QuoteStyle.Csv), {"thong tin.1", "thong tin.2", "thong tin.3", "thong tin.4", "thong tin.5", "thong tin.6", "thong tin.7", "thong tin.8", "thong tin.9", "thong tin.10", "thong tin.11"}),
    #"Tách Cột bằng Dấu tách1" = Table.SplitColumn(#"Tách Cột bằng Dấu tách", "thong tin.3", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv), {"thong tin.3.1", "thong tin.3.2"}),
    #"Tách Cột bằng Dấu tách2" = Table.SplitColumn(#"Tách Cột bằng Dấu tách1", "thong tin.4", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv), {"thong tin.4.1", "thong tin.4.2"}),
    #"Tách Cột bằng Dấu tách3" = Table.SplitColumn(#"Tách Cột bằng Dấu tách2", "thong tin.5", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv), {"thong tin.5.1", "thong tin.5.2"}),
    #"Tách Cột bằng Dấu tách4" = Table.SplitColumn(#"Tách Cột bằng Dấu tách3", "thong tin.6", Splitter.SplitTextByEachDelimiter({"!"}, QuoteStyle.Csv, false), {"thong tin.6.1", "thong tin.6.2"}),
    #"Tách Cột bằng Dấu tách5" = Table.SplitColumn(#"Tách Cột bằng Dấu tách4", "thong tin.7", Splitter.SplitTextByDelimiter(";", QuoteStyle.Csv), {"thong tin.7.1", "thong tin.7.2"}),
    #"Tách Cột bằng Dấu tách6" = Table.SplitColumn(#"Tách Cột bằng Dấu tách5", "thong tin.9", Splitter.SplitTextByEachDelimiter({";"}, QuoteStyle.Csv, false), {"thong tin.9.1", "thong tin.9.2"}),
    #"Tách Cột bằng Dấu tách7" = Table.SplitColumn(#"Tách Cột bằng Dấu tách6", "thong tin.9.1", Splitter.SplitTextByEachDelimiter({"-"}, QuoteStyle.Csv, false), {"thong tin.9.1.1", "thong tin.9.1.2"}),
    #"Văn bản Cắt xén" = Table.TransformColumns(#"Tách Cột bằng Dấu tách7",{{"thong tin.2", Text.Trim, type text}}),
    #"Đã trích xuất văn bản trước dấu tách" = Table.TransformColumns(#"Văn bản Cắt xén", {{"thong tin.2", each Text.BeforeDelimiter(_, " ", 1), type text}}),
    #"Đã xóa Cột khác" = Table.SelectColumns(#"Đã trích xuất văn bản trước dấu tách",{"date", "thong tin.2", "thong tin.3.1", "thong tin.4.1", "thong tin.5.1", "thong tin.6.1", "thong tin.7.1", "thong tin.9.1.1", "thong tin.9.1.2", "cccd", "muc", "trang thai", "sdt", "bien lai"}),
    #"Văn bản Cắt xén1" = Table.TransformColumns(#"Đã xóa Cột khác",{{"thong tin.2", Text.Trim, type text}, {"thong tin.3.1", Text.Trim, type text}, {"thong tin.4.1", Text.Trim, type text}, {"thong tin.5.1", Text.Trim, type text}, {"thong tin.6.1", Text.Trim, type text}, {"thong tin.7.1", Text.Trim, type text}, {"thong tin.9.1.1", Text.Trim, type text}, {"thong tin.9.1.2", Text.Trim, type text}}),
    #"Đã đổi tên Cột" = Table.RenameColumns(#"Văn bản Cắt xén1",{{"thong tin.2", "han the"}, {"thong tin.3.1", "bhyt"}, {"thong tin.4.1", "ho va ten"}, {"thong tin.5.1", "ngay sinh"}, {"thong tin.6.1", "gioi tinh"}, {"thong tin.7.1", "dia chi"}, {"thong tin.9.1.1", "ngay bat dau"}, {"thong tin.9.1.2", "ngay ket thuc"}}),
    #"Đã thay thế Giá trị" = Table.ReplaceValue(#"Đã đổi tên Cột",", Phường",";",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị1" = Table.ReplaceValue(#"Đã thay thế Giá trị",", Quận",";",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị2" = Table.ReplaceValue(#"Đã thay thế Giá trị1",", Thành phố",";",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị3" = Table.ReplaceValue(#"Đã thay thế Giá trị2",", Xã",";",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị4" = Table.ReplaceValue(#"Đã thay thế Giá trị3",", Huyện",";",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị5" = Table.ReplaceValue(#"Đã thay thế Giá trị4","; 01;","; 1;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị6" = Table.ReplaceValue(#"Đã thay thế Giá trị5","; 02;","; 2;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị7" = Table.ReplaceValue(#"Đã thay thế Giá trị6","; 03;","; 3;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị8" = Table.ReplaceValue(#"Đã thay thế Giá trị7","; 04;","; 4;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị9" = Table.ReplaceValue(#"Đã thay thế Giá trị8","; 05;","; 5;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị10" = Table.ReplaceValue(#"Đã thay thế Giá trị9","; 06;","; 6;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị11" = Table.ReplaceValue(#"Đã thay thế Giá trị10","; 07;","; 7;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị12" = Table.ReplaceValue(#"Đã thay thế Giá trị11","; 08;","; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị13" = Table.ReplaceValue(#"Đã thay thế Giá trị12","; 09;","; 9;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị14" = Table.ReplaceValue(#"Đã thay thế Giá trị13",",;",";",Replacer.ReplaceText,{"dia chi"}),
    #"Đã trích xuất Ký tự Cuối cùng" = Table.TransformColumns(#"Đã thay thế Giá trị14", {{"bhyt", each Text.End(_, 10), type text}}),
    #"Đã thay đổi Loại1" = Table.TransformColumnTypes(#"Đã trích xuất Ký tự Cuối cùng",{{"ngay sinh", type date}, {"ngay bat dau", type date}, {"ngay ket thuc", type date}}),
    #"Đã thêm Cột Tùy chỉnh" = Table.AddColumn(#"Đã thay đổi Loại1", "thoi han su dung", each if [trang thai] = "GH" then 
    if [ngay ket thuc] > #date(2025, 5, 03) then Date.AddDays([ngay ket thuc], 1) else #date(2025, 5, 03) 
else 
    Date.AddMonths(#date(2025, 5, 03), 1)),
    #"Đã thay thế Giá trị15" = Table.ReplaceValue(#"Đã thêm Cột Tùy chỉnh","GH","Gia hạn thẻ",Replacer.ReplaceText,{"trang thai"}),
    #"Đã thay thế Giá trị16" = Table.ReplaceValue(#"Đã thay thế Giá trị15","MM","Tăng mới",Replacer.ReplaceText,{"trang thai"}),
    #"Đã sắp xếp lại Cột" = Table.ReorderColumns(#"Đã thay thế Giá trị16",{"date",  "trang thai", "ho va ten", "bhyt", "gioi tinh", "ngay sinh", "dia chi", "thoi han su dung", "muc", "bien lai", "cccd", "sdt", "han the", "ngay bat dau", "ngay ket thuc"}),
    #"Đã xóa Cột khác1" = Table.SelectColumns(#"Đã sắp xếp lại Cột",{"date", "trang thai", "ho va ten", "bhyt", "gioi tinh", "ngay sinh", "dia chi", "thoi han su dung", "muc", "cccd", "sdt", "bien lai"}),
    #"Đã sắp xếp lại Cột1" = Table.ReorderColumns(#"Đã xóa Cột khác1",{"date", "trang thai", "ho va ten", "bhyt", "gioi tinh", "ngay sinh", "dia chi", "thoi han su dung", "muc", "bien lai", "cccd", "sdt"}),
    #"Đã thay thế Giá trị17" = Table.ReplaceValue(#"Đã sắp xếp lại Cột1","Thủ Đức","Thành phố Thủ Đức",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị18" = Table.ReplaceValue(#"Đã thay thế Giá trị17","; 10; 3;","; 9; 3;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị19" = Table.ReplaceValue(#"Đã thay thế Giá trị18","; 13; 3;","; 12; 3;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị20" = Table.ReplaceValue(#"Đã thay thế Giá trị19","; 6; 4;","; 9; 4;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị21" = Table.ReplaceValue(#"Đã thay thế Giá trị20","; 10; 4;","; 8; 4;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị22" = Table.ReplaceValue(#"Đã thay thế Giá trị21","; 14; 4;","; 15; 4;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị23" = Table.ReplaceValue(#"Đã thay thế Giá trị22","; 3; 5;","; 2; 5;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị24" = Table.ReplaceValue(#"Đã thay thế Giá trị23","; 6; 5;","; 5; 5;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị25" = Table.ReplaceValue(#"Đã thay thế Giá trị24","; 8; 5;","; 7; 5;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị26" = Table.ReplaceValue(#"Đã thay thế Giá trị25","; 10; 5;","; 11; 5;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị27" = Table.ReplaceValue(#"Đã thay thế Giá trị26","; 3; 6;","; 1; 6;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị28" = Table.ReplaceValue(#"Đã thay thế Giá trị27","; 4; 6;","; 1; 6;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị29" = Table.ReplaceValue(#"Đã thay thế Giá trị28","; 1; 8;","; Rạch Ông; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị30" = Table.ReplaceValue(#"Đã thay thế Giá trị29","; 2; 8;","; Rạch Ông; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị31" = Table.ReplaceValue(#"Đã thay thế Giá trị30","; 3; 8;","; Rạch Ông; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị32" = Table.ReplaceValue(#"Đã thay thế Giá trị31","; 8; 8;","; Hưng Phú; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị33" = Table.ReplaceValue(#"Đã thay thế Giá trị32","; 9; 8;","; Hưng Phú; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị34" = Table.ReplaceValue(#"Đã thay thế Giá trị33","; 10; 8;","; Hưng Phú; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị35" = Table.ReplaceValue(#"Đã thay thế Giá trị34","; 11; 8;","; Xóm Củi; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị36" = Table.ReplaceValue(#"Đã thay thế Giá trị35","; 12; 8;","; Xóm Củi; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị37" = Table.ReplaceValue(#"Đã thay thế Giá trị36","; 13; 8;","; Xóm Củi; 8;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị38" = Table.ReplaceValue(#"Đã thay thế Giá trị37","; 7; 10;","; 6; 10;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị39" = Table.ReplaceValue(#"Đã thay thế Giá trị38","; 5; 10;","; 8; 10;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị40" = Table.ReplaceValue(#"Đã thay thế Giá trị39","; 11; 10;","; 10; 10;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị41" = Table.ReplaceValue(#"Đã thay thế Giá trị40","; 2; 11;","; 1; 11;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị42" = Table.ReplaceValue(#"Đã thay thế Giá trị41","; 4; 11;","; 7; 11;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị43" = Table.ReplaceValue(#"Đã thay thế Giá trị42","; 6; 11;","; 7; 11;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị44" = Table.ReplaceValue(#"Đã thay thế Giá trị43","; 12; 11;","; 8; 11;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị45" = Table.ReplaceValue(#"Đã thay thế Giá trị44","; 9; 11;","; 10; 11;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị46" = Table.ReplaceValue(#"Đã thay thế Giá trị45","; 13; 11;","; 11; 11;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị47" = Table.ReplaceValue(#"Đã thay thế Giá trị46","; 3; Bình Thạnh;","; 1; Bình Thạnh;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị48" = Table.ReplaceValue(#"Đã thay thế Giá trị47","; 15; Bình Thạnh;","; 2; Bình Thạnh;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị49" = Table.ReplaceValue(#"Đã thay thế Giá trị48","; 21; Bình Thạnh;","; 19; Bình Thạnh;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị50" = Table.ReplaceValue(#"Đã thay thế Giá trị49","; 24; Bình Thạnh;","; 14; Bình Thạnh;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị51" = Table.ReplaceValue(#"Đã thay thế Giá trị50","; 4; Gò Vấp;","; 1; Gò Vấp;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị52" = Table.ReplaceValue(#"Đã thay thế Giá trị51","; 7; Gò Vấp;","; 1; Gò Vấp;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị53" = Table.ReplaceValue(#"Đã thay thế Giá trị52","; 9; Gò Vấp;","; 8; Gò Vấp;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị54" = Table.ReplaceValue(#"Đã thay thế Giá trị53","; 3; Phú Nhuận;","; 4; Phú Nhuận;",Replacer.ReplaceText,{"dia chi"}),
    #"Đã thay thế Giá trị55" = Table.ReplaceValue(#"Đã thay thế Giá trị54","; 17; Phú Nhuận;","; 15; Phú Nhuận;",Replacer.ReplaceText,{"dia chi"})
in
    #"Đã thay thế Giá trị55"
    
Giờ tôi muốn không sử dụng power query và excel để xử lí nữa, mà sẽ chuyển luôn trên web để real time và tự động.

Đó là vấn đề thứ nhất. Vấn đề thứ hai là ở Việt Nam mới gộp xã, phường, tỉnh lại với nhau (tinh gọn bộ máy). nên giờ địa chỉ bảo hiểm y tế cũ khi xử lí, trích xuất cần thêm 1 bước nữa là phải chuyển qua địa chỉ mới. Tôi đã có 1 file excel dữ liệu cũ và mới. Do đó cần phải xử lí và chuyển qua địa chỉ mới để có thể đúng chuẩn trước khi gửi cho bên bảo hiểm y tế. đây là 1 vài dòng mẫu
"[
  {
    "ten tinh": "Thành phố Hồ Chí Minh",
    "ten phuong xa moi": "Xã Thanh An",
    "ten quan huyen cu": "Huyện Dầu Tiếng",
    "xa phuong truoc sap nhap": "Thanh An, một phần Định Hiệp, một phần Thanh Tuyền, An Lập"
  },
  {
    "ten tinh": "Thành phố Hồ Chí Minh",
    "ten phuong xa moi": "Phường Hạnh Thông",
    "ten quan huyen cu": "Quận Gò Vấp",
    "xa phuong truoc sap nhap": "Phường 1, 3"
  },
  {
    "ten tinh": "Thành phố Hồ Chí Minh",
    "ten phuong xa moi": "Phường An Hội Đông",
    "ten quan huyen cu": "Quận Gò Vấp",
    "xa phuong truoc sap nhap": "Phường 15, 16"
  }
]"
.Chẳng hạn thông tin địa chỉ cũ là '736/170 lê đức thọ, 15, Quận Gò Vấp, Thành phố Hồ Chí Minh' -> sau khi đổi sẽ thành '736/170 lê đức thọ, Phường An Hội Đông, Thành phố Hồ Chí Minh'. Tức số nhà, tên đường, tổ thì giữ nguyên. còn bỏ cấp huyện (quận). đặt lại tên phường. ở hồ chí mình thì gộp thêm bà rịa vũng tàu, bình dương

-> chúng ta hãy suy nghĩ và thảo luận để ra được giải pháp