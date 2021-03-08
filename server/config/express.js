const fileUploader = require("express-fileupload");
const bodyParser = require("body-parser");
const httpError = require('http-errors');
const express = require("express");
const logger = require("morgan");
const cors = require('cors');


const authRoute = require("../authorization/routes/auth.route");
const employeeRoute = require("../employees/routes/index");
const productsRoute = require('../products/routes/index');
const supervisorRoute = require('../supervisor/routes/index');
const adminRoute = require("../admin/routes/index");
const passport = require("./passport");
const sessionCtrl = require('../session/session');
const customerRoute = require('../customer/routes/index');
const managerRoute = require('../manager/routes/index');

var app = express();

app.use(fileUploader());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(logger("dev"));
app.use(cors());


app.use("/api/auth", authRoute);
app.use("/api/employees", employeeRoute);
app.use("/api/products", productsRoute);
app.use("/api/admin", adminRoute);
app.use("/api/manager", managerRoute);
app.use("/api/labour", managerRoute);
app.use("/api/supervisor", supervisorRoute);
app.use("/api/mobile/customer", customerRoute);

app.get("/api/session", sessionCtrl.sessionLogin);

app.get('/', (req, res) => res.status(200).json({ status:true, message: 'server is running'}))
app.use((req, res, next) => next(httpError(404, 'Invalid URL')));

app.use((err, req, res, next) => {
    if (err.isJoi) {
        err.message = err.details.map((e) => e.message).join("; ");
        err.status = 400;
    }
    if(err.status == 404) return res.status(err.status).json({
        message: 'Invalid URL'
    });

    if(err.show == true) {
        res.status(err.status || 500).json({
            error:err.error,
            message: err.message,
            data:err.data
        });
    }

    else res.status(err.status || 500).json({
        message: 'Error in server'
    });
    
    return console.error(err)
});

module.exports = app;
