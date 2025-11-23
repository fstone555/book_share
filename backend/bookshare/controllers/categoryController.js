const Category = require('../models/Category');

exports.list = async (req, res) => {
  try {
    const cats = await Category.find();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: 'List categories error', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const existing = await Category.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Category already exists' });

    const c = await Category.create({ name });
    res.status(201).json(c);
  } catch (err) {
    res.status(500).json({ message: 'Create category error', error: err.message });
  }
};
