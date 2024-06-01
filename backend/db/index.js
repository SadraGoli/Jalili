const config = require('../config');
const mysql = require('mysql2/promise');
const { Sequelize } = require('sequelize');

const logger = require('../logger')

module.exports = db = {};

(async () => {
    try {
        await initialize();
        console.log('initializing database has been done successfully.');
    } catch (error) {
        console.error('Unable to initialize the database:', error);
        logger.error('Unable to initialize the database: ' + String(error), { meta: { message: error.message, name: error.name, stack: error.stack, promise }, file: __filename, func: 'initialize' })
    }
})()

async function initialize() {
    // create db if it doesn't already exist
    const { host, port, user, password, database } = config.database;
    const connection = await mysql.createConnection({ host, port, user, password });

    // create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);

    // connect to db
    const sequelize = new Sequelize(database, user, password, {
        define: {
            charset: 'utf8',
            collate: 'utf8_general_ci',
        },
        dialect: 'mysql',
        logging: false
    });

    // init models and add them to the exported db object
    db.User = require('./models/user')(sequelize);

    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // sync all models with database
    await sequelize.sync({
        alter: true
    });
    console.log('database has been synced successfully.');
}