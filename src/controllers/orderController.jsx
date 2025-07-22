import orderService from "../services/orderService";

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = req.body;

    const { orderId, orderCode } = await orderService.createOrder(
      userId,
      orderData
    );

    res.status(201).json({
      message: "Đặt hàng thành công",
      orderId,
      orderCode,
    });
  } catch (error) {
    console.error("Lỗi tạo đơn hàng:", error);
    res.status(500).json({ message: "Tạo đơn hàng thất bại" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getOrdersByUser(userId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  try {
    const success = await orderService.cancelOrder(orderId, userId);
    if (!success) {
      return res.status(403).json({ message: "Không thể huỷ đơn hàng này." });
    }

    res.json({ message: "Huỷ đơn hàng thành công." });
  } catch (error) {
    console.error("Lỗi huỷ đơn:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

export default {
  createOrder,
  getUserOrders,
  cancelOrder,
};
