const _ = require('lodash');
const redis = require("redis");
const client = redis.createClient();

const adminServices = require('../services/admin.services');
const view = require('../../shared/queries/view');
const addOfferService = require('../services/offers');
const resp = require('../../config/response');

module.exports = {
    addOrders,
    addCustomers,
    addProducts,
    addEmployee,
    addService,
    addOffers,
    updateService
};

async function addOrders(req, res) {
    const { customer_id, customer_name, service_id, service_type, sub_services } = req.body;
    if (_.isEmpty(customer_name || _.isEmpty(service_type)) || _.isEmpty(sub_services) || !customer_id || !service_id)
        return resp.apiError(res, 'Provide required data');
    let data = {
        customer_id, service_type, sub_services, service_id
    }
    try {
        let added = await adminServices.addOrder(data);
        added && resp.apiSuccess(res, 'Order added successfully against customer');
    } catch (err) {
        console.error(err);
        return resp.apiError(res, 'Error adding order');
    }
}

function addProducts(req, res) {
    const { title, description, price, inventory, tax_rate, quantity, service_id } = req.body;
    if (_.isEmpty(title || _.isEmpty(description)) || _.isEmpty(inventory) || !price || !tax_rate || !service_id)
        return resp.apiError(res, 'Provide required data');

    let file = req.files.image;
    let fileName = file.name;
    fileName = fileName.replace(" ", "_");
    fileName = fileName.split(".");
    fileName = "/image_" + Date.now() + "." + fileName.reverse()[0];
    file.mv(process.cwd() + "/server/assets/products" + fileName, err => {
        return err && resp.apiError(res, err);
    });
    
    let product_data = { title, description, price, inventory, tax_rate, image: fileName, quantity, service_id }
    adminServices.addProducts(product_data)
        .then((added) => {
            added && resp.apiSuccess(res, 'product added successfully');
            client.del('PRODUCT')
        })
        .catch((err) => {
            resp.apiError(res, 'error adding product');
            console.error(err)
        })
}

async function addCustomers(req, res) {
    const { name, email, phone_number, baseURL } = req.body;
    if (_.isEmpty(email) || !phone_number || _.isEmpty(name))
        return resp.apiError(res, 'provide required data')

    let isValidCustomer = await view.getAllData({table_name: 'USERS', email});
    if(!_.isEmpty(isValidCustomer))
        return resp.apiError(res, 'Customer is already registered, use different email');

    let customer = {
        name, emp_email: email, phone_number, baseURL
    }
    adminServices.addCustomers(customer)
        .then(() => resp.apiSuccess(res, 'email sent to customer for signup'))
        .catch((err) => {
            resp.apiError(res, 'error sending email to customer')
            console.error(err)
        })
}

async function addEmployee(req, res) {
    const { name, emp_email, service, baseURL, employee_type, phone_number, areas } = req.body;
    if (_.isEmpty(name || _.isEmpty(emp_email)) || _.isEmpty(baseURL || _.isEmpty(employee_type)))
        return resp.apiError(res, 'Provide required data');
    
    let isValidEmployee = await view.getAllData({table_name: 'USERS', email:emp_email});
    if(!_.isEmpty(isValidEmployee))
            return resp.apiError(res, 'Employee is already registered, use different email');

    if (!['SUPERVISOR', 'LABOUR', 'MANAGER'].includes(employee_type))
        return resp.apiError(res, 'Invalid employee type');
        
    const emp_data = { name, emp_email, service, baseURL, employee_type, phone_number, areas }
    adminServices.addEmployees(emp_data)
        .then((sent) => sent && resp.apiSuccess(res, 'Email sent to employee / labour'))
        .catch((err) => {
            resp.apiError(res, 'error adding employee, error in server');
            console.error(err)
        });
}

function updateService(req, res) {
    let { sub_services, service_id } = req.body;
    if (!service_id)
        return resp.apiError(res, 'Missing service id');
    adminServices.addServices({ sub_services, update: true, service_id })
        .then(() => {
            resp.apiSuccess(res, 'Sub services updated successfully');
            return client.del('SERVICE')
        })
        .catch((err) => {
            resp.apiError(res, 'error creating service, error in server');
            return console.error(err)
        });
}

function addService(req, res) {
    let { title_ar, title_en, image, sub_services } = req.body;

    let file = req.files.image;
    let fileName = file.name;
    fileName = fileName.replace(" ", "_");
    fileName = fileName.split(".");
    fileName = "/image_" + Date.now() + "." + fileName.reverse()[0];
    file.mv(process.cwd() + "/server/assets/services" + fileName, err => {
        return err && resp.apiError(res, err);
    });
    let service = {
        title_ar, title_en, sub_services, image: fileName
    }
    adminServices.addServices(service)
        .then(() => {
            resp.apiSuccess(res, 'Service added successfully');
            return client.del('SERVICE')
        })
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error creating service, error in server');
        });
}

function addOffers(req, res) {
    let { phone_number } = req.body;
    if (!phone_number)
        return resp.apiError(res, 'Provide required data');

    let file = req.files.image;
    let fileName = file.name;

    fileName = fileName.replace(" ", "_");
    fileName = fileName.split(".");
    fileName = "/image_" + Date.now() + "." + fileName.reverse()[0];
    file.mv(process.cwd() + "/server/assets/offers" + fileName, err => {
        return err && resp.apiError(res, err);
    });

    let offer = {
        phone_number, image: fileName
    }
    addOfferService.addOffers(offer)
        .then((added) => {
            added && resp.apiSuccess(res, 'Offer created successfully');
            client.del('OFFER');
            return
        })
        .catch((err) => {
            console.error(err)
            return resp.apiError(res, 'error adding offer, error in server');
        })
}