const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        // Model attributes are defined here
        name: {
            type: DataTypes.STRING,
        },
        job: {
            type: DataTypes.STRING
        },
        province: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.STRING,
        },
        callNumber: {
            type: DataTypes.STRING,
        },
        whatsapp: {
            type: DataTypes.STRING,
        },
        instagram: {
            type: DataTypes.STRING,
        },
        telegram: {
            type: DataTypes.STRING,
        },
        meta: {
            type: DataTypes.JSON,
        }
    }, {
        // Other model options go here
        tableName: 'users'
    });

    return User;
}