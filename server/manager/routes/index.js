"use strict";
const passport = require('passport');
const express = require('express');
const productCtrl = require('../controllers/product.controller');
const empCtrl = require('../../employees/controllers/employee.ctrl')
const sharedCtrl = require('../../shared/controllers/shared.controllers');
const managerAuth = require('../../authorization/controllers/auth.controller').managerAuth;

const router = express.Router();

router.use(passport.authenticate("jwt", { session: false }));

router.get('/getProducts', managerAuth, productCtrl.getProducts);
router.get('/getProduct', managerAuth, productCtrl.getProduct);
router.get("/getNotifications", empCtrl.getNotificationsCtrl);
router.get('/getProductOrders', managerAuth, productCtrl.getProductOrders);

router.post('/add/product', managerAuth, productCtrl.addProduct);
router.delete('/delete', managerAuth, sharedCtrl.deleteCtrl);
router.put('/updateStatus', managerAuth, productCtrl.updateStatus);
router.put('/update', managerAuth, productCtrl.updateCtrl);
router.put('/updateProductStatus', managerAuth, productCtrl.updateStatus);
router.put("/updatePassword", sharedCtrl.updatePasswordCtrl);
router.put('/update/product', managerAuth, productCtrl.updateProduct);

module.exports = router;