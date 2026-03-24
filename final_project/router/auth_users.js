const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

// Check username exists
const isValid = (username) => {
  return users.some(user => user.username === username);
}

// Check username & password
const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
}

// Login
regd_users.post("/login", (req,res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  if (authenticatedUser(username, password)) {

    let accessToken = jwt.sign(
      { data: username },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken: accessToken,
      data: username
    };

    return res.status(200).json({ message: "User successfully logged in" });

  } else {
    return res.status(401).json({ message: "Invalid Login" });
  }
});

// Add/Modify Review
regd_users.put("/auth/review/:isbn", (req, res) => {

  if (!req.session.authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }

  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.data;

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully" });
  }

  return res.status(404).json({ message: "Book not found" });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
