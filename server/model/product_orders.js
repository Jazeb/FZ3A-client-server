/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('product_orders', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        product_id: {
            type: DataTypes.INTEGER(11),
            allowNull: true 
        },
        customer_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 1
        },
        status: {
            type: DataTypes.STRING(255),
            allowNull: false,
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
        tableName: 'product_orders',
        timestamps: false
    });
};