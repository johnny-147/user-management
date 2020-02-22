const {Pool} = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    max: 10,
    connectionString: process.env.DATABASE_URL
});

pool.on('connect', () => {
    console.log('connected to the db');
});

/**
 * Create User Table
 */
const createUserTable = () => {
    const queryText =
        `CREATE TABLE IF NOT EXISTS
      users(
        id UUID PRIMARY KEY,
        email VARCHAR(128) UNIQUE NOT NULL,
        password VARCHAR(128) NOT NULL,
        created_date TIMESTAMP,
        modified_date TIMESTAMP
      )`;

    pool.query(queryText)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
}

/**
 * Drop User Table
 */
const dropUserTable = () => {
    const queryText = 'DROP TABLE IF EXISTS users returning *';
    pool.query(queryText)
        .then((res) => {
            console.log(res);
            pool.end();
        })
        .catch((err) => {
            console.log(err);
            pool.end();
        });
}
/**
 * Create All Tables
 */
const createAllTables = () => {
    createUserTable();
}
/**
 * Drop All Tables
 */
const dropAllTables = () => {
    dropUserTable();
}

pool.on('remove', () => {
    console.log('client removed');
    process.exit(0);
});


module.exports = {
    createUserTable,
    createAllTables,
    dropUserTable,
    dropAllTables
};
module.exports = pool;