import promotionService from "../services/promotionService.js";

export const applyPromotion = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: "Vui lòng nhập mã khuyến mãi" });
  }

  try {
    const promo = await promotionService.getPromotionByCode(code);

    if (!promo) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return res
        .status(404)
        .json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn" });
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
    res.status(200).json({ promotion: promo });
  } catch (err) {
    console.error("Lỗi kiểm tra mã khuyến mãi:", err);
    res.status(500).json({ message: "Lỗi máy chủ khi kiểm tra mã khuyến mãi" });
  }
};

export default {
  applyPromotion,
};
