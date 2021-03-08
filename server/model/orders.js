/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('orders', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        customer_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true 
        },
        customer_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        service_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        service_type:{
            type: DataTypes.STRING(255),
            allowNull: false
        },
        employee_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        employee_name: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        estimated_price: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        notes: {
            type: DataTypes.STRING(),
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        todo: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        start_time: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        end_time: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        datetime: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        images: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        rating: {
            type: DataTypes.INTEGER(5),
            allowNull: true,
        },
        total_price: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            default:0
        },
        vat: {
            type: DataTypes.INTEGER(10),
            allowNull: true,
            default:0
        },
        customer_reviewed: {
            type: DataTypes.BOOLEAN(255),
            allowNull: true,
        },
        employee_reviewed: {
            type: DataTypes.BOOLEAN(255),
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
        }
    }, {
        sequelize,
        tableName: 'orders',
        timestamps: false
    });
};