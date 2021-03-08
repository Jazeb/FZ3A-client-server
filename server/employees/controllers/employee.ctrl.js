const _ = require('lodash');

const { employeeSignup, updateProfile } = require('../services/employee.service');
const { getAllData } = require('../../shared/queries/view');
const { ValidateEmail } = require('../../shared/shared');
const mailer = require('../../utils/mailer');
const resp = require('../../config/response');

module.exports = {
    sendEmailCtrl,
    getProfileCtrl,
    addEmployeeCtrl,
    ordersCtrl,
    updateProfileCtrl,
    updateProfileImage,
    getNotificationsCtrl
};

async function sendEmailCtrl(req, res) {
    const { email, url } = req.query;
    if(_.isEmpty(email) || _.isEmpty(url))
        return resp.apiError(res, 'Provide required data');

    try {
        let sent = await mailer.sendForgotEmail({email, url});
        return sent && resp.apiSuccess(res, 'Email sent successfully')
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'Error sending forgot email');
    }
}

function getProfileCtrl(req, res) {
    const id = req.user.user_id;
    getAllData({
        query: req.query,
        table_name: 'EMPLOYEES',
        id: id
    })
        .then((profile) => resp.apiSuccess(res, profile))
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error getting profile, error in server');
        });
}

async function addEmployeeCtrl(req, res) {
    try {
        var { full_name, email, national_id, service, password, ssn, role, areas, phone_number } = req.body;
        if (_.isEmpty(full_name) || _.isEmpty(email) || _.isEmpty(password) || _.isEmpty(role))
            return resp.apiError(res, 'Provide required data');

        if (!['SUPERVISOR', 'LABOUR', 'MANAGER'].includes(role))
            return resp.apiError(res, 'Invalid role provided');

        if (role == 'LABOUR' && _.isEmpty(service))
            return resp.apiError(res, 'provide service type');

        if (role == 'SUPERVISOR' && _.isEmpty(areas))
            return resp.apiError(res, 'provide areas for supervisor');

        let isValid = await ValidateEmail(email); // check if email already exists
        if (!_.isEmpty(isValid))
            return resp.apiError(res, 'user already exists with this email');

        areas = JSON.stringify(areas);
        const employee = { full_name, email, national_id, service, password, ssn, role, areas, phone_number };
        employeeSignup(employee)
            .then((employee) => resp.apiSuccess(res, employee))
            .catch((err) => {
                resp.apiError(res, 'error saving employee, ask you server developer');
                console.error(err);
            });
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error saving employee, ask you server developer');
    }
}

async function ordersCtrl(req, res) {
    const id = req.user.user_id;
    const data = {
        id, table_name: 'ORDERS',
        key: 'employee_id',
        employee_id: id,
        query: req.query,
        path: req.route.path
    }

    return getAllData(data)
        .then((orders) => resp.apiSuccess(res, { count: orders[0][1][0].count ? orders[0][1][0].count : 0, rows: orders[0][0] }))
        .catch((err) => {
            console.error(err);
            return resp.apiError(res, 'Error getting orders');
        });
}

function updateProfileCtrl(req, res) {
    try {
        const data = req.body;
        if (!['SUPERVISOR', 'MANAGER', 'LABOUR', 'EMPLOYEES'].includes(data.user_role))
            return resp.apiError(res, 'Invalid user role provided');

        data.user_id = req.user.user_id;
        return updateProfile(data)
            .then(() => resp.apiSuccess(res, 'user successfully updated'))
            .catch(err => {
                console.error(err)
                return resp.apiError(res, 'Error updating user profile')
            });
    } catch (err) {
        console.error(err);
        return resp.apiError(err, 'Error in server');
    }
}

async function updateProfileImage(req, res) {
    let { user_id, role } = req.user;
	try {
		if (_.isEmpty(req.files) || _.isEmpty(req.files.image))
            return resp.apiError(res, 'Image not selected');
            
        let file = req.files.image;
        fileName = '/image_' + Date.now() + '.' + file.name.replace(' ', '_').split('.').reverse()[0];
        
        let dest_url = process.cwd() + '/server/assets/profilePictures/' + fileName;
		file.mv(dest_url, async (err) => {
            if (err)
                return resp.apiError(res, 'Unable to upload image', err);
            
            let data = {user_id, user_role:role, image:fileName}
            let result = await updateProfile(data);
            result && resp.apiSuccess(res, 'Image uploaded sucessfully');
            return
        });
	} catch (err) {
		console.error(err);
		return resp.apiError(res, 'Error uploading image');
	}
}

function getNotificationsCtrl(req, res) {

    let data = {
        user_type: 'EMPLOYEE',
        table_name: 'NOTIFICATIONS',
    }
    if (!['SUPERVISOR', 'MANAGER', 'LABOUR'].includes(req.user.role)) {
        data.foreign_id = req.user.user_id
    }

    if (req.user.user_type == 'employee' && req.user.role == 'MANAGER') {
        // data.foreign_id = req.user.user_id
        data.user_type = 'MANAGER';
    }

    if (req.user.role == 'LABOUR') {
        data.foreign_id = req.user.user_id;
    }
    console.log(data);

    getAllData(data)
        .then(notifications => resp.apiSuccess(res, notifications))
        .catch(err => {
            resp.apiError(res, 'error getting notifications, error in server');
            console.error(err)
        });
}