/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

const Book = require("../models/Book");

module.exports = function (app) {
  app
    .route("/api/books")
    .get(async (req, res) => {
      try {
        const books = await Book.aggregate()
          .addFields({ commentcount: { $size: "$comments" } })
          .project("-comments")
          .exec();

        //response will be array of book objects
        //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
        res.json(books);
      } catch (err) {
        console.log(err);
      }
    })

    .post(async (req, res) => {
      let title = req.body.title;

      if (!title) {
        return (
          res
            // .status(400)
            .type("text")
            .send("missing required field title")
        );
      }

      const book = await Book.create({ title });

      //response will contain new book object including atleast _id and title
      // res.status(201).json(book);
      res.json(book);
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(async (req, res) => {
      try {
        let bookid = req.params.id;

        const book = await Book.findById(bookid).exec();

        if (!book) {
          return res.type("text").send("no book exists");
        }

        //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
        res.status(200).json(book);
      } catch (err) {
        console.log(err.message);
      }
    })

    .post(async (req, res) => {
      let bookid = req.params.id;
      let comment = req.body.comment;

      try {
        if (!comment) {
          return res.type("text").send("missing required field comment");
        }

        const updatedBook = await Book.findByIdAndUpdate(
          bookid,
          { $push: { comments: comment } },
          { new: true }
        );

        if (!updatedBook) {
          return res.type("text").send("no book exists");
        }

        //json res format same as .get
        res.json(updatedBook);
      } catch (err) {
        console.log(err.message);
      }
    })

    .delete(async (req, res) => {
      let bookid = req.params.id;

      try {
        const deletedBook = await Book.findByIdAndRemove(bookid);

        if (!deletedBook) {
          return res.type("text").send("no book exists");
        }

        //if successful response will be 'delete successful'
        res.type("text").send("delete successful");
      } catch (err) {
        console.log(err.message);
      }
    });
};
