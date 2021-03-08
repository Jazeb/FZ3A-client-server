'use strict'
const _ = require('lodash');

const { db, Notifications, Users, Products, Offers, Services, Employees, Orders, Customers } = require('../../model/index');
const Op = db.Sequelize.Op;

module.exports = {
    deploy,
    get,
    getByKey,
    getAllData,
    getStatistics,
    getTotalOrders,
    getCustomerReport,
    getEmployeeReport,
    getcustomers
}
/********************************
 * Here we can get all data of any table.
 * we need to pass table name in parameter
 */

async function deploy(data) {
    let cat = await db.sequelize.query(`SELECT * from sub_category`);
    var subservices = []

    let sub = cat[0].map(async ca => {
        let aa = []
        let obj = {
            id: ca.id,
            service_ar: ca.service_ar,
            service_en: ca.service_en,
            category_id: ca.category_id,
        }
        // return console.log(JSON.stringify(obj))
        aa.push(obj)
        aa = JSON.stringify(aa)

        let aaa = await db.sequelize.query(`update services set sub_services = '${aa}' where id = ${ca.category_id}`);
        console.log(aaa);
    });
}

function getTotalOrders(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let count = await db.sequelize.query(`SELECT COUNT(orders.id) AS total_orders FROM orders WHERE DATE(orders.created_at) = CURDATE()`);
            count = count[0][0].total_orders
            return resolve(count)
        } catch (err) {
            return reject(err)
        }
    });
}

