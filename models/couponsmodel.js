const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  offertype: {
    type: String,
    required: true,
  },
  offer: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  valid: {
    type: Number,
  },
  status: {
    type: String,
  },
  code: {
     type: String,
  },
  usedBy: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("coupon", couponSchema);
