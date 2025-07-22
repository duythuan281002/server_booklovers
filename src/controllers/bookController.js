import bookService from "../services/bookService.js";

const getAllBooks = async (req, res) => {
  const {
    page = 1,
    limit = 6,
    sort = "",
    search = "",
    prices = [],
    categoryId = null,
    subcategoryId = null,
  } = req.query;
  const offset = (page - 1) * limit;

  const priceRanges = Array.isArray(prices) ? prices : [prices];

  const result = await bookService.getAllBooks(
    limit,
    offset,
    sort,
    search,
    priceRanges,
    categoryId,
    subcategoryId
  );

  return res.status(200).json({
    status: "OK",
    message: "Fetched all books successfully",
    data: result.books,
    pagination: {
      total: result.total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(result.total / limit),
    },
  });
};

const getBookById = async (req, res) => {
  const id = req.params.id;
  const data = await bookService.getBookById(id);

  if (!data) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json({
    status: "OK",
    message: "Fetched book details successfully",
    data,
  });
};

const createBook = async (req, res) => {
  const bookData = req.body;
  const result = await bookService.createBook(bookData);
  return res.status(201).json(result);
};

const updateBook = async (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  const result = await bookService.updateBook(id, updateData);
  return res.status(200).json(result);
};

const deleteBook = async (req, res) => {
  const id = req.params.id;
  const result = await bookService.deleteBook(id);
  return res.status(200).json(result);
};

export default {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
