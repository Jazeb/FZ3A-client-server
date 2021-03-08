/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('users', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        full_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            unique: true
        },
        user_type:{
            type: DataTypes.STRING(255),
            allowNull: true
        },
        role:{
            type: DataTypes.STRING(255),
            allowNull: true
        },
        user_id:{
            type: DataTypes.INTEGER(11),
            allowNull: true,
        },
        social_login: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        access_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        isSocial_login: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
        },
        reset_password: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: false
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
    },
    {
        indexes: [
            {
                unique: false,
                fields: ['email']
            }
        ],
        sequelize,
        tableName: 'users',
        timestamps: false
    });
};