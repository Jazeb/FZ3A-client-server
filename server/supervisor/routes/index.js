"use strict";
const express = require('express');
const passport = require('passport');
const supervisorCtrl = require('../controllers/supervisor.controller');
const { updatePasswordCtrl } = require('../../shared/controllers/shared.controllers');
const shared = require('../../shared/controllers/shared.controllers');
const { get } = require('../../shared/queries/redis');
const { supervisorAuth } = require('../../authorization/controllers/auth.controller')

const router = express.Router();

router.post('/signup', supervisorCtrl.signupCtrl);

router.use(passport.authenticate("jwt", { session: false }));

router.get('/dashboard', supervisorCtrl.getDashboardCtrl);
router.get('/profile', supervisorCtrl.getProfileCtrl);
router.get('/getOrders', supervisorCtrl.getOrderCtrl);
router.get('/getServices', get, supervisorCtrl.getServices);
router.get('/getNotifications', supervisorCtrl.getNotifications);

router.put('/updateProfile', supervisorCtrl.updateProfileCtrl);
router.put('/updatePassword', updatePasswordCtrl);
router.get("/getCustomers", supervisorCtrl.getCustomers);

router.put("/update", supervisorCtrl.updateCtrl);

router.post("/orders/assign", supervisorAuth, supervisorCtrl.assignOrderCtrl);

module.exports = router;