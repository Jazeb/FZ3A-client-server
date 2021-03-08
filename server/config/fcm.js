const FCM = require('fcm-node');
const serverKey = require('./keys').fcm_server_key;

module.exports = new FCM(serverKey);