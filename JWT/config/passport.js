/* eslint-disable linebreak-style */
const fs = require('fs');
const path = require('path');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

const strategy = (connection) => (new JwtStrategy(options, (payload, done) => {
  connection.query(`SELECT * FROM user_accounts WHERE username='${payload.sub}'`, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user[0]);
    }
    return done(null, false);
  });
}));

module.exports = (passport, connection) => {
  passport.use(strategy(connection));
};
