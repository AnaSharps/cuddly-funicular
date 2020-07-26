const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database:'nodelogin'
})

connection.connect(function (err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    let sql = 'SELECT * FROM accounts';
    connection.query(sql, (error, results, fields) => {
        if (error) return console.error(error.message);
        console.log(results);
    });
}); 

const app = express();

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/login.html'));
});

app.listen(3000);