function getAllData(data) {
    return new Promise(async (resolve, reject) => {
        if (_.isEmpty(data.table_name)) return reject('table name is empty');

        try {
            console.info("getting from DB");
            let limit = data.query && data.query.limit ? +data.query.limit : 10, // parse limit to Number
                offset = data.query && data.query.offset ? +data.query.offset * +limit : 0;
            let order = [
                ['id', 'DESC']
            ];
            let where = {};

            switch (data.table_name) {
                case 'PRODUCTS':
                    where = data.query && data.query.search ? { title: { [Op.like]: `%${data.query.search}%` } } : {};
                    if(data.service_id) where.service_id = data.service_id
                    Products.findAndCountAll({ where, order })
                        .then((products) => resolve(products))
                        .catch((err) => reject(err));
                    break;

                case 'NOTIFICATIONS':
                    if (['ADMIN', 'SUPERVISOR', 'EMPLOYEE', 'MANAGER', 'CUSTOMER'].includes(data.user_type)) {
                        // where = { user_type: data.user_type }
                        delete data.query
                        delete data.table_name
                        Notifications.findAndCountAll({ where: data, order })
                            .then((notifications) => resolve(notifications))
                            .catch((err) => reject(err));
                    }
                    else reject('invalid user type specified');
                    break;

                case 'OFFERS':
                    where = data.query && data.query.search ? { id: { [Op.like]: `%${data.query.search}%` } } : {};
                    Offers.findAndCountAll({ where, order })
                        .then((products) => resolve(products))
                        .catch((err) => reject(err));
                    break;

                case 'SERVICES':
                    // where = data.query && data.query.search ? { title_en: { [Op.like]: `%${data.query.search}%` } } : {};
                    let services = await db.sequelize.query(`SELECT * FROM services`);
                    return resolve(services)
                    // Services.findAndCountAll({ order })
                    //     .then((services) => resolve(services))
                    //     .catch((err) => reject(err));
                    break;

                case 'EMPLOYEES':
                    where = data.query && data.query.search ? { full_name: { [Op.like]: `%${data.query.search}%` } } : {};
                    if (data.id) where.id = data.id
                    if (data.query && data.query.role) where.role = data.query.role;
                    if (data.query && data.query.service) where.service = data.query.service;
                    let employees = await Employees.findAndCountAll({ where, order });
                    resolve(employees);
                    break;

                case 'ORDERS':
                    where = data.query && data.query.search ? { employee_name: { [Op.like]: `%${data.query.search}%` } } : {};

                    if (data.query && data.query.status)
                        where.status = data.query.status;

                    if (data && data.customer_id) {
                        where.customer_id = data.customer_id;
                    }
                    if (data.key == 'employee_id') {
                        where.employee_id = data.employee_id;
                    }

                    if (data && data.status) {
                        where.status = data.status
                    }

                    if (data && data.status && data.status == 'ONGOING&PENDING' || data.status == 'COMPLETED&CANCELLED') {
                        try {
                            let status = data.status == 'ONGOING&PENDING' ? `orders.status='ONGOING' OR orders.status='PENDING'` : `1`
                            let details = await db.sequelize.query(
                                `SELECT orders.*, IFNULL(FORMAT(AVG(ratings.stars), 1), 0) AS employee_rating,
                                employees.email AS employee_email, employees.phone_number AS employee_phone,
                                employees.service AS employee_service, employees.role AS employee_role, employees.image AS employee_image
                                FROM orders
                                LEFT JOIN employees on employees.id = orders.employee_id
                                LEFT JOIN ratings on ratings.rate_to = orders.employee_id
                                WHERE orders.customer_id = ${data.customer_id}
                                AND (${status}) 
                                GROUP BY orders.id;SELECT FOUND_ROWS() AS count`);
                            return resolve(details)
                        } catch (err) {
                            reject(err)
                        }
                    }
                    if (data.path == '/getOrders') {
                        
                        let status = data.query.status ? `orders.status='${data.query.status}'` : `1`;
                        let details = await db.sequelize.query(
                            `SELECT orders.*, IFNULL(FORMAT(AVG(ratings.stars), 1), 0) AS customer_rating,
                            customers.full_name AS customer_name, customers.email AS customer_email, customers.phone_number AS customer_phone,
                            customers.image AS customer_image
                            FROM orders
                            LEFT JOIN customers on customers.id = orders.customer_id
                            LEFT JOIN ratings on ratings.rate_to = orders.customer_id
                            WHERE orders.employee_id = ${data.employee_id}
                            AND ${status}
                            GROUP BY orders.id
                            ORDER BY orders.created_at DESC;
                            SELECT FOUND_ROWS() AS count`);
                        return resolve(details)
                    }
                    if (data.query.path == '/getOrders') {
                        // let status = data.query.status ? `orders.status='${data.query.status}'` : `1`;
                        let details = await db.sequelize.query(
                            `SELECT SQL_CALC_FOUND_ROWS orders.*, IFNULL(FORMAT(AVG(ratings.stars), 1), 0) AS ratingss,
                            customers.email AS customer_email, customers.phone_number AS customer_phone, customers.location AS customer_location,
                            customers.image AS customer_image
                            FROM orders
                            LEFT JOIN ratings ON ratings.rate_to = orders.employee_id
                            LEFT JOIN customers ON  customers.id = orders.customer_id
                            WHERE orders.status = '${data.query.status}'
                            GROUP BY orders.id ORDER BY orders.created_at DESC
                            LIMIT ${limit} OFFSET ${offset};
                            SELECT FOUND_ROWS() AS count`);
                        details[0][0].map(order => {
                            if (order.customer_location) {
                                let address = JSON.parse(order.customer_location);
                                let aa = _.find(address, add => add.selected);
                                order.customer_location = aa.address
                            }else order.customer_location = ''
                        })
                        return resolve(details)
                        //[{"lat":33.5968788,"long":73.0528412,"selected":true,"address":"Adress 1","title":"Title 1"},{"lat":33.5968788,"long":73.0528412,"selected":false,"address":"Adress 2","title":"Title 3"}]
                    }
                    else {
                        let orders = await db.sequelize.query(
                            `SELECT SQL_CALC_FOUND_ROWS orders.*, IFNULL(FORMAT(AVG(ratings.stars), 1), 0) AS ratingss,
                            customers.email AS customer_email, customers.phone_number AS customer_phone, customers.location AS customer_location,
                            customers.image AS customer_image
                            FROM orders
                            LEFT JOIN ratings ON ratings.rate_to = orders.employee_id
                            LEFT JOIN customers ON  customers.id = orders.customer_id
                            WHERE orders.status = '${where.status}'
                            GROUP BY orders.id ORDER BY orders.created_at DESC
                            LIMIT ${limit} OFFSET ${offset};
                            SELECT FOUND_ROWS() AS count`);
                        resolve(orders)
                        // Orders.findAndCountAll({ where, order })
                        //     .then((orders) => resolve(orders))
                        //     .catch((err) => reject(err));
                    }

                    break;

                case 'CUSTOMERS':
                    // where = data.query && data.query.search ? { full_name: { [Op.like]: `%${data.query.search}%` } } : {};
                    if (data.path == '/search/customers') {
                        Customers.findAll({ where })
                            .then((customer) => resolve(customer))
                            .catch((err) => reject(err));
                    }
                    else if (data.id) {
                        where.id = data.id || data.email
                        return Customers.findAndCountAll({ where, order })
                            .then((customer) => resolve(customer))
                            .catch((err) => reject(err));
                    }
                    else if (data.email) {
                        where.email = data.email
                        return Customers.findAndCountAll({ where, order })
                            .then((customer) => resolve(customer))
                            .catch((err) => reject(err));
                    }
                    else {
                        let limit = data.limit ? +data.limit : 10; // parse limit to Number
                        let offset = data.offset ? +data.offset * +limit : 0;
                        let query = `SELECT SQL_CALC_FOUND_ROWS customers.*, count(orders.id) as total_orders, IFNULL(FORMAT(AVG(ratings.stars), 1), 0) AS customer_rating
                        FROM customers
                        LEFT JOIN ratings on ratings.rate_to = customers.id
                        LEFT JOIN orders on orders.customer_id = customers.id
                        GROUP BY customers.id
                        ORDER BY created_at DESC
                        LIMIT ${limit} OFFSET ${offset};
                        SELECT FOUND_ROWS() AS count`;

                        let customers = await db.sequelize.query(query);
                        return resolve(customers)
                    }
                    break;

                case 'PRODUCT_ORDERS':
                    let orders = await db.sequelize.query(
                        `SELECT product_orders.*,
                        customers.full_name AS customer_name,
                        products.title as product_title, products.inventory as inventory, 
                        products.tax_rate as tax_rate, products.price as price
                        FROM product_orders
                        LEFT JOIN customers on customers.id = product_orders.customer_id
                        LEFT JOIN products on products.id = product_orders.product_id
                        WHERE product_orders.status = '${data.query.status}'
                        GROUP BY product_orders.id
                        ORDER BY created_at DESC
                        LIMIT ${limit} OFFSET ${offset};
                        SELECT FOUND_ROWS() AS count;`);
                    return resolve(orders);

                case 'USERS':
                    delete data.table_name;
                    where = data;
                    Users.findOne({ where })
                        .then(user => resolve(user)).catch(err => reject(err));
                    break;
                default:
                    reject('invalid table name specified');
                    break;
            }
        } catch (err) {
            reject(err);
        }
    });
}

