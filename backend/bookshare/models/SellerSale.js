const mongoose = require("mongoose");

const sellerSaleSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookTitle: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    status: { type: String, enum: ["รอดำเนินการ", "สำเร็จ"], default: "รอดำเนินการ" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SellerSale", sellerSaleSchema);
