const express = require("express");
const passport = require("passport");

const authCtrl = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", passport.authenticate('user', { session: false }), authCtrl.userLogin);

module.exports = router;
