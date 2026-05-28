const viMeaningMap = new Map([
  ["xin chao", "xin chào"],
  ["chao ban", "chào bạn"],
  ["loi chao", "lời chào"],
  ["tam biet", "tạm biệt"],
  ["cam on", "cảm ơn"],
  ["xin loi", "xin lỗi"],
  ["quyen sach", "quyển sách"],
  ["sach", "sách"],
  ["hoc tap", "học tập"],
  ["nghien cuu", "nghiên cứu"],
  ["hoc", "học"],
  ["hoc hoi", "học hỏi"],
  ["truong hoc", "trường học"],
  ["giao vien", "giáo viên"],
  ["hoc sinh", "học sinh"],
  ["sinh vien", "sinh viên"],
  ["ban be", "bạn bè"],
  ["nguoi ban", "người bạn"],
  ["gia dinh", "gia đình"],
  ["tinh yeu", "tình yêu"],
  ["lam viec", "làm việc"],
  ["cong viec", "công việc"],
  ["nuoc", "nước"],
  ["thuc an", "thức ăn"],
  ["do an", "đồ ăn"],
  ["ngoi nha", "ngôi nhà"],
  ["can nha", "căn nhà"],
  ["may tinh", "máy tính"],
  ["do uong", "đồ uống"],
  ["thuc uong", "thức uống"],
  ["ca phe", "cà phê"],
  ["tra", "trà"],
  ["sua", "sữa"],
  ["qua tao", "quả táo"],
  ["qua chuoi", "quả chuối"],
  ["dep", "đẹp"],
  ["xinh dep", "xinh đẹp"],
  ["quan trong", "quan trọng"],
  ["cham", "chậm"],
  ["vui ve", "vui vẻ"],
  ["hanh phuc", "hạnh phúc"],
  ["buon", "buồn"],
  ["mo", "mở"],
  ["dong", "đóng"],
  ["lang nghe", "lắng nghe"],
  ["noi", "nói"],
  ["viet", "viết"],
  ["doc", "đọc"]
]);

export function displayMeaning(value) {
  const normalized = value.trim().toLocaleLowerCase("vi-VN");
  return viMeaningMap.get(normalized) || value;
}

export function compareMeaning(a, b) {
  return displayMeaning(a).trim().toLocaleLowerCase("vi-VN") === displayMeaning(b).trim().toLocaleLowerCase("vi-VN");
}
