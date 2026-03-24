const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const users = require('./router/auth_users.js').users; // ✅ import users

const app = express();

app.use(express.json());

// Session setup
app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

// Auth middleware
app.use("/customer/auth", function auth(req, res, next) {

    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not logged in" });
    }

    let token = req.session.authorization['accessToken'];

    try {
        let decoded = jwt.verify(token, "access");
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid Token" });
    }
});

// Register
app.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (username && password) {

    let exists = users.some(user => user.username === username);
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(200).json({ message: "User registered successfully" });
  }

  return res.status(400).json({ message: "Invalid input" });
});


const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
