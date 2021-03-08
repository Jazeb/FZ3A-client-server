const _ = require('lodash');
const moment = require('moment');
const jwt = require("jsonwebtoken");

const resp = require('../../config/response');
const mailer = require('../../utils/mailer');
const config = require("../../config/keys");
const { ValidateEmail, ValidateCustomer } = require('../../shared/shared');
const { getById } = require('../../shared/queries/getById');
const { update } = require('../../shared/queries/update');
const { getAllData, getTotalOrders } = require('../../shared/queries/view');
const { del } = require('../../shared/queries/redis');
const { notifyAdmin, notifyManager, notifySupervisor, notifyEmployee } = require('../../shared/queries/create');
const { customerSignup, orderShopItem, placeOrder, updateOrder, updateLocation, updateProfile, getCurrentLocation } = require('../services/customer.service');
// const fcm = require('../../config/fcm');
const { VAT, ORDERS_LIMIT } = require('../../config/constants.json');

module.exports = {
    getOffers,
    getProfileCtrl,
    addCustomerCtrl,
    getServices,
    orderShopItemCtrl,
    placeOrderCtrl,
    orderCtrl,
    checkUserCtrl,
    updateFcmCtrl,
    getShopItemsCtrl,
    getOrderhistory,
    updateProfileCtrl,
    updateLocationCtrl,
    getNotificationsCtrl,
    getCurrentLocationCtrl
};

let generateToken = (user) => jwt.sign(JSON.stringify(user), config.jwtSecret);

async function getOffers(req, res) {
    try {
        let offers = await getAllData({ table_name: 'OFFERS', query: req.query });
        offers = offers.rows.filter(offer => offer.active == true)
        return resp.apiSuccess(res, { count: offers.length, rows: offers });
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error getting offers, error in server');
    }
}

async function getProfileCtrl(req, res) {
    const id = req.user.user_id; // use user_id to get profile data
    try {
        let customer = await getAllData({ table_name: 'CUSTOMERS', id: id })
        return resp.apiSuccess(res, customer)
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error getting profile, error in server');
    }
}

let socialSignup = (user) => {
    return new Promise((resolve, reject) => {
        if (!['FACEBOOK', 'APPLE', 'GOOGLE'].includes(user.social_login))
            return reject('invalid social login');

        customerSignup(user)
            .then((customer) => {
                let token = generateToken(customer);
                customer.created_at = moment().format();
                customer.updated_at = moment().format();
                return resolve({ user: customer, token, status: "ACTIVE" });
            })
            .catch((err) => {
                console.error(err);
                return reject('Error creating customer')
            });
    });
}

let userSignup = (user) => {
    return new Promise((resolve, reject) => {
        customerSignup(user)
            .then((customer) => {
                let token = generateToken(customer);
                customer.created_at = moment().format();
                customer.updated_at = moment().format();
                return resolve({ user: customer, token, status: "ACTIVE" });
            })
            .catch((err) => {
                console.error(err);
                return reject('Error creating customer')
            });
    });
}

async function addCustomerCtrl(req, res) {
    try {
        const { full_name, email, phone_number, password, confirm_password, isSocial_login, social_login, access_token } = req.body;

        let user = await ValidateEmail(email); // check if email is already used
        // if (user !== true)
        //     return resp.apiError(res, 'Customer already registered with this id');

        user = user[0];
        if (user && user.user_type == 'customer' && user.isSocial_login == true && ['FACEBOOK', 'GOOGLE', 'APPLE'].includes(user.social_login)) {
            let token = generateToken(user);
            return resp.apiSuccess(res, { user, token, status: "ACTIVE" });
        }

        if (!user && user == false)
            return resp.apiError(res, 'User already exists with this email');

        if (isSocial_login) {
            if (_.isEmpty(social_login) || _.isEmpty(access_token))
                return resp.apiError(res, 'invalid value for social login or access token');

            let user = { full_name, email, phone_number, isSocial_login, social_login, access_token }
            let created = await socialSignup(user);
            return created && resp.apiSuccess(res, created);
        }

        else {
            let customer = await ValidateCustomer(email);
            if (customer.length > 0)
                return resp.apiError(res, 'Customer already registered with this email');

            if (_.isEmpty(password) || password !== confirm_password)
                return resp.apiError(res, 'invlaid password or password does not match');

            let user = { full_name, email, phone_number, isSocial_login: false, password, confirm_password }
            let created = await userSignup(user);
            return created && resp.apiSuccess(res, created);
        }
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'Error creating user');
    }
}

