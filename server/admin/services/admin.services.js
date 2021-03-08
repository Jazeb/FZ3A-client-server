const moment = require('moment');

const mailer = require('../../utils/mailer');
const { createSession } = require('../../session/session');
const { Offers, Products, Services, Orders } = require('../../model/index');

module.exports = {
    addOrder,
    addOffers,
    assignOrder,
    addProducts,
    addServices,
    addEmployees,
    addCustomers,
};

function addOrder(data) {
    return new Promise((resolve, reject) => {
        let order = {
            customer_id: data.customer_id,
            customer_name: data.customer_name,
            service_type: data.service_type,
            service_id:data.service_id,
            status:'PENDING',
            todo: data.sub_services, // sub services
        }
        Orders.create(order)
            .then(() => resolve(true))
            .catch((err) => reject(err))
    });
}

function addEmployees(emp) {
    return new Promise((resolve, reject) => {
        // send email to employee
        emp.user_type = emp.employee_type;
        mailer.sendEmail(emp)
            .then((emp) =>
                createSession(emp)) // create session after email is sent
            .then((data) => resolve(data))
            .catch((err) => err && reject(err));
    });
}

function addCustomers(customer) {
    return new Promise((resolve, reject) => {
        // send email to customer
        customer.user_type = 'Customer';
        mailer.sendEmail(customer)
            .then((customer) =>
                createSession(customer)) // create session after email is sent
            .then((data) => resolve(data))
            .catch((err) => err && reject(err));
    });
}

function addOffers(data) {
    return new Promise((resolve, reject) => {
        Offers.create({
            phone_number: data.phone_number,
            image: data.image,
        })
            .then(() => resolve(true))
            .catch((err) => err && reject(err));
    });
}

function addProducts(product) {
    let { title, description, price, inventory, tax_rate, image, quantity, service_id } = product;
    return new Promise((resolve, reject) => {
        Products.create({ title, description, price, inventory, tax_rate, image, quantity: quantity || 1, service_id })
            .then(() => resolve(true))
            .catch((err) => reject(err));
    });
}

function addServices(data) {
    return new Promise((resolve, reject) => {
        if (data.update) {
            // update sub services
            return Services.update({ sub_services: data.sub_services }, { where: { id: data.service_id } })
                .then(() => resolve(true))
                .catch((err) => err && reject(err));
        } else {
            let service_data = {
                title_ar: data.title_ar,
                title_en: data.title_en,
                sub_services: data.sub_services,
                image: data.image,
            };
            return Services.create(service_data)
                .then(() => resolve(true))
                .catch((err) => err && reject(err));
        }
    });
}

// assign order to employee (labour)
// change datetime
function assignOrder(data) {
    let details = {
        id: data.order_id,
        employee_id: data.employee_id,
        employee_name: data.employee_name,
        estimated_price: data.price,
        total_price:data.total_price,
        vat:data.VAT,
        status: 'ONGOING',
        start_time: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    return new Promise((resolve, reject) => {
        Orders.update(details, { where: { id: data.order_id } })
            .then(() => resolve(true))
            .catch((err) => reject(err))
    })
}
