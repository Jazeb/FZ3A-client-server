"use strict";
const express = require('express');
const passport = require('passport');

const adminCtrl = require('../controllers/adminCtrl');
const adminAddCtrl = require("../controllers/addCtrl");
const { get }  = require('../../shared/queries/redis');
const sharedCtrl = require('../../shared/controllers/shared.controllers');
const { adminAuth, statisticsAuth } = require('../../authorization/controllers/auth.controller');

const router = express.Router();

router.use('/productImage', express.static(process.cwd() + '/server/assets/products/'));
router.use('/offerImage', express.static(process.cwd() + '/server/assets/offers/'));
router.use('/serviceImage', express.static(process.cwd() + '/server/assets/services/'));

router.use(passport.authenticate("jwt", { session: false }));

router.post("/add/customers", adminAuth, adminAddCtrl.addCustomers);
router.post("/add/employee", adminAuth, adminAddCtrl.addEmployee);
router.post("/add/product", adminAuth, adminAddCtrl.addProducts);
router.post("/add/service", adminAuth, adminAddCtrl.addService);

router.post("/add/offer", adminAuth, adminAddCtrl.addOffers);
router.post("/add/order", adminAuth, adminAddCtrl.addOrders);


router.post("/deploy", adminCtrl.deployee);

router.post("/orders/assign", adminAuth, adminCtrl.assignOrderCtrl);
router.post("/order/reassign", adminAuth, adminCtrl.orderReassignCtrl);

router.delete('/delete', adminAuth, sharedCtrl.deleteCtrl);

router.put('/update', adminAuth, adminCtrl.updateCtrl);
router.put('/update/orderStatus', adminAuth, sharedCtrl.updateOrderStatus);
router.put("/update/subservices", adminAuth, adminAddCtrl.updateService);
router.put('/employee/updateStatus', adminAuth, adminCtrl.updateStatusCtrl)

router.get('/getProduct', adminAuth, adminCtrl.getProductCtrl); // get single product

router.get('/getProductOrders', adminAuth, adminCtrl.getProductOrderCtrl);
router.get('/getNotifications', adminAuth, adminCtrl.getNotifications);
router.get('/getProducts', adminAuth, adminCtrl.getProducts);
router.get('/getServices', adminAuth, adminCtrl.getServices);
router.get('/getEmployees', adminAuth, adminCtrl.getEmployees);
router.get('/getOffers', adminAuth, adminCtrl.getOffers);
router.get('/getCustomers', adminAuth, adminCtrl.getCustomers)
router.get('/getOrders', adminAuth, sharedCtrl.getOrderCtrl);
router.get('/getStatistics', statisticsAuth, sharedCtrl.statisticsCtrl);

router.get("/search/employee", adminCtrl.searchEmployeeCtrl);
router.get("/search/customers", adminCtrl.searchCustomersCtrl);

router.get("/reports", adminCtrl.reportsCtrl);
router.get("/customers", get, adminCtrl.customers);

module.exports = router;