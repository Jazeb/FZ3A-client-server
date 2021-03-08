"use strict";

const express = require('express');

const addProductCtrl = require("../controllers/products.ctrl");
const router = express.Router();


router.post("/add", addProductCtrl.addProducts)
module.exports = router;