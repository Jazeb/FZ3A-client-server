/* jshint indent: 2 */
const moment = require("moment");
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('supervisors', {
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
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        ssn: {
            type: DataTypes.INTEGER(255),
            allowNull: true
        },
        national_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
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
        tableName: 'supervisors',
        timestamps: false
    });
};