const express = require("express");
const routes = express.Router();
const multer = require("multer");
const path = require("path");
const Auth = require('../middleware/authJwt');
const appController = require("../controller/app.controller");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/uploads");
    },
    filename: (req, file, cb) => {
        cb(
            null,
            file.fieldname +
            "_" +
            Date.now() +
            "myImg" +
            path.extname(file.originalname)
        );
    }
});

const maxSize = 1 * 1024 * 1024;

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only JPG, PNG, & JPEG are allowed"));
        }
    },
    limits: { fileSize: maxSize },
});

routes.get("/", appController.showMasseg);
routes.post("/register", appController.register);
routes.post("/login", appController.login);

// Protecting the route to get the token after the login part
routes.use("/products", Auth.authJwt);

// Protected routes under /products
routes.get("/products/show", appController.fetchData);
routes.post("/products/create", upload.single("image"), appController.productCreation);
routes.delete("/products/delete/:id", appController.deletProduct);
routes.get("/products/edit/:id", appController.edit);
routes.put("/products/update/:id", upload.single("image"), appController.update);

routes.post("/logout", Auth.authJwt, appController.logout);

module.exports = routes;