async function updateFcmCtrl(req, res) {
    try {
        const fcm_token = req.body.fcm_token;
        if (_.isEmpty(fcm_token))
            return resp.apiError(res, 'Provide FCM token');

        let id = req.user.user_id;
        let data = { fcm_token, id, table_name: 'CUSTOMER' }
        let updated = await update(data)
        return updated && resp.apiSuccess(res, 'FCM token updated successfully');
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'Error updating FCM token');
    }
}

async function orderShopItemCtrl(req, res) {
    try {
        let user = req.user;
        let { item_id, quantity } = req.body;
        if (!item_id || !quantity)
            return resp.apiError(res, 'Provide required data');

        let item = await getById({ table_name: 'PRODUCTS', id: item_id });
        if (_.isEmpty(item))
            return resp.apiError(res, 'Item does not exist with this id');

        let customer = await getById({ id: user.user_id, table_name: 'CUSTOMER' });
        if (_.isEmpty(customer))
            return resp.apiError(res, 'customer not found');

        let data = { item_id, quantity, user }
        let created = await orderShopItem(data);

        let manager_data = {
            image: customer[0].image,
            message: `${user.full_name} placed order for ${item.title}`
        }
        created && notifyManager(manager_data).then(async () => {
            // del('PRODUCT_ORDER_PENDING')
            let updated = await update({ table_name: 'PRODUCTS', remaning: true, item_id, quantity });
            updated && resp.apiSuccess(res, 'Order created successfully');
            return
        });
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error placing shop item')
    }
}

async function placeOrderCtrl(req, res) {
    try {
        const cust = req.user;
        let current_order = await getById({ key: 'placeOrder', customer_id: cust.user_id, table_name: 'ORDER' }) // see if there is already pending order for this customer

        let { service_type, service_id, todo, notes, datetime, single_image } = req.body;
        if (_.isEmpty(service_type) || _.isEmpty(todo) || _.isEmpty(datetime))
            return resp.apiError(res, 'Provide required data');

        let total_orders = await getTotalOrders();
        if (total_orders > ORDERS_LIMIT)
            return resp.apiError(res, 'Orders limit exceeds, try tommorrow');

        let customer = await getById({ id: cust.user_id, table_name: 'CUSTOMER' });
        if (_.isEmpty(customer))
            return resp.apiError(res, 'customer not found');

        current_order = current_order.filter(order => order.service_id == service_id || order.service_type == service_type);

        if (!_.isEmpty(current_order))
            return resp.apiError(res, `You cannot place another order for ${service_type}`);

        // if (!_.isEmpty(current_order))
        //     return resp.apiError(res, 'You already have a pending or ongoing order, cannot place another order');

        todo = _.join(todo)

        let files = []

        if (single_image == true || single_image == 'true') {
            files.push(req.files.images)
        }
        else {
            files = req.files && req.files.images ? req.files.images : null;
        }
        // req.files.images && typeof req.files.images == 'object'
        //     ? files.push(req.files.images)
        //     : files = req.files.images;

        let fileNames = [];

        !_.isEmpty(files) && _.forEach(files, (file) => {
            let fileName = file.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName
            let dest_url = process.cwd() + '/server/assets/services' + fileName;
            file.mv(dest_url);
            fileNames.push(fileName);
        });

        fileNames = _.join(fileNames, '__');
        customer = customer[0];

        let location = customer.location && JSON.parse(customer.location)
        let address = location && location.filter((loc) => loc.selected == true);
        address = address[0]
        if (_.isEmpty(address))
            return resp.apiError(res, 'Please select atleast one address');

        delete address.selected
        delete address.title
        delete address.address
        address = JSON.stringify(address);

        const data = { service_type, todo, address, notes, datetime, images: fileNames, service_id };
        placeOrder(data, cust).then(
            placed => {
                del('ORDER_PENDING')
                let msg = `${customer.full_name} ordered for ${service_type} service`;
                let admin_data = {
                    user_type: 'ADMIN', // for
                    message: msg,
                    image: customer.image,
                    role: customer.role || 'CUSTOMER' // who
                }
                let supervisor_data = {
                    user_type: 'SUPERVISOR', // for
                    message: msg,
                    image: customer.image,
                    role: customer.role || 'CUSTOMER' // who
                }
                msg = `New Order has been placed by ${customer.full_name}`;
                Promise.all[notifyAdmin(admin_data), notifySupervisor(supervisor_data), sendEmailToUser(msg)];
                return placed && resp.apiSuccess(res, 'Order placed');
            })
            .catch((err) => {
                console.error(err);
                return resp.apiError(res, 'error placing order')
            });
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'Error placing order', null, err)
    }
}

