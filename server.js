const express = require('express');
const morgan = require('morgan');
const UserWithDb = require('./persistence/users');
const Auth = require('./middleware/auth');
const helmet = require('helmet');

const app = express();

app.use(morgan('short'));
app.use(express.json());
app.use(helmet());

app.get('/', (req, res) => res.sendStatus(200));
app.get('/health', (req, res) => res.sendStatus(200));
app.post('/api/users', UserWithDb.create);
app.post('/api/users/login',UserWithDb.login);
app.delete('/api/users/me', Auth.verifyToken, UserWithDb.delete);

let server;
module.exports = {
    start(port) {
        server = app.listen(port, () => {
            console.log(`App started on port ${port}`);
        });
        return app;
    },
    stop() {
        server.close();
    }
};
