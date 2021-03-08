const _ = require('lodash');
const jwt = require('jsonwebtoken');
const moment = require('moment');

const resp = require('../../config/response');
const response = require('../../config/response');
const { ValidateEmail } = require('../../shared/shared');
const { assignOrder } = require('../../admin/services/admin.services');
const { update } = require('../../shared/queries/update');
const { supervisorSignup, updateProfile } = require('../services/supervisor');
const { notifyEmployee, notifyCustomer } = require('../../shared/queries/create');
const { set } = require('../../shared/queries/redis');
const { getById } = require('../../shared/queries/getById');
const view = require('../../shared/queries/view');

const RADIUS = 50 // in km

module.exports = {
    getOrderCtrl,
    getCustomers,
    getServices,
    updateProfileCtrl,
    assignOrderCtrl,
    getDashboardCtrl,
    getNotifications,
    getProfileCtrl,
    signupCtrl,
    updateCtrl
}

async function getOrderCtrl(req, res) {
    try {
        let supervisor_orders = []
        let supervisor = await getById({ id: 9, table_name: 'EMPLOYEE' });
        let orders = await view.getAllData({ table_name: 'ORDERS', query: req.query });
        let areas = JSON.parse(supervisor.areas);

        orders = orders[0][0];

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            let customer_address = order.address;
            customer_address = JSON.parse(customer_address);

            let distances = customer_address && haversine_distance(customer_address, areas);
            console.log('Distances', distances);
            // [{"address":"397 Service Rd E, I-9/3 I 9/3 I-9, Islamabad, Islamabad Capital Territory, Pakistan","lat":34.1671686,"long":73.2237177,"selected":false,"title":""},{"address":"Unnamed Road, Faizabad I 8/4 I-8, Islamabad, Islamabad Capital Territory, Pakistan","lat":34.1671686,"long":73.2237177,"selected":false,"title":""},{"address":"7th Avenue Metro Bus Station, F-8 Markaz G 7/3 F-8, Islamabad, Islamabad Capital Territory, Pakistan","lat":34.1671686,"long":73.2237177,"selected":true,"title":""}]
            customer_address && distances.forEach(distance => {
                if (distance <= RADIUS) {
                    supervisor_orders.push(order)
                }
            });
            let { customer_location } = order
            order.customer_location = JSON.parse(customer_location).filter(loc => loc.selected == true)[0].address
            
            if (i == orders.length - 1) {
                supervisor_orders = [... new Set(supervisor_orders)];
                resp.apiSuccess(res, { rows: supervisor_orders });
                set('ORDER_' + req.query.status, JSON.stringify(supervisor_orders))
                break
            }
        }
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error getting orders, error in server');
    }
}

async function updateCtrl(req, res) {
    try {
        const body = req.body;
        if (!['ORDER', 'SERVICE', 'EMPLOYEE', 'CUSTOMER', 'PRODUCT', 'OFFER', 'SERVICE'].includes(body.table_name))
            return resp.apiError(res, 'invalid table type');

        if (!['SUPERVISOR', 'MANAGER'].includes(req.user.role))
            return resp.apiError(res, 'Invalid role');

        let updated = await update(body);
        return updated && resp.apiSuccess(res, 'Updated successfully');
    } catch (err) {
        console.error(err);
        return resp.apiError(res, `error updating ${body.table_name}, must be server error :)`)
    }
}

async function assignOrderCtrl(req, res) {
    const { order_id, employee_id, employee_name, employee_email, price } = req.body;
    if (!price || !order_id || !employee_id || _.isEmpty(employee_name) || _.isEmpty(employee_email))
        return resp.apiError(res, 'Provide required data');

    try {
        let employee = await getById({ id: employee_id, table_name: 'EMPLOYEE' });
        if (_.isEmpty(employee))
            return resp.apiError(res, 'Employee not found with this id');

        if (+price == NaN || typeof +price !== 'number' || +price < 0)
            return resp.apiError(res, 'Invalid price ' + price);

        let order = await getById({ id: order_id, table_name: 'ORDER' });
        if (_.isEmpty(order))
            return resp.apiError(res, 'Order does not exist with this id');

        if (order[0].status !== 'PENDING')
            return resp.apiError(res, `Order is already ${order[0].status}`);

        let details = { order_id, employee_id, employee_name, employee_email, price },
            employee_msg = `You have been assigned a new order by Admin, please check order page for details.`,
            customer_msg = `${order[0].service_type} is assigned to you.`;

        let data_cust = {
            foreign_id: order[0].customer_id,
            message: customer_msg,
            image: employee.image
        }
        let data_emp = {
            foreign_id: employee_id,
            message: employee_msg,
        }
        Promise.all([notifyEmployee(data_emp), notifyCustomer(data_cust), assignOrder(details)])
            .then(() => {
                return resp.apiSuccess(res, `Order assigned to ${employee_name}`)
            })
            .catch(err => {
                console.error(err)
                return resp.apiError(err, 'Error assigning labour')
            })
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error in server')
    }
}

