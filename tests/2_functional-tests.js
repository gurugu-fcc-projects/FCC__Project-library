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

    suite.skip("GET /api/books/[id] => book object with [id]", function () {
      test("Test GET /api/books/[id] with id not in db", function (done) {
        //done();
      });

      test("Test GET /api/books/[id] with valid id in db", function (done) {
        //done();
      });
    });

    suite.skip(
      "POST /api/books/[id] => add comment/expect book object with id",
      function () {
        test("Test POST /api/books/[id] with comment", function (done) {
          //done();
        });

        test("Test POST /api/books/[id] without comment field", function (done) {
          //done();
        });

        test("Test POST /api/books/[id] with comment, id not in db", function (done) {
          //done();
        });
      }
    );

    suite.skip("DELETE /api/books/[id] => delete book object id", function () {
      test("Test DELETE /api/books/[id] with valid id in db", function (done) {
        //done();
      });

      test("Test DELETE /api/books/[id] with  id not in db", function (done) {
        //done();
      });
    });
  });
});
