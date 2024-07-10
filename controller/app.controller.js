const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const appProductModel = require("../Model/app.productModel");
const fs = require('fs');
const util = require('util');
const appUserModel = require("../model/app.userModel");
const unlinkAsync = util.promisify(fs.unlink);

const secret = process.env.JWT_SECRET || "MERN2024";

class appController {
  async showMasseg(req, res) {
    try {
      return res.status(200).json({
        message: "Welcome To Our Api",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async register(req, res) {
    try {
      // console.log(req.body);
      req.body.name = req.body.name?.trim();
      req.body.email = req.body.email?.trim();
      req.body.password = req.body.password?.trim();
      // req.body.image = req.file.filename;

      if (!req.body.name || !req.body.email || !req.body.password ) {
        return res.status(400).json({
          message: "Fields should not be empty",
        });
      }

      let emailExists = await appUserModel.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(409).json({
          message: "User already exists",
        });
      }

      req.body.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
      let saveData = await appUserModel.create(req.body);
      if (saveData && saveData._id) {
        let token = jwt.sign(
          {
            id: saveData._id,
            name: saveData.name,
            email: saveData.email
            // image: saveData.image,
          },
          secret,
          { expiresIn: "2d" }
        );

        saveData = saveData.toObject();
        saveData.token = token;

        return res.status(201).json({
          message: "Data added successfully",
          data: saveData,
        });
      } else {
        return res.status(500).json({
          message: "Data not added successfully",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      let user = await appUserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        secret,
        { expiresIn: "2d" }
      );

      user = user.toObject();
      user.token = token;

      return res.status(200).json({
        message: "Login successful",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  }

  async productCreation(req, res) {
    try {
        console.log(req.body); 
        console.log(req.file); 
        const { productName, productPrice } = req.body;
        const image = req.file;

        if (!productName || !productPrice || !image) {
            return res.status(400).json({
                message: "Product name, price, and image are required",
            });
        }

        const newProduct = {
            productName,
            productPrice,
            image: image.filename,
            user: req.user.id,
        };

        const savedProduct = await appProductModel.create(newProduct);

        return res.status(201).json({
            message: "Product created successfully",
            data: savedProduct,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Error creating product. Please try again later.",
            error: error.message,
        });
    }
}


  async fetchData(req, res) {
    try {
      const userId = req.user.id;
      const products = await appProductModel.find({ user: userId });

      return res.status(200).json({
        message: "Data fetched successfully",
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching product data",
        error: error.message,
      });
    }
  }

  async deletProduct(req, res) {
    try {
      const productId = req.params.id;

      if (!productId) {
        return res.status(400).json({
          message: "Please provide product ID",
        });
      }

      const deletedProduct = await appProductModel.findByIdAndDelete(productId);
      if (!deletedProduct) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      if (deletedProduct.image) {
        await unlinkAsync(`./public/uploads/${deletedProduct.image}`);
      }

      return res.status(200).json({
        message: "Product deleted successfully",
        data: deletedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error deleting product",
        error: error.message,
      });
    }
  }

  async edit(req, res) {
    try {
      const product = await appProductModel.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      return res.status(200).json({
        message: "Product fetched successfully",
        data: product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error fetching product",
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { productName, productPrice } = req.body;
      const image = req.file;

      const product = await appProductModel.findById(id);

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }

      const updatedProduct = {
        productName: productName || product.productName,
        productPrice: productPrice || product.productPrice,
        image: image ? image.filename : product.image,
        user: product.user,
      };

      const result = await appProductModel.findByIdAndUpdate(id, updatedProduct, { new: true });

      if (image && product.image) {
        await unlinkAsync(`./public/uploads/${product.image}`);
      }

      return res.status(200).json({
        message: "Product updated successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error updating product",
        error: error.message,
      });
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id; 
      await appModel.findByIdAndUpdate(userId, { token: null }); 
      res.setHeader('x-access-token', 'null'); 

      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error) {
      // console.error(error)
      return res.status(500).json({
        message: "Error logging out"
      });
    }
  }
}

module.exports = new appController();
