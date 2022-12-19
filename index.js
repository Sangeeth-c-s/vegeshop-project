const express = require("express");
const app = express();

const ejs= require('ejs')

const mongoose = require('mongoose')
const dbpath = require("./config/connection");
mongoose.connect(dbpath.dbpath, () => {
  console.log("Database Connected.");
});

const User = require("./models/usermodel");
const Product = require("./models/productmodel");


const path = require("path");



app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use(express.static('public'));



const user_route = require("./routes/userRoute")
app.use('/', user_route)

const admin_route = require('./routes/adminroute')
app.use('/admin',admin_route)


app.listen(3000, () => {
  console.log("server is running...");
});
