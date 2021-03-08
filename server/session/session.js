const _ = require('lodash');

const resp = require('../config/response');
const {Sessions} = require('../model/index');

module.exports = {
    sessionLogin,
    createSession
};

function sessionLogin(req, res) {
    let session_id = req.params.id;
    if(_.isEmpty(session_id))
        resp.apiError(res, 'provide session id');
    
}

function createSession(data) {
    return new Promise((resolve, reject) => {
        Sessions.create({
            session_id:data.session_id,
            email:data.emp_email,
            user_type:data.user_type
        })
        .then((added) => resolve(true))
        .catch((err) => reject(err));
    });
}