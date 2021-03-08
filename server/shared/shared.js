const _ = require('lodash');
const bcrypt = require('bcrypt');

const KEY = require('../config/keys').jwtSecret;
const { Users, Customers } = require('../model/index');
module.exports = {
    ValidateEmail,
    encryptPassword,
    generateToken,
    ValidatePassword,
    ValidateCustomer
}

function ValidateEmail(email) {
    return new Promise((resolve, reject) => {
        Users.findAll({
            where: { email }
        })
            .then((user) => _.isEmpty(user) ? resolve(true) : resolve(user))
            .catch((err) => reject(err));
    });
}

function ValidateCustomer(email) {
    return new Promise((resolve, reject) => {
        Customers.findAll({
            where: { email }
        })
            .then((user) => _.isEmpty(user) ? resolve(true) : resolve(user))
            .catch((err) => reject(err));
    });
}

function encryptPassword(password) {
    let salt = bcrypt.genSaltSync(10),
        hashed_password = bcrypt.hashSync(password, salt);
    return hashed_password;
}

function generateToken(user) {
    const payload = JSON.stringify(user);
    return jwt.sign(payload, KEY);
}

function ValidatePassword(id, curr_password) {
    return new Promise((resolve, reject) => {
        Users.findAll({where: { id }})
            .then((user) => {
                user = user[0]
                resolve(bcrypt.compareSync(curr_password, user.password))
            })
            .catch((err) => reject(err));
    });
}