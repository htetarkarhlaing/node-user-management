const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//importing the dotenv & custom modules
require('dotenv').config();

const route = require('./routers/routes');

//connecting the MongoDB
const dbUrl = process.env.DB;

mongoose.connect( dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).then(() => {
  console.log('Database Connected');
}).catch((err)=>{
  console.log(err);
});

//express instants and middlewares
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use("/api", route);

//declearingt the Port usng dotenv
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    `Server is running on port : ${PORT}.\nvisit http://localhost:${PORT}/api`
  );
});