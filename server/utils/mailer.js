const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const btoa = require("btoa");
const fs = require('fs');

const { SERVICE, EMAIL, PASSWORD, USER_EMAIL } = require('../config/constants.json');

console.log(SERVICE, EMAIL, PASSWORD, USER_EMAIL);

const transporter = nodemailer.createTransport({
    service: SERVICE,
    auth: {
        user: EMAIL,
        pass: PASSWORD,
    },
});

module.exports = {
    employeOrderComplete,
    customerOrderComplete,
    sendForgotEmail,
    sendEmployeEmail,
    sendEmail,
    newOrderPlaced
};
// let randomPassword = Math.random().toString(36).substring(7);

function employeOrderComplete(emp_data) {
    let html = fs.readFileSync(process.cwd() + '/server/templates/employee_email.html', 'utf8', (err) => {
        if (err)
            return console.error(err);
    });
    html = html.replace('#employee_email', emp_data.employee_email);
    html = html.replace('#customer_email', emp_data.customer_email);
    html = html.replace('#amount', emp_data.price);
    html = html.replace('#employee_email', emp_data.employee_email);
    html = html.replace('#service_type', emp_data.service_type);
    html = html.replace('#status', emp_data.order_status);

    let mailOptions = {
        from: EMAIL,
        to: emp_data.customer_email,
        subject: 'Order Completion Confirmation',
        html: html,
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) return reject(error);
            else return resolve(true);
        });
    });
}

function newOrderPlaced(msg) {
    return new Promise((resolve, reject) => {
        let mailOptions = {
            from: EMAIL,
            to: USER_EMAIL,
            subject: 'New order',
            text: msg
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err)
                return reject(err)
            }
            else {
                console.log(`Email sent to ${USER_EMAIL}`)
                return resolve(emp)
            }
        });
    });
}

function sendEmployeEmail(employee_email, msg, lat, long) {
    return new Promise((resolve, reject) => {
        const location = `<a style="text-decoration:none; color:#B9345A;" href= https://www.google.com/maps/search/?api=1&query=${lat},${long}><b style="color:#383CC1;" > Location</b></a><br><br></p>`
        const html = `<p style="color:black;">${msg} ${lat ? location : ''}`;

        let mailOptions = {
            from: EMAIL,
            to: employee_email,
            subject: 'Employee order assigned from FZ3A admin',
            html: html
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err)
                return reject(err)
            }
            else {
                console.log(`Email sent to ${employee_email}`)
                return resolve(emp)
            }
        });
    });
}

function sendEmail(emp) {
    return new Promise((resolve, reject) => {
        let baseURL = emp.baseURL; //`http://localhost:7000/api/session`;
        emp.session_id = randomstring.generate();

        let data = btoa(JSON.stringify(emp));
        let url = `${baseURL}/?token=${data}`;
        let mailOptions = {
            from: EMAIL,
            to: emp.emp_email,
            subject: 'Employee signup request from FZ3A admin',
            text: `Dear ${emp.name}, please click on this email to signup as Employee \n${url}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) return reject(err)
            else return resolve(emp)
        });
    });
}

function sendForgotEmail(data) {
    return new Promise((resolve, reject) => {
        let baseURL = data.url;
        // let token = btoa(JSON.stringify(data));

        let mailOptions = {
            from: EMAIL,
            to: data.email,
            subject: 'Reset your password',
            text: `Please click on this link to reset your password \n${baseURL}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                return reject(err)
            }
            else return resolve(true)
        });
    });
}

function customerOrderComplete(data) {
    console.log(data);
    let html = fs.readFileSync(process.cwd() + '/server/templates/customer_email.html', 'utf8', (err) => {
        if (err)
            return console.error(err);
    });
    html = html.replace('#service_type', data.service_type);
    html = html.replace('#service_type1', data.service_type);
    html = html.replace('#customer_name', data.customer_name);
    html = html.replace('#customer_mobile', data.customer_mobile);
    html = html.replace('#customer_mobile1', data.customer_mobile);
    html = html.replace('#start_time', data.start_time);
    html = html.replace('#start_time1', data.start_time);
    html = html.replace('#total_price', data.total_price);
    html = html.replace('#total_price1', data.total_price);
    html = html.replace('#vat', data.vat);
    html = html.replace('#vat1', data.vat);
    html = html.replace('#estimated_price', data.price);
    html = html.replace('#estimated_price1', data.price);
    html = html.replace('#employee_email', data.employee_email);
    html = html.replace('#employee_email1', data.employee_email);
    html = html.replace('#sub_services', data.sub_services);
    html = html.replace('#sub_services1', data.sub_services);
    html = html.replace('#status', data.order_status);
    html = html.replace('#status1', data.order_status);

    let mailOptions = {
        from: EMAIL,
        to: data.customer_email,
        subject: 'Order Completion Confirmation',
        html: html,
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) return reject(error);
            else return resolve(true);
        });
    });
}



