const express = require("express");
const Book = require("../models/book");
const jsonschema = require("jsonschema");
const bookSchema = require("../schemas/bookSchema.json")
const updateBookSchema = require("../schemas/updateBookSchema.json")

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */


router.post("/", async function (req, res, next) {
  try {
    const response = jsonschema.validate(req.body, bookSchema);
    if(!response.valid){
      return next({
        status: 400,
        error: response.errors.map(e => e.stack)
    });
  }
  const newBook = await Book.create(req.body.book)
  return res.status(201).json({newBook});
  } catch (err) {
    return next(err);
  }
});

//help from solutions
router.put("/:isbn", async function (req, res, next) {
  try {
    if('isbn' in req.body){
      return next({
        status: 400,
        message: "Not allowed"
      });
    }
    const response = jsonschema.validate(req.body, updateBookSchema);
    if(!response.valid){
      return next({
        status: 400,
        errors: response.errors.map(e => e.stack)
      });
    }const book = await Book.update(req.params.isbn, req.body.book);
    return res.json({ book })
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
