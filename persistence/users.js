const moment = require('moment');
const uuidv4 = require('uuid/v4');
const db = require('./db');
const Helper = require('./helper');

const User = {

    async create(req, res) {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({'message': 'Some values are missing'});
        }
        if (!Helper.isValidEmail(req.body.email)) {
            return res.status(400).send({ 'message': 'Please enter a valid email address' });
        }
        const hashPassword = Helper.hashPassword(req.body.password);

        const createQuery = `INSERT INTO
      users(id, email, password, firstName, lastName, role, created_date, modified_date)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8)
      returning *`;
        const values = [
            uuidv4(),
            req.body.email,
            hashPassword,
            req.body.firstName,
            req.body.lastName,
            req.body.role,
            moment(new Date()),
            moment(new Date())
        ];

        try {
            const client = await db.connect();
            await client.query(`
                CREATE TABLE IF NOT EXISTS
                users(
                    id UUID PRIMARY KEY,
                    email VARCHAR(128) UNIQUE NOT NULL,
                    password VARCHAR(128) NOT NULL,
                    firstName VARCHAR(128) NOT NULL,
                    lastName VARCHAR(128) NOT NULL,
                    role VARCHAR(10) NOT NULL,
                    created_date TIMESTAMP,
                    modified_date TIMESTAMP
                )`);
            const { rows } = await client.query(createQuery, values);
            const token = Helper.generateToken(rows[0].id);
            return res.status(201).send({ "id":rows[0].id, "username":req.body.email, "firstName":req.body.firstName, "lastName":req.body.lastName, "role":req.body.role, "token":token });
        } catch(error) {
            if (error.routine === '_bt_check_unique') {
                return res.status(400).send({ 'message': 'User with that EMAIL already exist' })
            }
            return res.status(400).send(error);
        }
    },


    async login(req, res) {
        if (!req.body.email || !req.body.password) {
            return res.status(400).send({'message': 'Some values are missing'});
        }
        if (!Helper.isValidEmail(req.body.email)) {
            return res.status(400).send({ 'message': 'Please enter a valid email address' });
        }
        const text = 'SELECT * FROM users WHERE email = $1';
        try {
            const client = await db.connect();
            const { rows } = await client.query(text, [req.body.email]);
            if (!rows[0]) {
                return res.status(400).send({'message': 'The credentials you provided is incorrect'});
            }
            if(!Helper.comparePassword(rows[0].password, req.body.password)) {
                return res.status(400).send({ 'message': 'The credentials you provided is incorrect' });
            }
            const token = Helper.generateToken(rows[0].id);
            return res.status(200).send({ "id":rows[0].id, "username":rows[0].email, "firstName":rows[0].firstName, "lastName":rows[0].lastName, "role":rows[0].role, "token":token  });
        } catch(error) {
            return res.status(400).send(error)
        }
    },

    async getUsers(req, res) {
        const getUsersQuery = 'SELECT * FROM users returning *';
        try {
            const client = await db.connect();
            const { rows } = await client.query(getUsersQuery);
            if(!rows[0]) {
                return res.status(404).send({'message': 'user not found'});
            }
            var result = [];
            for (var row in rows) {
                result.push({ "id":rows.id, "username":rows.email, "firstName":rows.firstName, "lastName":rows.lastName, "role":rows.role});
            }
            return res.status(200).send(JSON.stringify(result));
        } catch(error) {
            return res.status(400).send(error);
        }
    },

    async getUser(req, res) {
        const getUsersQuery = 'SELECT * FROM users WHERE id = $1 returning *';
        try {
            const client = await db.connect();
            const { rows } = await client.query(getUsersQuery,[req.body.id]);
            if(!rows[0]) {
                return res.status(404).send({'message': 'user not found'});
            }
            return res.status(200).send({ "id":rows[0].id, "username":rows[0].email, "firstName":rows[0].firstName, "lastName":rows[0].lastName, "role":rows[0].role });
        } catch(error) {
            return res.status(400).send(error);
        }
    },

    async delete(req, res) {
        const deleteQuery = 'DELETE FROM users WHERE id=$1 returning *';
        try {
            const client = await db.connect();
            const { rows } = await client.query(deleteQuery, [req.user.id]);
            if(!rows[0]) {
                return res.status(404).send({'message': 'user not found'});
            }
            return res.status(204).send({ 'message': 'deleted' });
        } catch(error) {
            return res.status(400).send(error);
        }
    }
}

module.exports = User;