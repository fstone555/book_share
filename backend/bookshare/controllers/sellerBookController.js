const Book = require("../models/Book");
const mongoose = require("mongoose");

// ดึงหนังสือทั้งหมดของผู้ขาย
exports.getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const books = await Book.find({ userId: sellerId })
      .populate("categoryId", "name")
      .lean();
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
  }
};

// ดึงหนังสือ 1 เล่ม
exports.getBookById = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const book = await Book.findOne({ _id: req.params.id, userId: sellerId })
      .populate("categoryId", "name")
      .lean();
    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลหนังสือได้" });
  }
};

// เพิ่มหนังสือใหม่
exports.createBook = async (req, res) => {
  try {
    const { title, author, price, categoryId, condition, shortDescription } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];

    let catId = categoryId && mongoose.isValidObjectId(categoryId) ? new mongoose.Types.ObjectId(categoryId) : undefined;

    const book = await Book.create({
      title,
      author,
      price,
      categoryId: catId,
      condition,
      shortDescription,
      images,
      userId: req.user._id,
    });

    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถเพิ่มหนังสือได้" });
  }
};

// แก้ไขหนังสือ + เก็บรูปเดิม + เพิ่มหลายรูป
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });
    if (!book.userId.equals(req.user._id)) return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไข" });

    const { title, author, price, categoryId, condition, shortDescription, keepImages } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (price) book.price = price;
    if (categoryId && mongoose.isValidObjectId(categoryId)) book.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (condition) book.condition = condition;
    if (shortDescription) book.shortDescription = shortDescription;

    // เก็บรูปเดิมที่ต้องการเก็บ
    let oldImages = [];
    if (keepImages) {
      try {
        oldImages = JSON.parse(keepImages); // keepImages เป็น array ของชื่อไฟล์
      } catch (err) {
        console.error("keepImages ไม่ถูกต้อง", err);
      }
    }

    // เพิ่มรูปใหม่ถ้ามี
    const newImages = req.files ? req.files.map(f => f.filename) : [];
    book.images = [...oldImages, ...newImages];

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถแก้ไขหนังสือได้" });
  }
};

// ลบหนังสือ
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });
    if (!book.userId.equals(req.user._id)) return res.status(403).json({ message: "ไม่มีสิทธิ์ลบ" });

    await book.remove();
    res.json({ message: "ลบหนังสือเรียบร้อยแล้ว" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// อัปเดตสถานะหนังสือ
exports.updateBookStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });
    if (!book.userId.equals(req.user._id)) return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไข" });

    book.status = status;
    await book.save();
    res.json({ message: "อัปเดตสถานะสำเร็จ", book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "อัปเดตสถานะไม่สำเร็จ" });
  }
};

// ค้นหาหนังสือของผู้ขาย
exports.searchSellerBooks = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { q } = req.query;

    const books = await Book.find({
      userId: sellerId,
      title: { $regex: q, $options: "i" },
    }).lean();

    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ค้นหาหนังสือไม่สำเร็จ" });
  }
};
