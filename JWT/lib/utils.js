/* eslint-disable max-len */
/* eslint-disable linebreak-style */
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validate } = require('uuid');

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param {*} password - The plain text password
 * @param {*} hash - The hash stored in the database
 * @param {*} salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */
function validPassword(password, hash) {
  // var hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'bcrypt').toString('hex');
  // return hash === hashVerify;

  return bcrypt.compare(password, hash).then((result) => result);
}

/**
 *
 * @param {*} password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */
function genPassword(password) {
  return bcrypt.hash(password, 12).then((hash) => hash);
}

/**
 * @param {*} user - The user object.  We need this to set the JWT `sub` payload property to the MongoDB user ID
 */
function issueJWT(user) {
  const id = user.user_email;
  const expiresIn = '7d';

  const payload = {
    sub: id,
    iat: Date.now(),
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn, algorithm: 'RS256' });

  return {
    token: `Bearer ${signedToken}`,
    expires: expiresIn,
  };
}

const validateEmail = (email) => {
  if (typeof email === 'string' && email.length > 0 && email.length <= 50 && email.search(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) === 0) return true;
  return false;
};

const validatePassword = (password) => {
  if (typeof password === 'string' && password.length > 0 && password.length <= 12) return true;
  return false;
};

const validateUserType = (userType) => {
  if (userType === 'labour' || userType === 'employer' || userType === 'admin') return true;
  return false;
};

const validateMobile = (mobile) => {
  if (mobile > 1000000000 && mobile < 10000000000) return true;
  return false;
};

function validateSchema({ login, register }) {
  if (login) {
    const { email, password } = login;
    if (email && password) {
      if (validateEmail(email)) {
        if (validatePassword(password)) return { success: true };
        return { success: false, error: 'Invalid Password' };
      } return { success: false, error: 'Invalid Email id' };
    } return { success: false, error: 'Bad Request' };
  } if (register) {
    const {
      email, username, mobile, password, userType, details,
    } = register;
    if (email && username && mobile && password && userType && (details === 0 || details === 1)) {
      if (validateEmail(email)) {
        if (validatePassword(password)) {
          if (validateMobile(mobile)) {
            if (typeof username === 'string' && username.length > 0 && username.length <= 50) {
              if (validateUserType(userType)) return { success: true };
              return { success: false, error: 'Invalid Usertype' };
            } return { success: false, error: 'Invalid Username' };
          } return { success: false, error: 'Invalid mobile number' };
        } return { success: false, error: 'Invalid password' };
      } return { success: false, error: 'Invalid Email id' };
    } return { success: false, error: 'Bad Request' };
  }
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.validateSchema = validateSchema;
