const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    comments: {
      type: [String],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

BookSchema.virtual("commentcount").get(function () {
  return this.comments.length();
});

const Book = mongoose.model("Book", BookSchema);

module.exports = Book;
