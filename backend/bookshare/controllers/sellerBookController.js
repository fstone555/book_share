// backend/controllers/sellerBookController.js
const Book = require("../models/Book");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Notification = require('../models/Notification');


// ดึงหนังสือทั้งหมดของผู้ขาย
exports.getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const books = await Book.find({ userId: sellerId })
      .populate("categoryId", "name")
      .populate("userId", "name email")
      .lean();

    const host = req.protocol + "://" + req.get("host");
    const booksWithImages = books.map(b => ({
      ...b,
      images: b.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`)
    }));

    res.json(booksWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงหนังสือ" });
  }
};



// เพิ่มหนังสือใหม่
exports.createBook = async (req, res) => {
  try {
    const { title, author, price, categoryId, condition, shortDescription } = req.body;
    if (!title || !author || !price || !categoryId || !condition)
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบ" });

    const catId = mongoose.isValidObjectId(categoryId) ? new mongoose.Types.ObjectId(categoryId) : null;
    if (!catId) return res.status(400).json({ message: "categoryId ไม่ถูกต้อง" });

    const images = req.files ? req.files.map(f => f.filename) : [];

    const book = await Book.create({
      title,
      author,
      price: Number(price),
      categoryId: catId,
      condition,
      shortDescription,
      images,
      userId: req.user._id,
      status: "pending" // เพิ่มบรรทัดนี้
    });

    res.status(201).json({ message: "เพิ่มหนังสือสำเร็จ รอการอนุมัติจากแอดมิน", book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถเพิ่มหนังสือได้", error: err.message });
  }
};





// แก้ไขหนังสือ
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });
    if (!book.userId.equals(req.user._id)) return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไข" });

    const { title, author, price, categoryId, condition, shortDescription, keepImages } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (price) book.price = Number(price);
    if (condition) book.condition = condition;
    if (categoryId && mongoose.isValidObjectId(categoryId)) book.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (shortDescription) book.shortDescription = shortDescription;

    // เก็บภาพเก่าที่ต้องการเก็บ
    let oldImages = [];
    if (keepImages) {
      try { oldImages = JSON.parse(keepImages); } catch (err) { console.error(err); }
    }

    // เพิ่มรูปใหม่
    const newImages = req.files ? req.files.map(f => f.filename) : [];
    book.images = [...oldImages, ...newImages];

    await book.save();

    const host = req.protocol + "://" + req.get("host");
    book.images = book.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`);

    res.json({ message: "แก้ไขหนังสือสำเร็จ", book });
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
    const { status, isSold } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });
    if (!book.userId.equals(req.user._id)) return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไข" });

    if (status) book.status = status;
    if (typeof isSold === "boolean") book.isSold = isSold;

    await book.save();

    const bookPopulated = await Book.findById(book._id)
      .populate("categoryId", "name")
      .populate("userId", "name email")
      .lean();

    res.json({ message: "อัปเดตสำเร็จ", book: bookPopulated });
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
    })
      .populate("categoryId", "name")
      .populate("userId", "name email")
      .lean();

    const host = req.protocol + "://" + req.get("host");
    const booksWithImages = books.map(b => ({
      ...b,
      images: b.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`)
    }));

    res.json(booksWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ค้นหาหนังสือไม่สำเร็จ" });
  }
};

// ดึงหนังสือทั้งหมด
exports.listAll = async (req, res) => {
  try {
    const books = await Book.find()
      .populate("categoryId", "name")
      .populate("userId", "name email")
      .lean();

    const host = req.protocol + "://" + req.get("host");
    const booksWithImages = books.map(b => ({
      ...b,
      images: b.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`)
    }));

    res.json(booksWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "List all books error", error: err.message });
  }
};


exports.getSellerOrderDetail = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("items.bookId", "title price images userId") // ข้อมูลหนังสือ
      .lean();

    if (!order) return res.status(404).json({ message: "Order ไม่พบ" });

    // filter items ของ seller คนนี้
    const sellerItems = order.items.filter(
      item => item.sellerId.toString() === sellerId.toString()
    );

    if (sellerItems.length === 0)
      return res.status(404).json({ message: "ไม่มีสินค้าของคุณใน order นี้" });

    res.json({
      _id: order._id,
      buyerName: order.name,
      address: order.address,
      phone: order.phone,
      status: order.status,
      createdAt: order.createdAt,
      items: sellerItems,
      total: sellerItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};


exports.listPendingBooks = async (req, res) => {
  try {
    const books = await Book.find({ status: "pending" })
      .populate("categoryId", "name")
      .populate("userId", "name email")
      .lean();

    const host = req.protocol + "://" + req.get("host");
    const booksWithImages = books.map(b => ({
      ...b,
      images: b.images.map(img => img.startsWith("http") ? img : `${host}/uploads/books/${img}`)
    }));

    res.json(booksWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถดึงหนังสือ pending ได้" });
  }
};

// sellerBookController.js
exports.updateBookStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const book = await Book.findById(id).populate('userId');
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (req.user.role !== 'admin') return res.status(403).json({ message: 'ไม่มีสิทธิ์แก้ไข' });

    book.status = status;
    await book.save();

    // สร้าง Notification
    await Notification.create({
      userId: book.userId._id,
      message: status === 'approved'
        ? `หนังสือ "${book.title}" ของคุณได้รับการอนุมัติแล้ว`
        : `หนังสือ "${book.title}" ของคุณถูกปฏิเสธ`,
      link: `/seller/books`,
      read: false,
    });

    res.json({ message: 'Status updated', book });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ดึงหนังสือ 1 เล่ม สำหรับรายละเอียด
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("categoryId", "name")   // <-- ตรงนี้
      .populate("userId", "name email")
      .lean();

    if (!book) return res.status(404).json({ message: "ไม่พบหนังสือ" });

    // แปลง path รูปภาพเป็น URL
    const host = req.protocol + "://" + req.get("host");
    book.images = book.images.map(img =>
      img.startsWith("http") ? img : `${host}/uploads/books/${img}`
    );

    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "ไม่สามารถดึงข้อมูลหนังสือได้", error: err.message });
  }
};

