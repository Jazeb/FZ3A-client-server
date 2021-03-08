"use strict";
const express = require('express');
const passport = require('passport');

const customerCtrl = require('../controllers/customer.ctrl');
const { customerAuth } = require('../../authorization/controllers/auth.controller');
const { addRatingsCtrl, updatePasswordCtrl, logout, forgotPasswordCtrl } = require('../../shared/controllers/shared.controllers');
const router = express.Router();

router.post("/signup", customerCtrl.addCustomerCtrl);
router.get("/checkUser", customerCtrl.checkUserCtrl);
router.get("/forgotPassword", forgotPasswordCtrl);
router.post("/forgotPassword", forgotPasswordCtrl);


router.use('/profileImage', express.static(process.cwd() + '/server/assets/profilePictures/'));
router.use('/serviceImage', express.static(process.cwd() + '/server/assets/services/'));
router.use('/productImage', express.static(process.cwd() + '/server/assets/products/'));
router.use('/offerImage', express.static(process.cwd() + '/server/assets/offers/'));
router.use('/static_image', express.static(process.cwd() + '/server/static_images/'));
router.use('/company', express.static(process.cwd() + '/server/templates/'));

router.use(passport.authenticate("jwt", { session: false }));

router.get("/profile", customerAuth, customerCtrl.getProfileCtrl);
router.get("/services", customerCtrl.getServices);
router.get("/offers", customerCtrl.getOffers);
router.get("/currentOrders", customerAuth, customerCtrl.getOrderhistory); // do not change this url
router.get("/ordersHistory", customerAuth, customerCtrl.getOrderhistory);
router.get("/getCurrentLocation", customerAuth, customerCtrl.getCurrentLocationCtrl);
router.get("/getNotifications", customerAuth, customerCtrl.getNotificationsCtrl);
router.get("/getShopItems", customerAuth, customerCtrl.getShopItemsCtrl);

router.post("/order/service", customerCtrl.placeOrderCtrl);
router.post("/order/shopItem", customerAuth, customerCtrl.orderShopItemCtrl);
router.put("/finishOrder", customerAuth, customerCtrl.orderCtrl);
router.put("/cancelOrder", customerAuth, customerCtrl.orderCtrl);
router.put("/updateLocation", customerAuth, customerCtrl.updateLocationCtrl);
router.put("/updateProfile", customerAuth, customerCtrl.updateProfileCtrl);
router.put("/updatePassword", updatePasswordCtrl);
router.post("/ratings/add", addRatingsCtrl);

router.put("/updateFCM", customerAuth, customerCtrl.updateFcmCtrl);
router.get("/logout", logout);

module.exports = router;