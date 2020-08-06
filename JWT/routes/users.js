/* eslint-disable max-len */
/* eslint-disable linebreak-style */
module.exports = (dbConnection) => {
  const express = require('express');
  const router = express.Router();
  const passport = require('passport');
  const utils = require('../lib/utils');

  router.use(express.json());

  router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.status(200).json({ success: true, msg: 'You are successfully authenticated to this route!' });
  });

  router.post('/login', (req, res, next) => {
    if (req.body.username && req.body.password) {
      dbConnection.query(`SELECT * FROM user_accounts WHERE username = '${req.body.username}'`, (err, user) => {
        if (err) next(err);
        if (!user[0]) {
          res.status(401).json({ success: false, msg: 'could not find user' });
        }
        if (user[0]) {
          utils.validPassword(req.body.password, user[0].hash).then((isValid) => {
            if (isValid) {
              const tokenObject = utils.issueJWT(user[0]);
              res.status(200).json({ success: true, user: user[0].username, token: tokenObject.token, expiresIn: tokenObject.expires });
            } else {
              res.status(401).json({ success: false, msg: 'you entered the wrong password' });
            }
          });
        }
      });
    } else {
      res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  // TODO
  router.post('/register', (req, res, next) => {
    dbConnection.query(`SELECT username FROM user_accounts WHERE username='${req.body.username}'`, (err, user) => {
      if (user[0]) return res.json({ success: false, msg: 'user already exists' });

      utils.genPassword(req.body.password).then((hash) => {
        dbConnection.query(`INSERT INTO user_accounts (username, hash) VALUES ('${req.body.username}', '${hash}')`, (err, user) => {
          if (err) return next(err);
          if (user) {
            const jwt = utils.issueJWT({ username: req.body.username });
            return res.json({
              success: true, user: req.body.username, token: jwt.token, expiresIn: jwt.expires
            });
          }
        });
      });
    });
  });
  return router;
};
