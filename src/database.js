/* eslint-disable linebreak-style */
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'final_anb',
});

require('../JWT/config/passport')(passport, connection);

const app = express();

app.use(passport.initialize());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use(require('../JWT/routes')(connection));

app.listen(3000, () => {
    console.log('listening on *:3000');
});
