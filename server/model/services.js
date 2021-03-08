/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('services', {
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
        title_ar: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        title_en: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        status: {
            type: DataTypes.BOOLEAN(255),
            allowNull: false,
            defaultValue: true
        },
        sub_services: {
            type: DataTypes.TEXT(),
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
        tableName: 'services',
        timestamps: false
    });
};