function getByKey(data) {
    return new Promise((resolve, reject) => {
        try {
            if (_.isEmpty(data.table_name))
                return reject('provide table name');
            switch (data.table_name) {
                case 'PRODUCTS':
                    Products.findOne({ where: { [data.key]: data.value } })
                        .then(prod => resolve(prod))
                        .catch(err => reject(err));
                    break;
                default:
                    reject('invalid table name provided');
                    break;
            }
        } catch (error) {
            reject(error);
        }
    });
}

function getStatistics(params) {
    return new Promise(async (resolve, reject) => {
        let role = params.role;
        try {
            if (role == 'SUPERVISOR') {
                let group_by = params.range == 'yearly' ? `MONTH(orders.created_at)`
                    : params.range == 'monthly' ? `DAY(orders.created_at)`
                        : params.range == 'weekly' ? `DAYNAME(orders.created_at)`
                            : `1`
                let query = `
                    SELECT COUNT(orders.id) AS completed_orders FROM orders WHERE status = 'COMPLETED';
                    SELECT COUNT(orders.id) AS ongoing_orders FROM orders WHERE status = 'ONGOING';
                    SELECT COUNT(orders.id) AS new_orders FROM orders WHERE status = 'PENDING';
                    SELECT COUNT(orders.id) AS total_orders_monthly, MONTHNAME(orders.created_at) as month
                        FROM orders GROUP BY MONTHNAME(orders.created_at);
                    SELECT COUNT(orders.id) AS total_orders, ${group_by} AS date FROM orders 
                    WHERE orders.created_at >= '${params.start_time}' 
                        AND orders.created_at <= '${params.end_time}'
                    GROUP BY ${group_by}`;

                let data = await db.sequelize.query(query);

                let details = {
                    completed: data[0][0][0].completed_orders,
                    ongoing: data[0][1][0].ongoing_orders,
                    new_orders: data[0][2][0].new_orders,
                    bar_total_monthly: data[0][3],
                    line_orders: data[0][4]
                }
                return resolve(details)
            }
            else if (role == 'MANAGER') {
                let group_by = params.range == 'yearly' ? `MONTHNAME(product_orders.created_at)`
                    : params.range == 'monthly' ? `DAY(product_orders.created_at)`
                        : params.range == 'weekly' ? `DAYNAME(product_orders.created_at)`
                            : `1`
                let query = `
                    SELECT COUNT(product_orders.id) AS completed_orders FROM product_orders WHERE status = 'COMPLETED';
                    SELECT COUNT(product_orders.id) AS ongoing_orders FROM product_orders WHERE status = 'ONGOING';
                    SELECT COUNT(product_orders.id) AS new_orders FROM product_orders WHERE status = 'PENDING';
                    SELECT COUNT(product_orders.id) AS total_orders_monthly, MONTHNAME(product_orders.created_at) as month
                        FROM product_orders GROUP BY MONTHNAME(product_orders.created_at);
                    SELECT COUNT(product_orders.id) AS total_orders, ${group_by} AS date
                    FROM product_orders 
                    WHERE product_orders.created_at >= '${params.start_time}' 
                        AND product_orders.created_at <= '${params.end_time}' 
                    GROUP BY ${group_by}`;
                let data = await db.sequelize.query(query);

                let details = {
                    completed: data[0][0][0].completed_orders,
                    ongoing: data[0][1][0].ongoing_orders,
                    new_orders: data[0][2][0].new_orders,
                    bar_total_monthly: data[0][3],
                    line_orders: data[0][4],
                }
                return resolve(details)
            }
            else if (role == 'LABOUR') {
                let group_by = params.range == 'yearly' ? `MONTHNAME(orders.created_at)`
                    : params.range == 'monthly' ? `DAY(orders.created_at)`
                        : params.range == 'weekly' ? `DAYNAME(orders.created_at)`
                            : `1`
                let query = `
                    SELECT IFNULL(FORMAT(AVG(ratings.stars), 1), 0) AS rating FROM ratings 
                        WHERE type = 'EMPLOYEE' AND rate_to =24;
                    SELECT COUNT(orders.id) AS total_orders FROM orders WHERE employee_id = ${params.id};
                    SELECT customer_name, address, service_type FROM orders WHERE employee_id = ${params.id} AND status = 'ONGOING';
                    SELECT COUNT(orders.id) AS total_orders, MONTHNAME(orders.created_at) AS month FROM orders WHERE employee_id = ${params.id}
                    GROUP BY MONTHNAME(orders.created_at);
                    SELECT COUNT(orders.id) AS line_total_orders, ${group_by} AS date
                    FROM orders 
                    WHERE orders.created_at >= '${params.start_time}' 
                        AND orders.created_at <= '${params.end_time}' 
                        AND status = 'COMPLETED'
                    GROUP BY ${group_by}`;
                let data = await db.sequelize.query(query);

                let details = {
                    ratings: data[0][0][0].rating,
                    current_order: data[0][2][0] || new Object(),
                    bar_total_monthly: data[0][3],
                    line_orders: data[0][4]
                }
                return resolve(details);
            }
            else if (role == 'ADMIN') {
                let group_by = params.range == 'yearly' ? `MONTHNAME(orders.created_at)`
                    : params.range == 'monthly' ? `DAY(orders.created_at)`
                        : params.range == 'weekly' ? `DAYNAME(orders.created_at)`
                            : `1`
                let query = `
                    SELECT COUNT(orders.id) AS completed_orders FROM orders WHERE status = 'COMPLETED';
                    SELECT COUNT(users.id) AS customers FROM users WHERE user_type = 'customer';
                    SELECT SUM(orders.estimated_price) AS earnings FROM orders WHERE status = 'COMPLETED';
                    SELECT COUNT(orders.id) AS total_orders, MONTHNAME(orders.created_at) AS month FROM orders
                        GROUP BY MONTHNAME(orders.created_at);
                    SELECT orders.estimated_price AS total_earning, ${group_by} AS date
                    FROM orders 
                    WHERE orders.created_at >= '${params.start_time}' 
                        AND orders.created_at <= '${params.end_time}' 
                    GROUP BY ${group_by}`;

                // SELECT COUNT(orders.id) AS current_month FROM orders WHERE MONTH(orders.created_at) = MONTH(CURRENT_DATE());SELECT COUNT(orders.id) AS previous_month FROM orders WHERE MONTH(orders.created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH);
                // SELECT CONCAT(round( SELECT COUNT(orders.id) FROM orders WHERE MONTH(orders.created_at) = MONTH(CURRENT_DATE()) / SELECT COUNT(orders.id) FROM orders WHERE MONTH(orders.created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) * 100 ),2),'%') AS percentage
                let data = await db.sequelize.query(query);
                let details = {
                    completed_orders: data[0][0][0].completed_orders,
                    customers: data[0][1][0].customers,
                    // earnings: data[0][2][0].earnings,
                    line_orders: data[0][4],
                    bar_total_monthly: data[0][3],
                }

                // for (let order = 0; order < details.bar_total_monthly.length; order++) {
                //     let current = details.bar_total_monthly[order].total_orders;
                //     let previous = details.bar_total_monthly[order + 1].total_orders;
                //     let percentage = (current - previous) / ((current + previous) / 2) * 100;

                //     details.percentage = parseFloat(percentage).toFixed(2) + '%';
                //     break;
                // }
                return resolve(details)
            }
        } catch (err) {
            console.error(err);
            return reject(err);
        }
    });
}


