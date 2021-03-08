const Sequelize = require("sequelize");

const config = require('../config/keys');
// const users = require("./users");
const sequelize = new Sequelize(config.mysqlDB, config.mysqlUser, config.mysqlPassword, {
    host: config.mysqlHost,
    dialect: 'mysql',
    operatorsAliases: 0,
    logging: true,
    dialectOptions: {
        multipleStatements: true
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

Users = require("./users.js")(sequelize, Sequelize);
Supervisor = require("./supervisor.js")(sequelize, Sequelize);
Ratings = require("./ratings.js")(sequelize, Sequelize);
Sessions = require("./session")(sequelize, Sequelize);
Products = require("./products.js")(sequelize, Sequelize);
Offers = require("./offers.js")(sequelize, Sequelize);
Services = require("./services.js")(sequelize, Sequelize);
Notifications = require("./notifications.js")(sequelize, Sequelize);
Customers = require("./customers.js")(sequelize, Sequelize);
Orders = require("./orders.js")(sequelize, Sequelize);
ProductOrders = require("./product_orders.js")(sequelize, Sequelize);
Employees = require("./employees.js")(sequelize, Sequelize);

// Promise.all[Users.sync(), Supervisor.sync(), Ratings.sync(), Sessions.sync(), ProductOrders.sync(), Offers.sync(), 
// Services.sync(), Notifications.sync(), Customers.sync(), Orders.sync(), ProductOrders.sync(), Employees.sync()]

module.exports = { db, Products, Offers, Services, Notifications, Users, Supervisor, Employees, Ratings, ProductOrders, Orders, Customers, Sessions };
