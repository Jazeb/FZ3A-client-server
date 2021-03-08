const { db, Ratings, Employees, Services, Offers, Users, Orders, Customers, Products, ProductOrders } = require('../../model/index');
const { encryptPassword } = require('../shared');
const redis = require("redis");
const client = redis.createClient();

module.exports = {
    addRatings,
    updateStatus,
    update,
    updatePassword,
}

function addRatings(data) {
    return new Promise(async (resolve, reject) => {
        let ratings  = {
            stars : data.stars,
            rate_to : data.rate_to,
            rate_by : data.rate_by,
            type : data.type // type will be who rated customer or employee
        }

        let reviewd_data = {
            customer_reviewed : data.type == 'CUSTOMER' ? true : false,
            employee_reviewed : data.type == 'EMPLOYEE' ? true : false,
        }
        try {
            if(data.type == 'CUSTOMER') {

                Promise.all([Ratings.create(ratings), Orders.update({rating:ratings.stars}, {where:{id:data.order_id}})])
                    .then(() => resolve(true))
                    .catch((err) => reject(err))
            }
            else {
                let created = await Ratings.create(ratings);
                if(data.order_id){
                    let updated = await Orders.update(reviewd_data, {where:{id:data.order_id}});
                    created && updated && resolve(true)
                }
                else {
                    created && resolve(true)
                }
            }
        } catch (err) {
            console.error(err);
            return reject(err);
        }
    });
}

function updateStatus(data) {
    return new Promise((resolve, reject) => {
        let table_name = data.table_name;
        let Model = table_name == 'PRODUCTS' ? Products
        : table_name == 'EMPLOYEES' ? Employees
        : table_name == 'PRODUCT_ORDERS' ? ProductOrders
        : table_name == 'ORDERS' ? Orders
        : table_name = null;

        table_name == null && reject('Invalid table name')
        table_name && Model.update({ status: data.status }, { where: { id: data.id } })
            .then(() => resolve(true))
            .catch((err) => reject(err))
    });
}

function updatePassword(params) {
    return new Promise((resolve, reject) => {
        let hashed_password = encryptPassword(params.new_password);
        let data = {password: hashed_password}
        if(params.reset)
            data.reset_password = true;
        Users.update(data, { where: { id: params.id } })
            .then(() => resolve(true))
            .catch(err => reject(err));
    });
}

function update(data) {
    return new Promise(async (resolve, reject) => {
        let { id, role, table_name } = data;
        delete data.id;
        delete data.role;
        delete data.email;

        let Model = table_name == 'EMPLOYEE' ? Employees
            : table_name == 'SERVICE' ? Services
            : table_name == 'ORDER' ? Orders
            : table_name == 'CUSTOMER' ? Customers
            : table_name == 'OFFER' ? Offers
            : table_name == 'PRODUCT' ? Products
            : table_name == 'PRODUCT_ORDER' ? ProductOrders
            : null;

        if(data.remaning){
            let updateInventory = await db.sequelize.query(`UPDATE products SET remaining_items = products.inventory - ${+data.quantity} WHERE id = ${data.item_id}`)
            updateInventory && resolve(true)
            return
        }
        table_name = data.table_name == 'EMPLOYEE' ? role : table_name;
        delete data.table_name
        delete data.role

        if (Model == null)
            return reject('Invalid table');
        Model && Model.update(data, { where: { id: +id } })
            .then(() => {
                // let keys = ['ORDER_PENDING', 'ORDER_ONGOING']
                // client.del(table_name, (err, response) => {
                //     if(err) console.error(err)
                //     else console.log(table_name + ' deleted from REDIS')
                // });
                resolve(true)
            })
            .catch(err => reject(err))
    });
}