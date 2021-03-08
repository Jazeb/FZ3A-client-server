"use strict";
const express = require('express');
const passport = require('passport');

const empCtrl = require('../controllers/employee.ctrl');
const { empAuth } = require('../../authorization/controllers/auth.controller');
const { supervisorAuth } = require('../../authorization/controllers/auth.controller');
const sharedCtrl = require('../../shared/controllers/shared.controllers')
const router = express.Router();

router.post("/signup", empCtrl.addEmployeeCtrl);
router.post("/sendMail", empCtrl.sendEmailCtrl);
router.post("/resetPassword", sharedCtrl.forgotPasswordCtrl);

router.use(passport.authenticate("jwt", { session: false }));

router.get("/getNotifications", empCtrl.getNotificationsCtrl);
router.get("/profile", empCtrl.getProfileCtrl); // change it for all users
router.get('/getStatistics', empAuth, sharedCtrl.statisticsCtrl);
router.get("/getOrders", empCtrl.ordersCtrl);

router.put("/updateProfile", empCtrl.updateProfileCtrl);
router.put('/update/orderStatus', supervisorAuth, sharedCtrl.updateOrderStatus);
router.put("/updateProfilePicture", empCtrl.updateProfileImage);
router.post("/ratings/add", sharedCtrl.addRatingsCtrl);
router.get("/ratings/view", sharedCtrl.viewRatingsCtrl);
router.put("/updatePassword", sharedCtrl.updatePasswordCtrl);

router.delete('/delete', supervisorAuth, sharedCtrl.deleteCtrl);

module.exports = router;