function getServices(req, res) {
    const data = {
        table_name: 'SERVICES',
    }
    getAllData(data)
        .then(services => {
            const rows = services[0];
            const count = services[0].length;
            return resp.apiSuccess(res, { count, rows })
        })
        .catch((err) => {
            console.error(err);
            return resp.apiError(res, 'error getting orders');
        });
}

async function checkUserCtrl(req, res) {
    let email = req.query.email;
    if (!email)
        return resp.apiError(res, 'Provide user email');

    try {
        let user = await getAllData({ table_name: 'USERS', email: email });
        if (_.isEmpty(user))
            return resp.apiSuccess(res, 'User is not registered with this email');
        else
            return resp.apiError(res, 'User is already registered');
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'Error getting user')
    }
}

async function getShopItemsCtrl(req, res) {
    try {
        let { service_id } = req.query;
        if(!service_id)
            return resp.apiError(res, 'Provide service id');

        let data = { table_name: 'PRODUCTS', service_id };
        let items = await getAllData(data);
        items = items.rows.filter((item) => item.status == true)
        return items && resp.apiSuccess(res, { rows: items, count: items.length });
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error getting shop items')
    }
}

async function getCurrentLocationCtrl(req, res) {
    try {
        let id = req.user.user_id;
        let location = await getCurrentLocation({ id });
        location && resp.apiSuccess(res, location);
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error getting current location');
    }
}

function getOrderhistory(req, res) {
    const id = req.user.user_id;
    const data = {
        table_name: 'ORDERS',
        customer_id: id
    }
    if (req.route.path == '/currentOrders') {
        data.status = 'ONGOING&PENDING'
    }
    else if (req.route.path == '/ordersHistory') {
        data.status = 'COMPLETED&CANCELLED'
    }
    getAllData(data)
        .then((result) => {

            if (req.route.path == '/currentOrders') {
                result = result[0][0]
                return resp.apiSuccess(res, { rows: result, count: result.length });
            }
            else {
                let orders = result[0][0]
                orders = orders.filter((order) => order.status != 'ONGOING' && order.status != 'PENDING');
                return resp.apiSuccess(res, { rows: orders, count: result[0][1][0] ? result[0][1][0].count : 0 });
            }
        })
        .catch((err) => {
            resp.apiError(res, 'error getting orders');
            console.error(err);
        });
}

