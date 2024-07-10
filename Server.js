require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const port = process.env.PORT || 3035;
const driver = process.env.MONGO_URL;
const path = require("path");

// Middleware
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json({ limit: '50mb' }));
app.use("/images" , express.static(path.join(__dirname , "public/uploads" )))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Routes
const router = require("./router/app.routes")
const jwtAuth = require("./middleware/authJwt")
app.use(router);
app.use(jwtAuth.authJwt);

// Connect to Our Database
mongoose
  .connect(driver, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database Connected");
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
  });
