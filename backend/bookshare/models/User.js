const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String }, // ไม่ต้อง required อีกต่อไป
  role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
  avatar: { type: String },
  googleId: { type: String } // เก็บ id ของ Google
}, { timestamps: true });

// Hash password ก่อน save เฉพาะกรณีมี password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method สำหรับ compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false; // ไม่มี password -> false
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
