const fcm = require('../config/fcm');

module.exports = {
    orderAssignedNotification
}

function orderAssignedNotification(data) {
    try {
        let ids = []
        ids.push(data.fcm_token);
        let message = {
            registration_ids: ids,
            collapse_key: 'NEW_USER',
            notification: {
                title: "Order Assigned",
                body: data.message
            },
            data: {
                id: 1,
                body: data.message
            }
        }

        fcm.send(message, (err, response) => {
            console.log('HI');
            err
                ? console.error(err)
                : console.log(response)
        });
    } catch (err) {
        console.error(err);
    }

}