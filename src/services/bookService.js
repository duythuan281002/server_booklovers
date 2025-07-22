import pool from "../config/connectDB.js";

const getAllBooks = async (
  limit,
  offset,
  sort,
  search,
  priceRanges,
  categoryId,
  subcategoryId
) => {
  let whereClause = "WHERE 1=1";
  const values = [];

  if (search) {
    whereClause += " AND b.name LIKE ?";
    values.push(`%${search}%`);
  }

  if (categoryId) {
    whereClause += " AND b.category_id = ?";
    values.push(categoryId);
  }

  if (subcategoryId) {
    whereClause += " AND b.subcategory_id = ?";
    values.push(subcategoryId);
  }

  const priceConditions = priceRanges
    .map((range) => {
      switch (range) {
        case "under-100":
          return "(b.price * (1 - b.discount / 100)) < 100000";
        case "100-400":
          return "(b.price * (1 - b.discount / 100)) BETWEEN 100000 AND 400000";
        case "400-800":
          return "(b.price * (1 - b.discount / 100)) BETWEEN 400000 AND 800000";
        case "above-800":
          return "(b.price * (1 - b.discount / 100)) > 800000";
        default:
          return "";
      }
    })
    .filter(Boolean);

  if (priceConditions.length > 0) {
    whereClause += ` AND (${priceConditions.join(" OR ")})`;
  }

  let sortClause = "";
  switch (sort) {
    case "newest":
      sortClause = "ORDER BY b.created_at DESC";
      break;
    case "discount-desc":
      whereClause += " AND b.discount > 0";
      sortClause = "ORDER BY b.discount DESC";
      break;
    case "price-asc":
      sortClause = "ORDER BY (b.price * (1 - b.discount / 100)) ASC";
      break;
    case "price-desc":
      sortClause = "ORDER BY (b.price * (1 - b.discount / 100)) DESC";
      break;
    default:
      sortClause = "";
  }

  const [rows] = await pool.query(
    `SELECT b.*, i.image_url AS main_image, c.name AS category_name
     FROM books b
     LEFT JOIN book_images i ON b.id = i.book_id AND i.is_main = 1
     LEFT JOIN categories c ON b.category_id = c.id
     ${whereClause}
     ${sortClause}
     LIMIT ? OFFSET ?`,
    [...values, Number(limit), Number(offset)]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total FROM books b ${whereClause}`,
    values
  );

  return {
    books: rows,
    total: countRows[0].total,
  };
};

const getBookById = async (id) => {
  // Lấy thông tin book chính
  const [bookRows] = await pool.query(`SELECT * FROM books WHERE id = ?`, [id]);
  const book = bookRows[0];

  if (!book) return null;

  // Lấy chi tiết book
  const [detailRows] = await pool.query(
    `SELECT * FROM book_details WHERE book_id = ?`,
    [id]
  );
  const bookDetail = detailRows[0] || null;

  // Lấy danh sách hình ảnh
  const [imageRows] = await pool.query(
    `SELECT image_url, is_main FROM book_images WHERE book_id = ?`,
    [id]
  );
  const bookImages = imageRows;

  return {
    book,
    bookDetail,
    bookImages,
  };
};

// Thêm sách mới
const createBook = async (bookData) => {
  const { name, category, shortdescription, longdescription, price, size } =
    bookData;

  const [result] = await pool.query(
    `INSERT INTO books (name, category, shortdescription, longdescription, price, size)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, category, shortdescription, longdescription, price, size]
  );

  // Trả lại sách vừa tạo
  const insertedId = result.insertId;
  return await getBookById(insertedId);
};

// Cập nhật sách
const updateBook = async (id, updateData) => {
  const { name, category, shortdescription, longdescription, price, size } =
    updateData;

  await pool.query(
    `UPDATE books SET name = ?, category = ?, shortdescription = ?, longdescription = ?, price = ?, size = ? WHERE id = ?`,
    [name, category, shortdescription, longdescription, price, size, id]
  );

  return await getBookById(id);
};

// Xóa sách
const deleteBook = async (id) => {
  const book = await getBookById(id);
  if (!book) return null;

  await pool.query("DELETE FROM books WHERE id = ?", [id]);
  return book;
};

export default {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
