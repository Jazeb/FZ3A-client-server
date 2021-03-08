module.exports = function (sequelize, DataTypes) {
    return sequelize.define('notifications', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true // make it false when image part is done
        },
        message: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        role: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        user_type: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        foreign_id: {
            type: DataTypes.INTEGER(),
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
        tableName: 'notifications',
        timestamps: false
    });
};