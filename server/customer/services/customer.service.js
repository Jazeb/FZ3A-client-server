const _ = require("lodash");
const { Customers, Users, Orders, ProductOrders } = require('../../model/index');
const { encryptPassword } = require('../../shared/shared');

module.exports = {
    getCurrentLocation,
    customerSignup,
    updateLocation,
    placeOrder,
    updateOrder,
    orderShopItem,
    updateProfile,
};

async function getCurrentLocation(data) {
    return new Promise(async (resolve, reject) => {
        try {
            let location = await Customers.findAll({ attributes: ['location'], where: { id: data.id } });
            location && resolve(location);
        } catch (err) {
            reject(err)
        }
    });

}

function customerSignup(customer) {
    return new Promise((resolve, reject) => {
        Customers.create({ // create customer in customers table
            full_name: customer.full_name,
            email: customer.email,
            phone_number: customer.phone_number || null,
        })
            .then((data) => {
                let hashed_password = customer.password ? encryptPassword(customer.password) : null
                Users.create({ // then create user in users table
                    full_name: data.full_name,
                    email: data.email,
                    password: hashed_password,
                    user_type: 'customer',
                    user_id: data.id,
                    isSocial_login: customer.isSocial_login,
                    access_token: customer.access_token || null,
                    social_login: customer.social_login || null
                })
                    .then((data) => resolve(data))
                    .catch((err) => reject(err));
            })
            .catch((err) => reject(err))
    });
}

function updateLocation(fields) {
    return new Promise((resolve, reject) => {
        let location = JSON.stringify(fields.location);
        Customers.update({
            location: location
        }, { where: { id: fields.id } })
            .then((result) => resolve(result))
            .catch((err) => reject(err));
    });
}

function orderShopItem(data) {
    return new Promise((resolve, reject) => {
        let order = {
            product_id:data.item_id,
            customer_id: data.user.user_id,
            status: 'PENDING',
            quantity:data.quantity
        }
        ProductOrders.create(order)
            .then(added => added && resolve(true))
            .catch(err => reject(err))
    });
}

function placeOrder(data, customer) {
    return new Promise((resolve, reject) => {
        const order = {
            customer_id: customer.user_id,
            service_type: data.service_type,
            service_id: data.service_id,
            todo: data.todo,
            status: 'PENDING',
            customer_name: customer.full_name,
            notes: data.notes,
            datetime: data.datetime,
            images: data.images,
            address: data.address
        }
        Orders.create(order)
            .then(() => resolve(true))
            .catch((err) => reject(err))
    });
}

function updateOrder(data) {
    return new Promise((resolve, reject) => {
        let where = {
            id: data.order_id,
            customer_id: data.customer_id
        }

        Orders.update({ status: data.status, end_time: data.end_time ? data.end_time : null }, { where })
            .then(() => resolve(true))
            .catch((err) => reject(err))
    });
}

function updateProfile(id, data) {
    return new Promise(async (resolve, reject) => {
        // ony update password in users table
        try {
            let user_data = {
                full_name: data.full_name,
                phone_number: data.phone_number,
                gender: data.gender,
                dob: data.dob,
                image: data.image
            }

            const updateUser = await Users.update({ full_name: data.full_name }, { where: { user_id: id } });
            const updateCustomer = await Customers.update(user_data, { where: { id: id } });
            Promise.all([updateUser, updateCustomer])
                .then(() => resolve(true))
                .catch((err) => reject(err));
        } catch (error) {
            reject(error)
        }
    });
}
