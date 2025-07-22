import pool from "../config/connectDB.js";

const getPromotionByCode = async (code) => {
  const [rows] = await pool.query(
    `SELECT * FROM promotion 
     WHERE code = ? 
     AND is_active = TRUE 
     AND NOW() BETWEEN start_date AND end_date`,
    [code]
  );
  return rows[0]; // Trả về undefined nếu không có
};

export default {
  getPromotionByCode,
};
