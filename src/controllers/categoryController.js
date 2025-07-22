import categoryService from "../services/categoryService.js";

const getCategoriesWithSub = async (req, res) => {
  try {
    const data = await categoryService.getCategoriesWithSub();
    res.status(200).json({
      status: "OK",
      message: "Lấy danh sách menu cha-con thành công",
      data,
    });
  } catch (error) {
    console.error("Lỗi khi lấy menu:", error);
    res.status(500).json({ message: "Lỗi server khi lấy menu" });
  }
};

export default {
  getCategoriesWithSub,
};
