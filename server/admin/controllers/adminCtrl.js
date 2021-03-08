const _ = require('lodash');

const query = require('../../shared/queries/view');
const { set, get } = require('../../shared/queries/redis');
const view = require('../../shared/queries/getById');
const { assignOrder } = require('../services/admin.services');
const { updateStatus, update } = require('../../shared/queries/update');
const { notifyEmployee, notifyCustomer } = require('../../shared/queries/create');
const resp = require('../../config/response');
const fcm = require('../../utils/fcm');
const mailer = require('../../utils/mailer');
const VAT = require('../../config/constants.json').VAT;

const deploy = require('../../shared/queries/view')

module.exports = {
    getProducts,
    getOffers,
    assignOrderCtrl,
    getServices,
    getProductCtrl,
    getEmployees,
    getCustomers,
    getNotifications,
    updateStatusCtrl,
    getProductOrderCtrl,
    searchEmployeeCtrl,
    searchCustomersCtrl,
    updateCtrl,
    orderReassignCtrl,
    reportsCtrl,
    deployee,
    customers
};

function deployee() {
    deploy.deploy()
}

function getProducts(req, res) {
    console.log('Getting from DB')
    query.getAllData({ table_name: 'PRODUCTS', query: req.query })
        .then((products) => {
            set('PRODUCT', JSON.stringify(products))
            return resp.apiSuccess(res, products)
        })
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error getting products, error in server');
        });
}

function getCustomers(req, res) {
    let { limit, offset } = req.query;
    query.getAllData({ table_name: 'CUSTOMERS', limit:+limit, offset:+offset })
        .then((customers) => {
            let cust = {
                count: customers[0][1][0].count,
                rows: customers[0][0]
            }
            set('CUSTOMER', JSON.stringify(cust))
            return resp.apiSuccess(res, { count: customers[0][1][0].count ? customers[0][1][0].count : 0, rows: customers[0][0] })
        })
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error getting customers, error in server');
        });
}

async function getOffers(req, res) {
    try {
        const offers = await query.getAllData({ table_name: 'OFFERS', query: req.query });
        set('OFFER', JSON.stringify(offers))
        return resp.apiSuccess(res, offers);
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error getting offers, error in server');
    }
}
/**
 * Todo
 * move deleteCtrl to shared ctrl
 */
// async function deleteCtrl(req, res) {
//     try {
//         let { id, type } = req.query;
//         if (!id)
//             return resp.apiError(res, 'provide order id');

//         if (!['ORDER', 'EMPLOYEE', 'CUSTOMER', 'PRODUCT', 'PRODUCT_ORDER', 'OFFER', 'SERVICE'].includes(type))
//             return resp.apiError(res, 'invalid type provided');

//         let data = {
//             table_name: type,
//             where: { id }
//         }
//         try {
//             let deleted = await deleteRecord(data);
//             return deleted && resp.apiSuccess(res, `${type} deleted successfully`);
//         } catch (error) {
//             console.error(error)
//             return resp.apiError(res, `Error deleting ${type}, check server`)
//         }
//     } catch (error) {
//         console.error(error)
//         return resp.apiError(res, `Error deleting ${type}, check server`)
//     }
// }

