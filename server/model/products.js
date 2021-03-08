/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('products', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        price: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        service_id:{
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        no_of_days: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        remaining_items:{
            type: DataTypes.INTEGER(11),
            allowNull: true,
            min:0
        },
        state: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        status: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: true
        },
        quantity: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            defaultValue: 1
        },
        inventory: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        tax_rate: {
            type: DataTypes.INTEGER(11),
            allowNull: true
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
        tableName: 'products',
        timestamps: false
    });
};