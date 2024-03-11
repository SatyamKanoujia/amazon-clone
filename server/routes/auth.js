const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middlewares/auth");



//Create Account

authRouter.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
      .status(400)
      .json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user = new User({
      name,
      email,
      password: hashedPassword,
    });
    user = await user.save();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Login

authRouter.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign({ _id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
    // above means in user object, we have id, name, email, password and we are adding token to it and sending it back
    // ...user._doc means we are spreading the user object and adding token to it
    // user._doc means we are getting all the properties of user object except password
    // we are not sending password back to the client
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/tokenIsValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    if (!verified) return res.json(false);

    const user = await User.findById(verified._id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

authRouter.get("/", auth, async (req, res) => {
  const user = await User.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

module.exports = authRouter;
