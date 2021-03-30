process.env.NODE_ENV = "test"

const { response } = require("express");
const request = require("supertest");

const app = require("../app");
const db = require("../db");

//sample
let test_isbn;

beforeEach(async function(){
    let result = await db.query(`
        INSERT INTO
        books (isbn, amazon_url, author, language, pages, publisher, title, year)
        VALUES(
            '12345567890',
            'https://amazon.com/asdf',
            'GregoryM',
            'Merica',
            100,
            'peigin publishers',
            'hey you',
            1962)
            RETURNING isbn`);

        test_isbn = result.rows[0].isbn
});

describe("POST /books", function () {
    test("Creates a new book", async function () {
      const response = await request(app)
          .post(`/books`)
          .send({book: {
            isbn: '32794782',
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "amazing times",
            year: 2000}
          });
        //   console.log(response.body)
      expect(response.statusCode).toBe(201);
      expect(response.body.newBook).toHaveProperty("isbn");
    });
})

describe("GET /books routes", function(){
    test('get a list of all books', async function() {
    const res = await request(app).get('/books');
    const books = res.body.books;
    expect(books[0]).toHaveProperty("title");
});
})

describe("PUT /books/:id", function(){
    test('get a list of all books', async function() {
        const res =await request(app)
        .put(`/books/${test_isbn}`)
        //from solutions
        //still cant get to work
        .send({
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
          });
          console.log(res.body.book)
        expect(res.body.book).toHaveProperty("isbn");
        expect(res.body.book.title).toBe("UPDATED BOOK");
    })

    test("prevents updating a null book", async function(){
        const response = await request(app)
        .put(`/books/${test_isbn}`)
        .send({
            isbn: "32794782",
            badField: "DO NOT ADD ME!",
            amazon_url: "https://taco.com",
            author: "mctest",
            language: "english",
            pages: 1000,
            publisher: "yeah right",
            title: "UPDATED BOOK",
            year: 2000
        })
        expect(response.statusCode).toBe(400);
    })
})



afterEach(async function() {
    await db.query("DELETE FROM BOOKS");
})


afterAll(async function() {
    await db.end()
})