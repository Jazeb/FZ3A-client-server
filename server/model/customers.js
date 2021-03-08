/* jshint indent: 2 */
const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('customers', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        user_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            default:''
        },
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        location: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        address: {
            type: DataTypes.TEXT(),
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        dob: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        fcm_token: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: moment().format(),
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: moment().format()//sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'customers',
        timestamps: false
    });
};