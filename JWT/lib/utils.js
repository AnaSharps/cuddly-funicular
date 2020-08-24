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

const schemaDefinations = {
  login: {
    email: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    password: { type: 'string', maxLength: 12 },
  },
  register: {
    username: { type: 'string', maxLength: 50 },
    email: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    mobile: { type: 'string', maxLength: 10, regex: /^[0-9]{10}$/g },
    password: { type: 'string', maxLength: 12 },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
    details: { type: 'number', regex: /^(0|1)$/g },
  },
  updateMe: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
    userSkills: { isArray: true, typeElement: 'string', maxLengthElement: 50 },
    userVillage: { type: 'string', maxLength: 50 },
    userCity: { type: 'string', maxLength: 50 },
    userState: { type: 'string', maxLength: 100 },
    details: { type: 'number', regex: /^(0|1)$/g },
    updateInfo: { type: 'boolean' },
  },
  searchVacancy: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    skills: { type: 'string', minLength: 0, maxLength: 50 },
    location: { type: 'string', minLength: 0, maxLength: 50 },
    company: { type: 'string', minLength: 0, maxLength: 50 },
  },
  createVacancy: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
    userSkills: { isArray: true, typeElement: 'string', maxLengthElement: 50 },
    userVillage: { type: 'string', maxLength: 50 },
    userCity: { type: 'string', maxLength: 50 },
    userState: { type: 'string', maxLength: 100 },
    vacancy: { type: 'bigint', regex: /^[0-9]*$/g },
    jobDesc: { type: 'string', maxLength: 300 },
    jobName: { type: 'string', maxLength: 50 },
  },
  searchLabour: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    skills: { type: 'string', minLength: 0, maxLength: 50 },
    location: { type: 'string', minLength: 0, maxLength: 50 },
  },
  viewJobsLabour: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
  },
  applyforJob: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    vacancyId: { type: 'string', maxLength: 40 },
  },
  withdrawJob: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    vacancyId: { type: 'string', maxLength: 40 },
  },
  viewApplications: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    vacancyId: { type: 'string', maxLength: 40 },
  },
  viewLabour: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
  },
  viewVacancies: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
  },
};

function verifySchema(request, body) {
  let isValid = true;
  Object.keys(schemaDefinations[request]).forEach((val) => {
    if (isValid && Object.keys(body).indexOf(val) < 0) isValid = false;
  });
  if (isValid) {
    const bodyKeys = Object.keys(body);
    const schema = schemaDefinations[request];
    for (let key = 0; key < bodyKeys.length; key += 1) {
      const bodyKey = body[bodyKeys[key]];
      const schemaKey = schema[bodyKeys[key]];
      if (schemaKey.type && typeof bodyKey !== schemaKey.type) return false;
      if (schemaKey.minLength && schemaKey.maxLength && (bodyKey.length < schemaKey.minLength || bodyKey.length > schemaKey.maxLength)) return false;
      if (!schemaKey.minLength && schemaKey.maxLength && (bodyKey.length <= 0 || bodyKey.length > schemaKey.maxLength)) return false;
      if (schemaKey.regex && bodyKey.search(schemaKey.regex) !== 0) return false;
      if (schemaKey.isArray && !Array.isArray(bodyKey)) return false;
      if (schemaKey.typeElement) {
        let validElement;
        bodyKey.forEach((val) => {
          if (validElement && typeof val !== schemaKey.typeElement) validElement = false;
        });
        if (!validElement) return false;
      }
      if (schemaKey.maxLengthElement) {
        let validElement;
        bodyKey.forEach((val) => {
          if (validElement && (val.length <= 0 || val.length > schemaKey.maxLengthElement)) validElement = false;
        });
        if (!validElement) return false;
      }
      return true;
    }
  } return false;
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;
module.exports.validateSchema = verifySchema;
