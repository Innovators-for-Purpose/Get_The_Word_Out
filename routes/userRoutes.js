const express = require("express");
const router = express.Router();
const userController = require("../controller/userController.js");

//router.get("/", userController.getAllUsers);
router.post("/register", userController.createUser);
//router.post("/login", userController.loginUser);

module.exports = router;