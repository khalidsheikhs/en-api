require("dotenv").config();
// require("./config/database").connect();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// const User = require("./model/user");
const users = [
	{
		"_id": "0", 
		"first_name": "khalid",
		"last_name": "saeed",
		"email": "khalid.saeed@eremnews.com",
		"password": "$2a$10$jDUnQtg2oFbhY4AnlRafyOscVrii4ViLYKkLqwk8jvaDYDHdma236",
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzIiwiZW1haWwiOiJhYmNAZ21haWwuY29tIiwiaWF0IjoxNjc4MDk0NTE2LCJleHAiOjE2NzgxMDE3MTZ9.RSjjwrvNTqgFUf5VLKhNERjP9vam2rXjwu-ajlAo6YM", 
		"roles": ["2001"]
	}
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
        return res.status(400).json({
          success: "false",
          message: "Inputs required",
          error: {
              statusCode: 400,
              message: "You need to send all required fields to register user",
          },
      });
    }

    // check if user already exist
    // Validate if user exist in our database
    // const oldUser = await User.findOne({ email });
    let oldUser = users.filter(user => user.email === email);
	oldUser = oldUser[0];

    if (oldUser) {
      return res.status(409).json({
          success: "false",
          message: "User already registered",
          error: {
              statusCode: 409,
              message: "User is already registered you can login",
          },
      });
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    /*const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    });*/
	let user = { _id: Math.floor(Math.random() * Date.now()), first_name, last_name, email: email.toLowerCase(), password: encryptedPassword };

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "1h",
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
      return res.status(400).json({
          success: "false",
          message: "All inputs required",
          error: {
              statusCode: 400,
              message: "Please enter user's email and password to login",
          },
      });
    }
    // Validate if user exist in our database
    // const user = await User.findOne({ email });
    let user = users.filter(user => user.email === email);
	user = user[0];

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "1h",
        }
      );

      // save user token
      user.token = token;

      // user
      return res.status(200).json(user);
    } else {
        return res.status(400).json({
            success: "false",
            message: "Invalid creditionals",
            error: {
                statusCode: 400,
                message: "Please enter valid user information to login",
            },
        });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/users", auth, (req, res) => {
  // res.status(200).send("Welcome 🙌 ");
  let permittedValues = [];
  let count = 10;
  for (let i = 0; i < count; i++) {
    let user = {
		"_id": Math.floor(Math.random() * Date.now()),
		"first_name": 'first name ' + i,
		"last_name": 'last name ' + i,
		"email": 'email_' + i +'@email.com',
		"roles": ['200'+i]
	}
    permittedValues.push(user);
  } 
  return res.status(200).json(permittedValues);
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