async function orderCtrl(req, res) {
    // CANCELL or COMPLETE the order
    try {
        const { order_id, employee_id, status, end_time } = req.body;
        const customer_id = req.user.user_id; // change id to user_id on other places as well

        if (!order_id || _.isEmpty(status))
            return resp.apiError(res, 'provide required data');

        if (req.route.path == '/finishOrder' && !end_time)
            return resp.apiError(res, 'provide order end time');

        if (!['ONGOING', 'COMPLETED', 'CANCELLED'].includes(status))
            return resp.apiError(res, 'invalid status provided');

        let order = await getById({ id: order_id, table_name: 'ORDER' });
        order = order[0]

        if (order.status !== 'PENDING' && !employee_id)
            return resp.apiError(res, 'Provide employee id');

        let customer = await getById({ id: customer_id, table_name: 'CUSTOMER' });
        if (_.isEmpty(customer))
            return resp.apiError(res, 'customer not found');

        let employee = employee_id && await getById({ id: employee_id, table_name: 'EMPLOYEE' });

        let where = { id: order_id, table_name: 'ORDER' }
        if (employee_id) where.employee_id = employee_id;



        const isValidOrder = await getById({ id: order_id, table_name: 'ORDER' });
        if (_.isEmpty(isValidOrder) || ['CANCELLED', 'COMPLETED'].includes(isValidOrder[0].status))
            return resp.apiError(res, `Invalid order or order is ${isValidOrder[0] && isValidOrder[0].status || 'empty'}`);

        try {
            let data = { order_id, customer_id, status, end_time };
            let updated = await updateOrder(data);

            if (status == 'COMPLETED') {
                customer = customer[0]
                let emp_msg = `${customer.full_name} marked your order as complete`;
                let supervisor_msg = `${customer.full_name} marked his order as complete`;

                let emp_data = {
                    foreign_id: employee_id,
                    message: emp_msg,
                    order_status: 'Completed',
                    service_type: order.service_type,
                    price: order.estimated_price,
                    image: `${customer.image}`,
                    employee_email: employee.email,
                    customer_email: customer.email,
                }
                let admin_data = {
                    foreign_id: 1, // admin id, change it if admin is changed
                    message: supervisor_msg,
                    image: `${customer.image}`,
                }
                let customer_data = {
                    start_time: order.start_time || '-',
                    service_type: order.service_type || '-',
                    sub_services: '-',
                    price: order.estimated_price || '-',
                    visit_time: order.start_time || '-',
                    vat: order.vat || VAT,
                    total_price: order.total_price || '-',
                    customer_name: customer.full_name || '-',
                    customer_mobile: customer.phone_number || '-',
                    datetime: moment().format(),
                    employee_email: employee.email,
                    customer_email: customer.email,
                    order_status: order.status || '-'
                }
                Promise.all([sendEmailToCustomer(customer_data), sendEmailToEmployee(emp_data), notifyEmployee(emp_data), notifyAdmin(admin_data), notifySupervisor(admin_data)])
                    .then(created => created && console.log('Customer notifications saved.'))
                    .catch(err => err && console.error(err))
            }
            return updated && resp.apiSuccess(res, `Order is marked as ${status}`);

        } catch (err) {
            console.error(err)
            resp.apiError(res, 'error in updating order');
        }
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error in updating order', err);
    }
}

const sendEmailToEmployee = emp_data => mailer.employeOrderComplete(emp_data)
const sendEmailToCustomer = customer_data => mailer.customerOrderComplete(customer_data);
const sendEmailToUser = user_data => mailer.newOrderPlaced(user_data);

function updateProfileCtrl(req, res) {
    let { full_name, phone_number, gender, dob, fileName } = req.body;
    try {
        if (req.files && req.files.image) {
            let file = req.files.image;
            fileName = file.name.replace(' ', '_').split('.').reverse()[0];
            fileName = '/image_' + Date.now() + '.' + fileName
            var dest_url = process.cwd() + '/server/assets/profilePictures' + fileName;
            file.mv(dest_url);
        }

        if (_.isEmpty(full_name) || !phone_number || _.isEmpty(gender) || !dob)
            return resp.apiError(res, 'Provide required data');

        let id = req.user.user_id;
        let data = { full_name, phone_number, gender, dob, image: fileName }

        updateProfile(id, data)
            .then(updated => updated && resp.apiSuccess(res, data))
            .catch((err) => {
                console.error(err);
                resp.apiError(res, 'Error updating customer profile')
            });
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error in server')
    }
}

function updateLocationCtrl(req, res) {
    // let loc = ["33.6679787,73.057483,selected:true", "33.6679787,73.057433,selected:false", "33.6679799,73.057400:selected:false"]
    // let aa = JSON.stringify(loc)
    const id = req.user.user_id;
    try {
        let { location } = req.body;
        if (!location)
            return resp.apiError(res, 'Please all required data');

        const data = { location, id }

        updateLocation(data)
            .then(() => resp.apiSuccess(res, 'location successfully updated'))
            .catch((err) => {
                resp.apiError(res, err);
                console.error(err)
            });
    } catch (err) {
        console.error(err);
        return resp.apiError(err, 'error in server');
    }
}

function getNotificationsCtrl(req, res) {
    getAllData({
        user_type: 'CUSTOMER',
        query: req.query,
        foreign_id: req.user.user_id,
        table_name: 'NOTIFICATIONS',
    })
        .then((notifications) => resp.apiSuccess(res, notifications))
        .catch((err) => {
            resp.apiError(res, 'error getting notifications, error in server');
            throw new Error(err);
        });
}
