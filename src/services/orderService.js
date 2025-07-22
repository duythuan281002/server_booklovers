import pool from "../config/connectDB.js";
import cartService from "./cartService.js";

// Hàm tạo mã đơn hàng ngẫu nhiên 8 ký tự
const generateOrderCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const createOrder = async (userId, orderData) => {
  const {
    cartItems,
    totalPrice,
    paymentMethod,
    note,
    location,
    phone,
    fullname,
    promotionId,
    shippingFee,
  } = orderData;

  const orderCode = generateOrderCode();

  const [orderResult] = await pool.query(
    `INSERT INTO orders (
      user_id,
      total_price,
      status,
      payment_method,
      note,
      location,
      order_date,
      order_code,
      phone,
      fullname,
      promotion_id,
      shipping_fee,
      payment_status,
      paid_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      totalPrice,
      "pending",
      paymentMethod,
      note || null,
      location,
      orderCode,
      phone,
      fullname,
      promotionId || null,
      shippingFee || 0,
      "unpaid",
      null,
    ]
  );

  const orderId = orderResult.insertId;

  for (const item of cartItems) {
    const discount = item.discount || 0;
    const unitPrice = item.price * (1 - discount / 100);

    await pool.query(
      `INSERT INTO order_items (order_id, book_id, quantity, unit_price)
       VALUES (?, ?, ?, ?)`,
      [orderId, item.book_id, item.quantity, unitPrice.toFixed(2)]
    );
  }

  const bookIds = cartItems.map((item) => item.book_id);
  await cartService.clearCartByUser(userId, bookIds);

  return { orderId, orderCode };
};

const getOrdersByUser = async (userId) => {
  const [orders] = await pool.query(
    `SELECT 
      o.*, 
      p.id AS promotion_id,
      p.code AS promotion_code, 
      p.description AS promotion_description, 
      p.discount_type, 
      p.discount_value, 
      p.start_date AS promotion_start, 
      p.end_date AS promotion_end
    FROM orders o
    LEFT JOIN promotion p ON o.promotion_id = p.id
    WHERE o.user_id = ?
    ORDER BY o.order_date DESC`,
    [userId]
  );

  const orderIds = orders.map((order) => order.id);
  if (orderIds.length === 0) return [];

  const [orderItems] = await pool.query(
    `SELECT 
      oi.id AS order_item_id,
      oi.order_id,
      oi.book_id,
      oi.quantity,
      oi.unit_price,
      b.name AS book_name,
      bi.image_url AS book_image
    FROM order_items oi
    JOIN books b ON oi.book_id = b.id
    LEFT JOIN book_images bi ON b.id = bi.book_id AND bi.is_main = 1
    WHERE oi.order_id IN (?)`,
    [orderIds]
  );

  const itemsByOrder = {};
  orderItems.forEach((item) => {
    if (!itemsByOrder[item.order_id]) {
      itemsByOrder[item.order_id] = [];
    }
    itemsByOrder[item.order_id].push(item);
  });

  const fullOrders = orders.map((order) => {
    const {
      promotion_id,
      promotion_code,
      promotion_description,
      discount_type,
      discount_value,
      promotion_start,
      promotion_end,
      ...rest
    } = order;

    return {
      ...rest,
      promotion: promotion_id
        ? {
            id: promotion_id,
            code: promotion_code,
            description: promotion_description,
            discount_type,
            discount_value,
            start_date: promotion_start,
            end_date: promotion_end,
          }
        : null,
      items: itemsByOrder[order.id] || [],
    };
  });

  return fullOrders;
};

const cancelOrder = async (orderId, userId) => {
  const [[order]] = await pool.query(
    "SELECT * FROM orders WHERE id = ? AND user_id = ?",
    [orderId, userId]
  );

  if (!order || order.status !== "pending") {
    return false;
  }

  await pool.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [
    orderId,
  ]);

  return true;
};

const updatePaymentSuccess = async (orderCode) => {
  const [result] = await pool.query(
    `UPDATE orders
     SET payment_status = 'paid',
         paid_at = NOW()
     WHERE order_code = ?`,
    [orderCode]
  );

  return result;
};

const updatePaymentFailed = async (orderCode) => {
  const [result] = await pool.query(
    `UPDATE orders
     SET payment_status = 'failed',
         paid_at = NULL
     WHERE order_code = ?`,
    [orderCode]
  );

  return result;
};

export default {
  createOrder,
  getOrdersByUser,
  cancelOrder,
  updatePaymentSuccess,
  updatePaymentFailed,
};
