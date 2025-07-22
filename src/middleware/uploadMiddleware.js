import multer from "multer";
import fs from "fs";

// Xác định thư mục lưu dựa vào fieldname hoặc logic khác
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ví dụ: nếu fieldname là 'avatar' thì lưu vào avatar
    let folder = "src/public/uploads";
    if (file.fieldname === "avatar") {
      folder = "src/public/avatar";
    }

    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
