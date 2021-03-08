const envVars = process.env;
require("dotenv").config();

module.exports = config = {
    server_port: envVars.SERVER_PORT,
    jwtSecret: envVars.JWT_SECRET,
    mysqlHost: envVars.LIVE_HOST,
    mysqlDB: envVars.DATABASE,
    mysqlUser: envVars.MYSQL_USER,
    mysqlPassword: envVars.PASSWORD,
    fcm_server_key:envVars.FCM_SERVER_KEY
};
