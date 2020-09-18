module.exports = (dbConnection) => {
  const router = require('express').Router();

  const passport = require('passport');
  const utils = require('../lib/utils');

  router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    res.status(200).json({ success: true, msg: "You are successfully authenticated to this route!"});
  });

  router.post('/login', function(req, res, next){
    dbConnection.query(`SELECT * FROM employer_accounts WHERE username = ${req.body.username}`, (err, user) => {
      if (err) next(err);
      if (!user) {
        res.status(401).json({ success: false, msg: "could not find user" });
      }
      if (user) {
        const isValid = utils.validPassword(req.body.password, user[0].hash, user[0].salt);
        if (isValid) {
          const tokenObject = utils.issueJWT(user[0]);
          res.status(200).json({ success: true, token: tokenObject.token, expiresIn: tokenObject.expires });
        } else {
          res.status(401).json({ success: false, msg: "you entered the wrong password" });
        }
      }
    })
  });

  // TODO
  router.post('/register', function(req, res, next){
    const saltHash = utils.genPassword(req.body.password);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    dbConnection.query(`INSERT INTO employer_accounts VALUE (${req.body.username}, ${hash}, ${salt})`, (err, user) => {
      if (err) return next(err);
      if (user) {
        const jwt = utils.issueJWT(user[0]);
        return res.json({ success: true, user: user, token: jwt.token, expiresIn: jwt.expires });
      }
    });
  });
  return router;
};
