const jwt = require("jsonwebtoken");

const config = require("../../config/keys");
const resp = require("../../config/response");

module.exports = {
    userLogin,
    adminAuth,
    managerAuth,
    supervisorAuth,
    customerAuth,
    empAuth,
    statisticsAuth
};

let generateToken = (user) => jwt.sign(JSON.stringify(user), config.jwtSecret);

async function userLogin(req, res) {
    let user = req.user;
    delete user.password
    delete user.created_at
    delete user.updated_at
    let token = generateToken(user);
    return resp.apiSuccess(res, { user, token, status: "ACTIVE" });
}

function managerAuth(req, res, next){
    if(req.user && req.user.role == 'MANAGER' && req.user.user_type == 'employee') {
        next()
    }
    else return resp.apiError(res, 'Permission Denied', [], [], 403)
}

function empAuth(req, res, next){
    if(req.user && req.user.user_type == 'employee') {
        next()
    }
    else return resp.apiError(res, 'Permission Denied', [], [], 403)
}

function adminAuth(req, res, next){
    if(req.user && req.user.role == 'ADMIN' || req.user.role == 'SUPERVISOR') {
        next()
    }
    else return resp.apiError(res, 'Permission Denied', null, null, 403)
}

function supervisorAuth(req, res, next){
    if(req.user && req.user.role == 'SUPERVISOR' && req.user.user_type == 'employee') {
        next()
    }
    else return resp.apiError(res, 'Permission Denied', [], [], 403)
}

function customerAuth(req, res, next){
    if(req.user && req.user.user_type == 'customer' && req.user.role == null) {
        next()
    }
    else return resp.apiError(res, 'Permission Denied', null, null, 403)
}

function statisticsAuth(req, res, next){
    if(req.user && req.user.user_type == 'employee' || req.user.role == 'ADMIN' || req.user.role == 'MANAGER') {
        next()
    }
    else return resp.apiError(res, 'Permission Denied', null, null, 403)
}