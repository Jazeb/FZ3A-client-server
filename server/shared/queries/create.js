const { Notifications } = require('../../model/index');

module.exports = {
    notifyAdmin,
    notifyManager,
    notifyCustomer,
    notifyEmployee,
    notifySupervisor
}

function notifySupervisor(data) {
    return new Promise((resolve, reject) => {
        data.user_type = 'SUPERVISOR'; // shold be shown for superisor
        Notifications.create(data)
            .then(added => added && resolve(true))
            .catch(err => reject(err));
    });

}

function notifyAdmin(data) {
    return new Promise((resolve, reject) => {
        data.user_type = 'ADMIN'; // shold be shown for admin
        Notifications.create(data)
            .then((added) => added && resolve(true))
            .catch((err) => reject(err));
    });
}

function notifyCustomer(data) {
    return new Promise((resolve, reject) => {
        data.user_type = 'CUSTOMER'; // shold be shown for CUSTOMER
        Notifications.create(data)
            .then((added) => {
                console.log('customer notifications added');
                return added && resolve(true)
            } )
            .catch(err => reject(err));
    });
}

function notifyEmployee(data) {
    return new Promise((resolve, reject) => {
        data.user_type = 'EMPLOYEE'; // shold be shown for EMPLOYEE
        Notifications.create(data)
            .then(added => added && resolve(true))
            .catch(err => reject(err));
    });
}


function notifyManager(data) {
    return new Promise((resolve, reject) => {
        data.user_type = 'MANAGER'; // shold be shown for EMPLOYEE
        Notifications.create(data)
            .then(added => {
                console.log('Manager notified')
                return resolve(true)
            })
            .catch(err => reject(err));
    });
}

// import addratings here