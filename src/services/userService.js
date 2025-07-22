import pool from "../config/connectDB.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
require("dotenv").config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

const handleGoogleLogin = async (idToken) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name: fullname, picture: avatar } = payload;

  let user = await getUserByEmail(email);

  if (!user) {
    const role = "user";
    const password = "";
    const userData = { email, password, fullname, role, avatar };
    user = await createUser(userData);
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken: token, user };
};

export const handleFacebookLogin = async (accessToken) => {
  try {
    const fbResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const fbData = await fbResponse.json();

    if (!fbData.id) {
      throw new Error("Không lấy được thông tin người dùng từ Facebook.");
    }

    const facebook_id = fbData.id;
    const fullname = fbData.name;
    const email = fbData.email || `${facebook_id}@facebook.fake`;
    const avatar = "default.jpg";

    const [rowsByFbId] = await pool.query(
      "SELECT * FROM users WHERE facebook_id = ?",
      [facebook_id]
    );
    let user = rowsByFbId[0];

    if (!user) {
      const [rowsByEmail] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rowsByEmail.length > 0) {
        user = rowsByEmail[0];

        if (!user.facebook_id) {
          await pool.query("UPDATE users SET facebook_id = ? WHERE id = ?", [
            facebook_id,
            user.id,
          ]);
          user.facebook_id = facebook_id;
        }
      } else {
        const role = "user";
        const password = "";

        const [result] = await pool.query(
          `INSERT INTO users (email, password, fullname, role, avatar, facebook_id)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [email, password, fullname, role, avatar, facebook_id]
        );

        const insertedId = result.insertId;

        user = {
          id: insertedId,
          email,
          fullname,
          role,
          avatar,
          facebook_id,
        };
      }
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { accessToken: token, user };
  } catch (error) {
    console.error("Facebook login error:", error);
    throw new Error("Lỗi đăng nhập bằng Facebook");
  }
};

const getAllUsers = async (limit, offset) => {
  const [rows] = await pool.query("SELECT * FROM users LIMIT ? OFFSET ?", [
    limit,
    offset,
  ]);
  const [countRows] = await pool.query("SELECT COUNT(*) as total FROM users");

  return {
    users: rows,
    total: countRows[0].total,
  };
};

const getUserById = async (id) => {
  const [rows] = await pool.query(
    "SELECT id, email, fullname, avatar, birthday, gender, phone FROM users WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

const getUserAddresses = async (userId) => {
  const [rows] = await pool.query(
    `SELECT id, phone, address, fullname, is_default 
     FROM user_addresses 
     WHERE user_id = ? 
     ORDER BY is_default DESC`,
    [userId]
  );
  return rows;
};

const createUser = async (userData) => {
  const { email, password, fullname, role, avatar } = userData;

  const [result] = await pool.query(
    `INSERT INTO users (email, password, fullname,role,avatar)
     VALUES (?, ?, ?, ?, ?)`,
    [email, password, fullname, role, avatar]
  );

  const insertedId = result.insertId;
  return await getUserById(insertedId);
};

const updateUser = async (id, updateData) => {
  const { fullname, gender, birthday, avatar } = updateData;

  if (avatar) {
    await pool.query(
      `UPDATE users
       SET fullname = ?, gender = ?, birthday = ?, avatar = ?
       WHERE id = ?`,
      [fullname, gender, birthday, avatar, id]
    );
  } else {
    await pool.query(
      `UPDATE users
       SET fullname = ?, gender = ?, birthday = ?
       WHERE id = ?`,
      [fullname, gender, birthday, id]
    );
  }

  return await getUserById(id);
};

const updateUserPasswordByEmail = async (email, hashedPassword) => {
  await pool.query(`UPDATE users SET password = ? WHERE email = ?`, [
    hashedPassword,
    email,
  ]);

  return true;
};

const updatePassword = async (userId, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedPassword, userId]
  );
  return result;
};

const deleteUser = async (id) => {
  const user = await getUserById(id);
  if (!user) return null;

  await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return user;
};

const getUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0] || null;
};

const createAddress = async ({
  user_id,
  fullname,
  phone,
  address,
  is_default,
}) => {
  if (is_default) {
    await pool.query(
      "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?",
      [user_id]
    );
  }

  const [result] = await pool.query(
    `INSERT INTO user_addresses (user_id, fullname, phone, address, is_default)
     VALUES (?, ?, ?, ?, ?)`,
    [user_id, fullname, phone, address, is_default]
  );

  const [newAddress] = await pool.query(
    "SELECT * FROM user_addresses WHERE id = ?",
    [result.insertId]
  );

  return newAddress[0];
};

const updateAddress = async ({
  id,
  user_id,
  fullname,
  phone,
  address,
  is_default,
}) => {
  if (is_default) {
    await pool.query(
      "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?",
      [user_id]
    );
  }

  await pool.query(
    `UPDATE user_addresses 
     SET fullname = ?, phone = ?, address = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [fullname, phone, address, is_default, id, user_id]
  );

  const [updatedAddress] = await pool.query(
    "SELECT * FROM user_addresses WHERE id = ?",
    [id]
  );

  return updatedAddress[0];
};

const setDefaultAddress = async (user_id, address_id) => {
  await pool.query(
    "UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?",
    [user_id]
  );

  await pool.query(
    "UPDATE user_addresses SET is_default = TRUE WHERE id = ? AND user_id = ?",
    [address_id, user_id]
  );
};

const deleteAddress = async (id, user_id) => {
  await pool.query("DELETE FROM user_addresses WHERE id = ? AND user_id = ?", [
    id,
    user_id,
  ]);
};

const updateUserEmail = async (currentEmail, newEmail) => {
  const [result] = await pool.query(
    "UPDATE users SET email = ? WHERE email = ?",
    [newEmail, currentEmail]
  );
  return result.affectedRows > 0;
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  updateUserPasswordByEmail,
  getUserAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  updateUserEmail,
  updatePassword,
  handleGoogleLogin,
  handleFacebookLogin,
};
