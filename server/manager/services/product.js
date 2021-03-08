"use strict"
const { db, Products, ProductOrders } = require('../../model/index');
const update = require('../../shared/queries/update');
const Op = db.Sequelize.Op;
const Sequelize = require('sequelize');

module.exports = {
    addProduct,
    updateProduct,
    getProductOrders,
    deleteOrder,
    updateStatus
}

async function addProduct(fields) {
    return new Promise(async (resolve, reject) => {
        let data = {
            title: fields.title,
            description: fields.description,
            price: fields.price,
            inventory: fields.inventory,
            tax_rate: fields.tax_rate,
            image: fields.image
        }
        try {
            let created = await Products.create(data);
            return created && resolve(true)
        } catch (err) {
            return reject(err)
        }
    });
}

async function updateProduct(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let updated = await Products.increment('quantity', { by: data.value, where: { id: data.id } });
            return updated && resolve(true)
        } catch (err) {
            return reject(err)
        }
    });
}

async function getProductOrders(status, limit, offset) {

    try {
        return await db.sequelize.query(`select products.id, products.title, products.description, products.price, products.inventory, 
        products.tax_rate, customers.full_name, product_orders.status
        from products
        inner join product_orders on product_orders.product_id = products.id and product_orders.status='${status}'
        inner join customers on customers.id = product_orders.customer_id
        group by product_orders.id
        order by id desc
        limit ${limit} offset ${offset}`, {
            type: Sequelize.QueryTypes.SELECT
        });
    } catch (err) {
        throw err;
    }
}

async function deleteOrder(id) {

    try {
        return await ProductOrders.destroy({
            where: {
                id: id
            }
        })
    } catch (err) {
        throw err;
    }
}

async function updateStatus(id, status, table_name) {
    return new Promise(async(resolve, reject) => {
        try {
            let updated = await update.updateStatus({ table_name, id, status })
            return updated && resolve(true)
        } catch (err) {
            reject(err);
        }
    });
}