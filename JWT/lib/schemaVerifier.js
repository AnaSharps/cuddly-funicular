/* eslint-disable linebreak-style */
/* eslint-disable max-len */

const schemaDefinations = {
  login: {
    email: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    password: { type: 'string', maxLength: 12 },
  },
  register: {
    username: { type: 'string', maxLength: 50 },
    email: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    mobile: { type: 'string', maxLength: 10, regex: /^([1-9]{1}[0-9]{9})$/g },
    password: { type: 'string', maxLength: 12 },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
    details: { type: 'number', regex: /^(0|1)$/g },
  },
  updateMe: {
    user: { type: 'string', maxLength: 50, regex: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g },
    userType: { type: 'string', maxLength: 8, regex: /^(labour|employer|admin)$/g },
    username: { type: 'string', minLength: 0, maxLength: 50 },
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
  if (schemaDefinations[request]) {
    Object.keys(schemaDefinations[request]).forEach((val) => {
      if (isValid && Object.keys(body).indexOf(val) < 0) isValid = false;
    });
    if (isValid) {
      const bodyKeys = Object.keys(body);
      const schema = schemaDefinations[request];
      for (let key = 0; key < bodyKeys.length; key += 1) {
        const bodyKey = body[bodyKeys[key]];
        const schemaKey = schema[bodyKeys[key]];
        if (schemaKey.type && typeof bodyKey !== schemaKey.type) {
          console.log(`type error in ${bodyKeys[key]}`);
          return false;
        }
        if (schemaKey.minLength && schemaKey.maxLength && (bodyKey.length < schemaKey.minLength || bodyKey.length > schemaKey.maxLength)) {
          console.log(`length error in ${bodyKeys[key]}`);
          return false;
        }
        if (!schemaKey.minLength && schemaKey.maxLength && (bodyKey.length <= 0 || bodyKey.length > schemaKey.maxLength)) {
          console.log(`length error in ${bodyKeys[key]}`);
          return false;
        }
        if (schemaKey.regex && bodyKey.search(schemaKey.regex) !== 0) {
          console.log(`regex error in ${bodyKeys[key]}`);
          return false;
        }
        if (schemaKey.isArray && !Array.isArray(bodyKey)) {
          console.log(`array error in ${bodyKeys[key]}`);
          return false;
        }
        if (schemaKey.typeElement) {
          let validElement = true;
          bodyKey.forEach((val) => {
            if (validElement && typeof val !== schemaKey.typeElement) validElement = false;
          });
          if (!validElement) return false;
        }
        if (schemaKey.maxLengthElement) {
          let validElement = true;
          bodyKey.forEach((val) => {
            if (validElement && (val.length <= 0 || val.length > schemaKey.maxLengthElement)) validElement = false;
          });
          if (!validElement) return false;
        }
        return true;
      }
    } return false;
  } return false;
}

module.exports.verifySchema = verifySchema;