function get(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let order = await Orders.findOne({ where: data });
            let customer = await Customers.findOne({ where: { id: order.customer_id } });
            order.images = customer.image || null
            return resolve(order)
        } catch (err) {
            reject(err)
        }
    });
}

// Reports of customer and employee for admin
async function getCustomerReport(data) {
    let limit = data.limit ? +data.limit : 10,
        offset = data.offset ? +data.offset * +limit : 0,
        where = data.full_name ? `customers.full_name LIKE '%${data.full_name}%'` : `1`;

    let query = `
    SELECT SQL_CALC_FOUND_ROWS orders.id, customers.id AS customer_id, customers.full_name AS name, customers.created_at AS created_at,
    orders.service_type AS service_type, orders.id AS order_id, orders.rating AS order_rating
    FROM customers
    INNER JOIN orders ON orders.customer_id = customers.id
    WHERE DATE(orders.created_at) >= '${data.start_date}' AND DATE(orders.created_at) <= '${data.end_date}' AND ${where}
    ORDER BY orders.created_at DESC
    LIMIT ${limit} OFFSET ${offset};
    SELECT FOUND_ROWS() AS count; `;
    try {
        const result = await db.sequelize.query(query);
        return _.uniq(result, 'order_id');
    } catch (err) {
        return err
    }
}

