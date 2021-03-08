'use strict'
const _ = require('lodash');
const { Op } = require('sequelize');
const { Orders, Customers, Products, Employees } = require('../../model/index');

module.exports = {
    getById
}
/********************************
 * Here we can get all data of any table.
 * we need to pass table name in parameter
 */

function getById(data) {
    return new Promise(async (resolve, reject) => {
        const table_name = data.table_name;
        if (_.isEmpty(table_name))
            return reject('provide table name')

        switch (data.table_name) {
            case 'PRODUCTS':
                try {
                    const item = await Products.findOne({ where: { id: +data.id } });
                    return !item ? resolve(false) : resolve(item);
                } catch (err) {
                    reject(err)
                }
            case 'CUSTOMER':
                try {
                    const customer = await Customers.findAll({ where: { id: data.id } });
                    resolve(customer);
                } catch (err) {
                    reject(err)
                }
                break;
            case 'ORDER':
                try {
                    // [data.key]: data.value, status:'PENDING', status:'ONGOING'} 
                    if (data.key && data.key == 'placeOrder') {
                        let where = {
                            customer_id: data.customer_id,
                            [Op.or]: [
                                { status: 'PENDING' },
                                { status: 'ONGOING' },
                            ]
                        };
                        const order = await Orders.findAll({ where });
                        return resolve(order);
                    }
                    delete data.table_name;

                    const order = await Orders.findAll({ where: data }); //change it to search by key
                    return resolve(order);
                } catch (err) {
                    reject(err)
                }
            case 'EMPLOYEE':
                try {
                    let where = { id: data.id }
                    let employee = await Employees.findOne({ where });
                    return resolve(employee)
                } catch (err) {
                    return resolve(err)
                }
            default:
                reject('invalid table name')
                break;
        }
    });

}