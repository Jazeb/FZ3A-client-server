/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('employees', {
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
        image: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        areas: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN(),
            allowNull: true,
        },
        national_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        ssn: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        service: {
            type: DataTypes.STRING(255),
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
        tableName: 'employees',
        timestamps: false
    });
};