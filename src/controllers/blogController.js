import blogService from "../services/blogService.js";

const getAllBlogsPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    const result = await blogService.getAllBlogsPage(limit, offset);

    res.status(200).json({
      status: "OK",
      data: result.blogs,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (err) {
    console.error("Error getting blogs:", err);
    res.status(500).json({ status: "ERROR", message: "Lỗi khi lấy blog" });
  }
};

const getFeaturedBlogs = async (req, res) => {
  try {
    const blogs = await blogService.getFeaturedBlogs();
    res.status(200).json({
      status: "OK",
      data: blogs,
    });
  } catch (error) {
    console.error("Lỗi khi lấy blog nổi bật:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blogId = req.params.id;
    const blog = await blogService.getBlogById(blogId);

    if (!blog) {
      return res.status(404).json({ message: "Không tìm thấy blog" });
    }

    res.status(200).json({
      status: "OK",
      data: blog,
    });
  } catch (err) {
    console.error("Error getting blog by ID:", err);
    res.status(500).json({ message: "Lỗi server khi lấy blog" });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, author } = req.body;
    const image = req.file ? req.file.filename : null;

    const newBlog = await blogService.createBlog({
      title,
      content,
      author,
      image,
    });

    res.status(201).json({ message: "Tạo blog thành công", data: newBlog });
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ message: "Lỗi khi tạo blog" });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { title, content, author } = req.body;
    const image = req.file ? req.file.filename : null;

    const updated = await blogService.updateBlog(blogId, {
      title,
      content,
      author,
      image,
    });
    res.status(200).json({ message: "Cập nhật thành công", data: updated });
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ message: "Lỗi khi cập nhật blog" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const deleted = await blogService.deleteBlog(blogId);

    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy blog để xóa" });
    }

    res.status(200).json({ message: "Xóa blog thành công", data: deleted });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ message: "Lỗi khi xóa blog" });
  }
};

export default {
  getAllBlogsPage,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getFeaturedBlogs,
};