function getCustomers(req, res) {
    return view.getAllData({ table_name: 'CUSTOMERS' })
        .then((customers) => {
            return resp.apiSuccess(res, { count: customers[0][1][0].count ? customers[0][1][0].count : 0, rows: customers[0][0] })
        })
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error getting customers, error in server');
        });
}

function getServices(req, res) {
    return view.getAllData({
        table_name: 'SERVICES',
        query: req.query
    })
        .then((services) => {
            set('SERVICE', JSON.stringify(services))
            resp.apiSuccess(res, services)
        })
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error getting services, error in server :)');
        });
}
function updateProfileCtrl(req, res) {
    const user = req.user;
    try {
        const { full_name, phone_number, national_id, ssn } = req.body;
        if (_.isEmpty(full_name) || !phone_number || !national_id || !ssn)
            return resp.apiError(res, 'Please all required data');
        const data = { user, full_name, phone_number, national_id, ssn }

        updateProfile(data)
            .then(() => resp.apiSuccess(res, 'user successfully updated'))
            .catch((err) => resp.apiError(res, err));
    } catch (error) {
        resp.apiError(err, 'error in server');
        console.error(error);
    }
}

function getNotifications(req, res) {
    view.getAllData({
        user_type: 'ADMIN',
        query: req.query,
        table_name: 'NOTIFICATIONS',
    })
        .then((notifications) => resp.apiSuccess(res, notifications))
        .catch((err) => {
            resp.apiError(res, 'error getting notifications, error in server');
            console.error(err)
        });
}

async function getDashboardCtrl(req, res) {

    try {
        let table_name = 'ORDERS';
        let orders = await view.getAllData({ table_name });
        let completed = orders.rows.filter(order => order.status == 'COMPLETED');
        let pending = orders.rows.filter(order => order.status == 'PENDING');
        let ongoing = orders.rows.filter(order => order.status == 'ONGOING');
        response.apiSuccess(res, { completed, pending, ongoing });
    } catch (err) {
        console.log(err);
        return response.apiError(res, 'unable to get products', err);
    }
}

function getProfileCtrl(req, res) {
    const id = req.user.id;
    view.getAllData({
        query: req.query,
        table_name: 'SUPERVISOR',
        id: id
    })
        .then((profile) => resp.apiSuccess(res, profile))
        .catch((err) => {
            resp.apiError(res, 'error getting profile, error in server');
            throw new Error(err);
        });
}

async function signupCtrl(req, res) {
    try {
        const { full_name, email, national_id, ssn, password, confirm_password } = req.body;
        if (_.isEmpty(full_name) || _.isEmpty(email) || _.isEmpty(password) || _.isEmpty(confirm_password))
            return resp.apiError(res, 'Provide required data');

        if (!_.isMatch(password, confirm_password))
            return resp.apiError(res, 'Passwords must match');

        let isValid = await ValidateEmail(email); // check if email is already used

        if (!isValid && isValid == false)
            return resp.apiError(res, 'user already exists with this email');

        const supervisor = { full_name, email, national_id, ssn, password };
        let generateToken = (user) => jwt.sign(JSON.stringify(user), config.jwtSecret);

        supervisorSignup(supervisor)
            .then((user) => {
                let token = generateToken(user);
                user.created_at = moment().format();
                user.updated_at = moment().format();
                resp.apiSuccess(res, { user: user, token, status: "ACTIVE" })
            })
            .catch((err) => {
                resp.apiError(res, 'error saving supervisor, ask you server developer');
                console.error(err);
            });
    } catch (error) {
        console.error(error);
        resp.apiError(res, 'error saving supervisor, ask you server developer');
    }
}

function haversine_distance(customer_address, areas) {
    let dist = []
    let lat, long, R = 3958.8, rlat1, rlat2, d, difflat, difflon;

    areas.forEach(area => {
        lat = area.lat
        long = area.long
        rlat1 = customer_address.lat * (Math.PI / 180); // Convert degrees to radians
        rlat2 = lat * (Math.PI / 180); // Convert degrees to radians
        difflat = rlat2 - rlat1; // Radian difference (latitudes)
        difflon = (customer_address['long'] - long) * (Math.PI / 180); // Radian difference (longitudes)
        d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat / 2) * Math.sin(difflat / 2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.sin(difflon / 2) * Math.sin(difflon / 2)));
        dist.push(parseFloat(d).toFixed(2))
    });
    return dist
}