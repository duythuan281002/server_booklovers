import pool from "../config/connectDB.js";

const createContact = async ({ name, email, phone, message }) => {
  const [result] = await pool.query(
    `INSERT INTO contacts (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, NOW())`,
    [name, email, phone, message]
  );
  return result.insertId;
};

const getAllContacts = async () => {
  const [rows] = await pool.query(
    `SELECT * FROM contacts ORDER BY created_at DESC`
  );
  return rows;
};

export default {
  createContact,
  getAllContacts,
};
