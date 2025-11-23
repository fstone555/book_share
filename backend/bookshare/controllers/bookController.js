const Book = require('../models/Book');

// สร้างหนังสือใหม่
exports.create = async (req, res) => {
  try {
    const { title, author, price, condition, categoryId, shortDescription } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];

    const book = await Book.create({
      title,
      author,
      price,
      condition,
      categoryId,
      shortDescription,
      images,
      userId: req.user._id
    });

    res.status(201).json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create book error', error: err.message });
  }
};

// ดึงรายการหนังสือ (สามารถ filter ด้วย sellerId)
exports.list = async (req, res) => {
  try {
    const { sellerId } = req.query;
    const filter = sellerId ? { userId: sellerId } : {};
    const books = await Book.find(filter);
    res.json(books);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'List books error', error: err.message });
  }
};

// ดึงหนังสือเดียว
exports.get = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Get book error', error: err.message });
  }
};

// อัปเดตหนังสือ
exports.update = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    const { title, author, price, condition, categoryId, shortDescription } = req.body;
    if (title) book.title = title;
    if (author) book.author = author;
    if (price) book.price = price;
    if (condition) book.condition = condition;
    if (categoryId) book.categoryId = categoryId;
    if (shortDescription) book.shortDescription = shortDescription;
    if (req.files && req.files.length > 0) book.images.push(...req.files.map(f => f.filename));

    await book.save();
    res.json(book);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update book error', error: err.message });
  }
};

// ลบหนังสือ
exports.remove = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.userId.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Forbidden' });

    await book.remove();
    res.json({ message: 'Book deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete book error', error: err.message });
  }
};

exports.listAll = async (req, res) => {
  try {
    const books = await Book.find().populate('categoryId', 'name').lean();
    const host = req.protocol + '://' + req.get('host');

    const booksWithImages = books.map(book => ({
      ...book,
      images: book.images.map(img => `${host}/uploads/${img}`)
    }));

    res.json(booksWithImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'List all books error', error: err.message });
  }
};

