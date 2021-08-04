/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;

const server = require("../server");
const Book = require("../models/Book");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  setup(async () => await Book.deleteMany());

  /*
   * ----[EXAMPLE TEST]----
   * Each test should completely test the response of the API end-point including response status code!
   */
  test.skip("#example Test GET /api/books", function (done) {
    chai
      .request(server)
      .get("/api/books")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body, "response should be an array");
        assert.property(
          res.body[0],
          "commentcount",
          "Books in array should contain commentcount"
        );
        assert.property(
          res.body[0],
          "title",
          "Books in array should contain title"
        );
        assert.property(
          res.body[0],
          "_id",
          "Books in array should contain _id"
        );
        done();
      });
  });
  /*
   * ----[END of EXAMPLE TEST]----
   */

  suite("Routing tests", () => {
    suite(
      "POST /api/books with title => create book object/expect book object",
      () => {
        test("Test POST /api/books with title", done => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Book 1" })
            .end((err, res) => {
              // assert.equal(res.status, 201, "Must return 201 status");
              assert.isObject(res.body, "Must return the book");
              assert.equal(
                res.body.title,
                "Book 1",
                "Must return the created book"
              );

              done();
            });
        });

        test("Test POST /api/books with no title given", done => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "" })
            .end((err, res) => {
              // assert.equal(res.status, 400, "Must return 400 status");
              assert.isString(res.text, "Must return a string");
              assert.equal(
                res.text,
                "missing required field title",
                "Must return a proper error message"
              );

              done();
            });
        });
      }
    );

    suite("GET /api/books => array of books", () => {
      test("Test GET /api/books", done => {
        const requester = chai.request(server).keepOpen();
        const data = ["The Hobbit", "Harry Potter", "Lord of the Rings"];

        Promise.all([
          requester.post("/api/books").send({ title: data[0] }),
          requester.post("/api/books").send({ title: data[1] }),
          requester.post("/api/books").send({ title: data[2] }),
        ])
          .then(responses => {
            chai
              .request(server)
              .get("/api/books")
              .end((err, res) => {
                assert.isArray(res.body);
                assert.lengthOf(res.body, 3);

                res.body.forEach(book => {
                  assert.isObject(book);
                  assert.property(book, "title");
                  assert.isTrue(data.includes(book.title));
                  assert.property(book, "commentcount");
                  assert.isNumber(book.commentcount);
                  assert.property(book, "_id");
                });

                done();
              });
          })
          .then(() => requester.close())
          .catch(err => console.log(err));
      });
    });

    suite("GET /api/books/[id] => book object with [id]", () => {
      test("Test GET /api/books/[id] with id not in db", done => {
        chai
          .request(server)
          .get("/api/books/5f665eb46e296f6b9b6a504d")
          .end((err, res) => {
            assert.isString(res.text, "Must return a string");
            assert.equal(
              res.text,
              "no book exists",
              "Must return a proper error message"
            );

            done();
          });
      });

      test("Test GET /api/books/[id] with valid id in db", done => {
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Space Troopers" })
          .end((err, res) => {
            const bookId = res.body._id;

            chai
              .request(server)
              .get(`/api/books/${bookId}`)
              .end((err, res) => {
                assert.isObject(res.body);
                assert.property(res.body, "title");
                assert.equal(res.body.title, "Space Troopers");
                assert.property(res.body, "comments");
                assert.isArray(res.body.comments);
                done();
              });
          });
      });
    });

    suite(
      "POST /api/books/[id] => add comment/expect book object with id",
      () => {
        test("Test POST /api/books/[id] with comment", done => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Fight Club" })
            .end((err, res) => {
              const bookId = res.body._id;

              chai
                .request(server)
                .post(`/api/books/${bookId}`)
                .send({ comment: "Life changing!" })
                .end((err, res) => {
                  assert.isObject(res.body);
                  assert.property(res.body, "title");
                  assert.equal(res.body.title, "Fight Club");
                  assert.property(res.body, "comments");
                  assert.isArray(res.body.comments);
                  assert.equal(res.body.comments[0], "Life changing!");
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] without comment field", done => {
          chai
            .request(server)
            .post("/api/books")
            .send({ title: "Fight Club" })
            .end((err, res) => {
              const bookId = res.body._id;

              chai
                .request(server)
                .post(`/api/books/${bookId}`)
                .end((err, res) => {
                  assert.isString(res.text, "Must return a string");
                  assert.equal(
                    res.text,
                    "missing required field comment",
                    "Must return a proper error message"
                  );
                  done();
                });
            });
        });

        test("Test POST /api/books/[id] with comment, id not in db", done => {
          chai
            .request(server)
            .post("/api/books/5f665eb46e296f6b9b6a504d")
            .end((err, res) => {
              assert.isString(res.text, "Must return a string");
              assert.equal(
                res.text,
                "no book exists",
                "Must return a proper error message"
              );
              done();
            });
        });
      }
    );

    suite("DELETE /api/books/[id] => delete book object id", () => {
      test("Test DELETE /api/books/[id] with valid id in db", done => {
        chai
          .request(server)
          .post("/api/books")
          .send({ title: "Fight Club 2" })
          .end((err, res) => {
            const bookId = res.body._id;

            chai
              .request(server)
              .delete(`/api/books/${bookId}`)
              .end((err, res) => {
                assert.isString(res.text, "Must return a string");
                assert.equal(
                  res.text,
                  "delete successful",
                  "Must return a proper success message"
                );
                done();
              });
          });
      });

      test("Test DELETE /api/books/[id] with  id not in db", done => {
        chai
          .request(server)
          .delete("/api/books/5f665eb46e296f6b9b6a504d")
          .end((err, res) => {
            assert.isString(res.text, "Must return a string");
            assert.equal(
              res.text,
              "no book exists",
              "Must return a proper error message"
            );
            done();
          });
      });
    });
  });
});
