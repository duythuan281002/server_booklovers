import contactSercive from "../services/contactSercive";

const createContact = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const id = await contactSercive.createContact({
      name,
      email,
      phone,
      message,
    });

    res.status(201).json({
      message: "Gửi liên hệ thành công",
    });
  } catch (err) {
    console.error("Lỗi khi tạo liên hệ:", err);
    res.status(500).json({ message: "Lỗi server khi gửi liên hệ" });
  }
};

const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactSercive.getAllContacts();
    res.status(200).json({ status: "OK", data: contacts });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách liên hệ:", err);
    res.status(500).json({ message: "Lỗi server khi lấy liên hệ" });
  }
};

export default {
  createContact,
  getAllContacts,
};
