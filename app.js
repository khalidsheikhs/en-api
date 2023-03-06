require("dotenv").config();
// require("./config/database").connect();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// const User = require("./model/user");
const users = [
  { "first_name": "khalid", "last_name": "saeed", "email": "abc@gmail.com", "password": "123", "token": "", "roles": ["2001"] },
  { "first_name": "naveed", "last_name": "saeed", "email": "cde@gmail.com", "password": "123", "token": "", "roles": ["2002"] },
  { "first_name": "asad", "last_name": "saeed", "email": "efg@gmail.com", "password": "123", "token": "", "roles": ["2003"] },
  { "first_name": "amjad", "last_name": "saeed", "email": "fgh@gmail.com", "password": "123", "token": "", "roles": ["2004"] },
  { "first_name": "farhad", "last_name": "saeed", "email": "fgh@gmail.com", "password": "123", "token": "", "roles": ["2005"] }
];

const auth = require("./middleware/auth");

const allowedOrigins = [
  'http://localhost:3000',
  'http://yourapp.com'
];

app.use(cors({
  credentials: true,
  origin: function(origin, callback){
    // allow requests with no origin
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      let msg = 'The CORS policy for this site does not ' +
          'allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  }
}))
    .use(express.json({ limit: "50mb" }))
    .use(express.urlencoded({extended:false}));

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    // const oldUser = await User.findOne({ email });
    let oldUser = users.filter(user => user.email === email);

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    // const user = await User.findOne({ email });
    let user = users.filter(user => user.email === email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