async function getEmployeeReport(data) {
    return new Promise(async (resolve, reject) => {
        let limit = data.limit ? +data.limit : 10,
            offset = data.offset ? +data.offset * +limit : 0,
            where = data.full_name ? `employees.full_name LIKE '%${data.full_name}%'` : `1`;
        let query = `
        SELECT SQL_CALC_FOUND_ROWS orders.id, employees.id AS employee_id, employees.full_name AS name, employees.created_at AS created_at, 
            employees.updated_at AS updated_at, orders.service_type AS service_type, orders.id AS order_id, orders.rating AS order_rating, 
            SUM(orders.total_price) AS total_earning, IFNULL(FORMAT(AVG(orders.rating), 1), 0) AS average_rating
        FROM employees
        INNER JOIN orders ON orders.employee_id = employees.id
        WHERE DATE(orders.created_at) >= '${data.start_date}' 
            AND DATE(orders.created_at) <= '${data.end_date}' 
            AND ${where}
            AND orders.status = 'COMPLETED'
        ORDER BY orders.created_at DESC
        LIMIT ${limit} OFFSET ${offset};
        SELECT FOUND_ROWS() AS count;`;
        try {
            const result = await db.sequelize.query(query);
            return resolve(_.uniq(result, 'order_id'));
        } catch (err) {
            console.error(err);
            return reject(err)
        }
    })
}

async function getcustomers() {
    try {
        const query = `
            SELECT JSON_ARRAY(JSON_OBJECT('id',c.id,'custom',JSON_OBJECT('id', c.id,'full_name', c.full_name,'email', c.email, 'location', c.location)))
            
        FROM customers c`;
        return await db.sequelize.query(query);
    } catch (err) {
        return console.error(err);
    }
}