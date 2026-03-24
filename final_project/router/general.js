const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


// ✅ Register New User
public_users.post("/register", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });

  return res.status(200).json({ message: "User registered successfully" });
});


// ✅ Get all books
public_users.get('/', function (req, res) {
  return res.status(200).json(books);
});


// ✅ Get book by ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  }

  return res.status(404).json({ message: "Book not found" });
});


// ✅ Get books by author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  let result = Object.values(books).filter(book =>
    book.author.toLowerCase() === author.toLowerCase()
  );

  return res.status(200).json(result);
});


// ✅ Get books by title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  let result = Object.values(books).filter(book =>
    book.title.toLowerCase() === title.toLowerCase()
  );

  return res.status(200).json(result);
});


// ✅ Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  }

  return res.status(404).json({ message: "Book not found" });
});
public_users.get('/async/books', async function (req, res) {

  const getBooks = () => {
    return new Promise((resolve, reject) => {
      resolve(books);
    });
  };

  let data = await getBooks();
  return res.status(200).json(data);
});
public_users.get('/async/isbn/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject("Book not found");
      }
    });
  };

  getBookByISBN(isbn)
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: err }));
});
// ✅ Task 11: ISBN using Axios
public_users.get('/async/isbn/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(err => {
      return res.status(404).json({ message: "Book not found" });
    });
});


// ✅ Task 12: Author using async/await
public_users.get('/async/author/:author', async function (req, res) {

  const author = req.params.author;

  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "Author not found" });
  }
});
public_users.get('/async/review/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/review/${isbn}`)
    .then(response => {
      return res.status(200).json(response.data);
    })
    .catch(err => {
      return res.status(404).json({ message: "Book not found" });
    });
});
public_users.get('/async/title/:title', async function (req, res) {

  const title = req.params.title;

  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(404).json({ message: "Title not found" });
  }
});


module.exports.general = public_users;
