import pool from "../config/connectDB.js";

const getAllBlogsPage = async (limit, offset) => {
  const [rows] = await pool.query(
    "SELECT * FROM blogs ORDER BY date DESC LIMIT ? OFFSET ?",
    [limit, offset]
  );
  const [countRows] = await pool.query("SELECT COUNT(*) as total FROM blogs");

  return {
    blogs: rows,
    total: countRows[0].total,
  };
};

const getFeaturedBlogs = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM blogs WHERE is_featured = 1 ORDER BY date DESC"
  );
  return rows;
};

// Lấy blog theo ID
const getBlogById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM blogs WHERE id = ?", [id]);
  return rows[0] || null;
};

// Tạo blog mới
const createBlog = async (data) => {
  const { title, description, image, author, is_featured } = data;

  const [result] = await pool.query(
    `INSERT INTO blogs (title, description, image, author, date, is_featured)
     VALUES (?, ?, ?, ?, CURDATE(), ?)`,
    [title, description, image, author, is_featured]
  );

  return await getBlogById(result.insertId);
};

// Cập nhật blog
const updateBlog = async (id, data) => {
  const { title, description, image, author, is_featured } = data;

  await pool.query(
    `UPDATE blogs SET title = ?, description = ?, image = ?, author = ?, is_featured = ?
     WHERE id = ?`,
    [title, description, image, author, is_featured, id]
  );

  return await getBlogById(id);
};

// Xóa blog
const deleteBlog = async (id) => {
  const blog = await getBlogById(id);
  if (!blog) return null;

  await pool.query("DELETE FROM blogs WHERE id = ?", [id]);
  return blog;
};

export default {
  getAllBlogsPage,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
};