async function assignOrderCtrl(req, res) {
    const { order_id, employee_id, price } = req.body;
    if (!price || !order_id || !employee_id)
        return resp.apiError(res, 'Provide required data');

    try {
        let employee = await view.getById({ id: employee_id, table_name: 'EMPLOYEE' });
        if (_.isEmpty(employee) || employee.role !== 'LABOUR')
            return resp.apiError(res, 'Employee not found with this id');

        if (+price == NaN || typeof +price !== 'number' || +price < 0)
            return resp.apiError(res, `Invalid price`);

        let order = await view.getById({ id: order_id, table_name: 'ORDER' });
        if (_.isEmpty(order))
            return resp.apiError(res, 'Order does not exist with this id');

        if (req.body.reassign && order[0].status !== 'ONGOING')
            return resp.apiError(res, `Order is already ${order[0].status}`);

        if (req.body.reassign && order[0].employee_id == employee_id)
            return resp.apiError(res, `Order is already assigned to this labour`);

        if (!req.body.reassign && order[0].status !== 'PENDING')
            return resp.apiError(res, `Order is already ${order[0].status}`);

        let customer = await view.getById({ id: order[0].customer_id, table_name: 'CUSTOMER' });
        customer = customer[0]

        const vat = +((VAT * +price) / 100).toFixed(3);
        const estimated_price = +price - vat

        let details = {
            order_id, employee_id, price:estimated_price, total_price:+price,
            employee_name: employee.full_name,
            employee_email: employee.email, VAT
        },
            employee_msg = `You have been assigned a new order by Admin, please check order page for details.`,
            customer_msg = `${order[0].service_type} is assigned to you.`;

        let data_cust = {
            foreign_id: order[0].customer_id,
            message: customer_msg,
            image: employee.image
        }
        let data_emp = {
            foreign_id: employee_id,
            message: employee_msg
        }
        let data = { fcm_token: customer.fcm_token || null, message: customer_msg }

        customer.fcm_token && fcm.orderAssignedNotification(data)

        Promise.all([sendEmailToEmployee(employee, customer), notifyEmployee(data_emp), notifyCustomer(data_cust), assignOrder(details)])
            .then(() => {
                return resp.apiSuccess(res, `Order assigned to ${employee.full_name}`);
            })
            .catch(err => {
                console.error(err)
                return resp.apiError(err, 'Error assigning labour')
            })
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'Error in server')
    }
}


function sendEmailToEmployee(employee, customer) {
    const location = JSON.parse(customer.location);
    let coords = location.filter(l => l.selected == true);

    let lat = coords.lat ? coords.lat : 0;
    let long = coords.long ? coords.long : 0;
    let msg = `Dear ${employee.full_name}, you have been assigned a new order from ${customer.full_name}`;
    mailer.sendEmployeEmail(employee.email, msg, lat, long);
}

async function getEmployees(req, res) {
    if (!['LABOUR', 'MANAGER', 'SUPERVISOR'].includes(req.query.role))
        return resp.apiError(res, 'invalid role provided');

    try {
        let employees = await query.getAllData({
            table_name: 'EMPLOYEES',
            query: req.query
        });
        set(req.query.role, JSON.stringify(employees))
        return resp.apiSuccess(res, employees);
    } catch (err) {
        console.error(err)
        return resp.apiError(res, 'error getting employees, error in server :)');
    }
}

