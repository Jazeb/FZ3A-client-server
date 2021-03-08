const _ = require('lodash');
const resp = require('../../config/response');
const { updatePassword, addRatings, updateStatus } = require('../queries/update');
const { notifyCustomer, notifyEmployee } = require('../queries/create');
const { deleteRecord } = require('../../shared/queries/delete');
const { ValidatePassword } = require('../shared');
const mailer = require('../../utils/mailer');
const view = require('../../shared/queries/view');
const { set } = require('../queries/redis');

module.exports = {
    updatePasswordCtrl,
    forgotPasswordCtrl,
    addRatingsCtrl,
    viewRatingsCtrl,
    updateOrderStatus,
    statisticsCtrl,
    getOrderCtrl,
    deleteCtrl,
    logout
}

async function updatePasswordCtrl(req, res) {
    try {
        const { isSocial_login, id } = req.user;

        if (!isSocial_login) {
            const { curr_password, new_password } = req.body;
            if (_.isEmpty(curr_password) || _.isEmpty(new_password)) {
                return resp.apiError(res, 'provide current and new password');
            }
            else if (curr_password === new_password) {
                return resp.apiError(res, 'new password must be different from current password');
            }
            else {
                let isValidCurrentPassword = await ValidatePassword(id, curr_password)
                if (!isValidCurrentPassword || isValidCurrentPassword == false) {
                    return resp.apiError(res, 'current password is invalid');
                } else {
                    let data = { id, curr_password, new_password };
                    let isUpdated = await updatePassword(data);
                    return isUpdated && resp.apiSuccess(res, 'Password updated successfully');
                }
            }
        }
        else {
            const { new_password, confirm_password } = req.body;
            if (new_password !== confirm_password) {
                return resp.apiError(res, 'Password should be same');
            }
            else {
                let data = { id, new_password, reset:true }
                try {
                    let isUpdated = await updatePassword(data);
                    if (isUpdated)
                        return resp.apiSuccess(res, 'Password updated successfully');
                } catch (err) {
                    console.error(err)
                    return resp.apiError(res, 'Error updating password');
                }
            }

        }
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'something wrong in server');
    }
}

async function forgotPasswordCtrl(req, res) {
    try {
        let method = req.route.methods;

        if (method.post) {
            let { new_password, confirm_password, email } = req.body;
            if (_.isEmpty(new_password) || _.isEmpty(confirm_password) || _.isEmpty(email))
                return resp.apiError(res, 'Provide required data');

            let user = await view.getAllData({ table_name: 'USERS', email });
            if (_.isEmpty(user))
                return resp.apiError(res, 'User does not exist with this email');

            if (new_password !== confirm_password)
                return resp.apiError(res, 'Password should be same');

            let data = { id: user.id, new_password }
            try {
                let isUpdated = await updatePassword(data);
                if (isUpdated)
                    return resp.apiSuccess(res, 'Password updated successfully.');
            } catch (err) {
                console.error(err)
                return resp.apiError(res, 'Error updating password');
            }
        }
        else {
            let { email, url } = req.query;
            if (_.isEmpty(email))
                return resp.apiError(res, 'Provide email');

            let user = await view.getAllData({ table_name: 'USERS', email });
            if (_.isEmpty(user))
                return resp.apiError(res, 'User does not exist with this email');
            
            url = url || `https://dashboard.fz3a.com/resetPassword?email=${email}`
            let data = {
                email, url, name: user.full_name
            }
            try {
                let sent = await mailer.sendForgotEmail(data);
                return sent && resp.apiSuccess(res, 'Email sent ');
            } catch (err) {
                console.error(err)
                return resp.apiError(res, 'Error sending email')
            }
        }
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'Error in server')
    }
}

