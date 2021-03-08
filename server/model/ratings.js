/* jshint indent: 2 */
module.exports = function (sequelize, DataTypes) {
    return sequelize.define('ratings', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true
        },
        stars: {
            type: DataTypes.INTEGER(11),
            allowNull: true
        },
        rate_to: {
            type: DataTypes.INTEGER(11),
            allowNull: false
        },
        rate_by: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        type: { // who rated
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
        tableName: 'ratings',
        timestamps: false
    });
};