function getServices(req, res) {
    query.getAllData({
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

function getNotifications(req, res) {
    query.getAllData({
        user_type: 'ADMIN',
        query: req.query,
        table_name: 'NOTIFICATIONS',
    })
        .then((notifications) => resp.apiSuccess(res, notifications))
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error getting notifications, error in server');
        });
}


async function updateStatusCtrl(req, res) {
    const id = req.user.user_id
    const { status } = req.body;
    if (_.isEmpty(status))
        return resp.apiError(res, 'provide status');

    if (!['true', true, 'false', false].includes(status))
        return resp.apiError(res, 'invalid status provided');

    let data = { table_name: 'EMPLOYEES', id, status }
    try {
        let updated = await updateStatus(data)
        return updated && resp.apiSuccess(res, 'status updated');
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error updating status')
    }
}

async function searchEmployeeCtrl(req, res) {
    const { search, service } = req.query;
    if (_.isEmpty(search) || _.isEmpty(service))
        return resp.apiError(res, 'provide required data');

    req.query.role = 'LABOUR'
    const data = { query: req.query, table_name: 'EMPLOYEES' };
    try {
        const employees = await query.getAllData(data)
        return employees && resp.apiSuccess(res, employees);
    } catch (err) {
        console.error(err);
        return resp.apiError(res, err);
    }
}

async function searchCustomersCtrl(req, res) {
    const { search } = req.query;
    if (_.isEmpty(search))
        return resp.apiError(res, 'provide required data');

    const data = { query: req.query, path: req.route.path, table_name: 'CUSTOMERS' };
    try {
        const employees = await query.getAllData(data)
        employees && resp.apiSuccess(res, employees);
    } catch (err) {
        console.error(err);
        return resp.apiError(res, err);
    }
}

async function getProductOrderCtrl(req, res) {
    if (_.isEmpty(req.query.status) || !['COMPLETED', 'PENDING'].includes(req.query.status))
        return resp.apiError(res, 'invalid status provided');
    try {
        let data = { table_name: 'PRODUCT_ORDERS', query: req.query }
        let result = await query.getAllData(data);
        let orders = result[0][0];
        let count = result[0][1][0].count ? result[0][1][0].count : 0
        set('PRODUCT_ORDER_' + req.query.status, JSON.stringify({ rows: orders, count: count }))
        return resp.apiSuccess(res, { rows: orders, count: count })
    } catch (error) {
        console.error(error);
        return resp.apiError(res, 'error getting product orders');
    }
}

async function updateCtrl(req, res) {
    try {
        let fileName;
        const body = req.body;
        if (!['ORDER', 'PRODUCT_ORDER', 'SERVICE', 'LABOUR', 'MANAGER', 'SUPERVISOR', 'EMPLOYEE', 'CUSTOMER', 'PRODUCT', 'OFFER', 'SERVICE'].includes(body.table_name))
            return resp.apiError(res, 'invalid table type');

        let path = body.table_name == 'PRODUCT' ? '/server/assets/products' : body.table_name == 'OFFER' ? '/server/assets/offers' : null

        if (req.files && req.files.image) {
            let file = req.files.image;
            fileName = file.name.replace(" ", "_");
            fileName = fileName.split(".");
            fileName = "/image_" + Date.now() + "." + fileName.reverse()[0];
            file.mv(process.cwd() + path + fileName, err => {
                return err && resp.apiError(res, err);
            });
        }
        if (!_.isEmpty(fileName)) body.image = fileName;
        let updated = await update(body);
        return updated && resp.apiSuccess(res, 'Updated successfully');
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error updating user, must be server error :)')
    }
}

async function getProductCtrl(req, res) {
    try {
        const product_id = req.query.id
        let product = await view.getById({ table_name: 'PRODUCTS', id: product_id });
        return resp.apiSuccess(res, product);
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'error updating user, must be server error :)')
    }
}


async function orderReassignCtrl(req, res) {
    const { order_id, employee_id, price } = req.body;

    if (!order_id || !employee_id || !price)
        return resp.apiError(res, 'Provide order id, employee id and price');

    let data = { employee_id, order_id, price, reassign: true };
    req.body = data;

    return assignOrderCtrl(req, res);
}

async function reportsCtrl(req, res) {
    const { type, start_date, end_date } = req.query;

    try {
        if (!type || _.isEmpty(start_date) || _.isEmpty(end_date))
            return resp.apiError(res, 'Provide required data');

        req.query.type = type == 1 ? 'CUSTOMER' : type == 2 ? 'EMPLOYEE' : null;
        if (!type)
            return resp.apiError(res, 'Invalid type provided');

        let data = {};
        if (req.query.type == 'CUSTOMER') {
            data = await query.getCustomerReport(req.query);
            return resp.apiSuccess(res, data[0][0]);
        }
        else if (req.query.type == 'EMPLOYEE') {
            data = await query.getEmployeeReport(req.query);
            return resp.apiSuccess(res, data[0][0]);
        }
        else return resp.apiError(res, 'Invalid type');
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'Error in getting reports', null, err.message);
    }
}

async function customers(req, res){
    const data = await query.getcustomers()
    set('CUSTOMER', data[0])
    return resp.apiSuccess(res, data[0]);
}