async function addRatingsCtrl(req, res) {
    let token = req.user;
    let type = token.user_type == 'employee' ? 'EMPLOYEE' : token.user_type == 'customer' ? 'CUSTOMER' : null
    const { user_id, stars, order_id } = req.body;

    if (!stars || stars > 5)
        return resp.apiError(res, 'Invalid stars');

    if (!['CUSTOMER', 'EMPLOYEE'].includes(type))
        return resp.apiError(res, 'Invalid type selected'); // who is rating

    table_name = req.user.user_type == 'customer' ? 'CUSTOMERS' : 'EMPLOYEES';

    let user = await view.getAllData({ table_name, id: req.user.user_id });
    user = user.rows[0];

    try {
        let ratings = {
            rate_by: req.user.id,
            rate_to: user_id,
            stars: stars,
            order_id,
            type: type // who is rating
        };
        let msg = token.user_type == 'employee' && token.role == 'LABOUR' ? `${user.service} rated you` : `${user.full_name} rated you`;
        let data = {
            message: msg,
            foreign_id: user_id,
            image: user.image
        }

        return token.user_type == 'employee'
            ? Promise.all([addRatings(ratings), notifyCustomer(data)]).then(rated => rated && resp.apiSuccess(res, 'Rating updated')).catch(err => console.error(err))
            : Promise.all([addRatings(ratings), notifyEmployee(data)]).then(rated => rated && resp.apiSuccess(res, 'Rating updated')).catch(err => console.error(err))
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'something is wrong in server')
    }
}

async function viewRatingsCtrl(req, res) {
    let order = await view.get({ employee_id: req.user.user_id, employee_reviewed:false, status:'COMPLETED' });
    return resp.apiSuccess(res, order)
}

async function deleteCtrl(req, res) {
    try {
        let { id, type } = req.query;
        if (!id)
            return resp.apiError(res, 'provide order id');

        if (!['ORDER', 'EMPLOYEE', 'MANAGER', 'SUPERVISOR', 'LABOUR', 'CUSTOMER', 'PRODUCT', 'PRODUCT_ORDER', 'OFFER', 'SERVICE'].includes(type))
            return resp.apiError(res, 'invalid type provided');

        type = type == 'SUPERVISOR' ? 'EMPLOYEE' : type
        type = type == 'LABOUR' ? 'EMPLOYEE' : type
        let data = {
            table_name: type,
            where: { id }
        }
        try {
            let deleted = await deleteRecord(data);
            return deleted && resp.apiSuccess(res, `${type} deleted successfully`);
        } catch (error) {
            console.error(error)
            return resp.apiError(res, `Error deleting ${type}, check server`)
        }
    } catch (error) {
        console.error(error)
        return resp.apiError(res, `Error deleting ${type}, check server`)
    }
}

async function statisticsCtrl(req, res) {
    try {
        let role = req.user.role,
            { start_time, end_time, range } = req.query
            params = { role, range, start_time, end_time, id:req.user.user_id }
        
        if(!['ADMIN', 'SUPERVISOR', 'LABOUR', 'EMPLOYEE', 'MANAGER'].includes(role))
            return resp.apiError(res, 'You are not allowed');

        let stats = await view.getStatistics(params);
        return resp.apiSuccess(res, stats)
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'Error getting statistics');
    }
}

async function getOrderCtrl(req, res) {
    try {
        req.query.path = req.route.path
        let orders = await view.getAllData({ table_name: 'ORDERS', query: req.query })
        // set('ORDER_' + req.query.status, JSON.stringify(orders))
        
        let data = {
            count: orders[0][1][0].count,
            rows:orders[0][0]
        }
        return resp.apiSuccess(res, data);
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error getting orders, error in server');
    }
}

function logout(req, res) {
    // console.log(req.session);
    // req.logout();
    return resp.apiSuccess(res, 'User logged out');
}

async function updateOrderStatus(req, res) {
    let { status, order_id } = req.body;
    if (!['COMPLETED', 'CANCELLED', 'ONGOING', 'PENDING'].includes(status))
        return resp.apiError(res, 'invalid status provided');

    if (!order_id)
        return resp.apiError(res, 'order id is required');

    let data = { id: order_id, status, table_name: 'ORDERS' }
    try {
        let updated = await updateStatus(data);
        if (updated)
            return resp.apiSuccess(res, 'Order updated successfully');
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'Error updating Order')
    }
}