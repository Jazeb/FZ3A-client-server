const { Orders, Employees, Customers, Products, ProductOrders, Offers } = require('../../model/index');
const redis = require("redis");
const client = redis.createClient();

module.exports = {
    deleteRecord
}

function deleteRecord(data) {
    return new Promise((resolve, reject) => {
        try {
            let Model = data.table_name == 'ORDER' ? Orders
                : data.table_name == 'EMPLOYEE' ? Employees
                : data.table_name == 'CUSTOMER' ? Customers
                : data.table_name == 'PRODUCT' ? Products
                : data.table_name == 'PRODUCT_ORDER' ? ProductOrders
                : data.table_name == 'OFFER' ? Offers
                : data.table_name == 'SERVICE' ? Services
                : null
            if (Model == null)
                return reject('invalid table name');

            Model && Model.destroy({ where: data.where })
                .then(() => {
                    if(data.table_name == 'ORDER'){
                        client.del('ORDER_COMPLETED');
                        client.del('ORDER_PENDING');
                        client.del('ORDER_ONGOING');
                    }else client.del(data.table_name);
                    return resolve(true)})
                .catch((err) => reject(err))
        } catch (error) {
            reject(error)
        }
    });
}
