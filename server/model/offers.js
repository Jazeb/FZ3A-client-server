/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('offers', {
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
        phone_number: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN(),
            allowNull: false,
            defaultValue: true
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
        tableName: 'offers',
        timestamps: false
    });
};