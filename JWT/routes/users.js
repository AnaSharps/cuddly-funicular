/* eslint-disable linebreak-style */
/* eslint-disable max-len */

const { promises } = require('fs');

/* eslint-disable linebreak-style */
module.exports = (dbConnection) => {
  const express = require('express');
  const router = express.Router();
  const passport = require('passport');
  const utils = require('../lib/utils');
  const { v4: uuidv4 } = require('uuid');
  const util = require('util');
  const query = util.promisify(dbConnection.query).bind(dbConnection);

  router.use(express.json());

  router.post('/applyforJob', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.user && req.body.vacancyId) {
      dbConnection.query('SELECT vac_skills.skills FROM vac_skills JOIN lab_skills ON lab_skills.skills = vac_skills.skills WHERE vac_skills.vac_id = ?', [req.body.vacancyId], (err, vacSkills) => {
        if (err) next(err);
        if (vacSkills.length > 0) {
          const labDetailsQuery = query('SELECT village, city, state FROM lab_details WHERE user_email = ?', [req.body.user]);
          const labContactQuery = query('SELECT username, mobileNum FROM user_accounts WHERE user_email = ?', [req.body.user]);
          Promise.all([labDetailsQuery, labContactQuery]).then((values) => {
            console.log(values);
            return ([{ ...values[0][0], ...values[1][0] }]);
          }, (err2) => next(err2)).then((details) => {
            const address = `${details[0].village}, ${details[0].city}, ${details[0].state}`;
            const skills = vacSkills.map((val) => val.skills);
            dbConnection.query('INSERT INTO vac_applications (vac_id, applicant, applicant_mobile, applicant_email, applicant_address, applicant_skills)', [req.body.vacancyId, details[0].username, details[0].mobile, req.body.user, address, skills], (err3, result) => {
              if (err3) next(err3);
              if (result) res.status(200).json({ success: true, msg: 'Applied successfully' });
            });
          });
        } else res.status(200).json({ success: false, msg: 'You are not eligible for this job vacancy!' });
      });
    }
  });

  router.post('/viewVacancies', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.user) {
      dbConnection.query('SELECT DISTINCT vac_id, vac_name FROM vac_details WHERE user_email = ?', [req.body.user], (err, vacancies) => {
        if (err) next(err);
        if (vacancies.length > 0) {
          res.status(200).json({ success: true, vacancies, msg: 'Vacancies found' });
        } else res.status(200).json({ success: false, msg: 'You have no current vacancy' });
      });
    }
  });

  router.post('/viewJobsLabour', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.viewJobs) {
      dbConnection.query('SELECT DISTINCT vac_skills.vac_id FROM vac_skills JOIN lab_skills ON lab_skills.skills = vac_skills.skills WHERE lab_skills.user_email = ?', [req.body.user], (err2, vacancies) => {
        if (err2) next(err2);
        if (vacancies.length > 0) {
          const vacancyQueries = [];
          const sql2 = 'SELECT vac_details.job_desc, vac_details.vacancy, vac_details.vac_name, vac_details.village, vac_details.city, vac_details.state, vac_details.vac_id FROM vac_details JOIN lab_details ON lab_details.city = vac_details.city WHERE vac_details.vac_id = ?';
          for (let i = 0; i < vacancies.length; i += 1) {
            const vacDetailQuery = query(sql2, [vacancies[i].vac_id]);
            const vacSkillQuery = query('SELECT DISTINCT skills FROM vac_skills WHERE vac_id = ?', [vacancies[i].vac_id]);
            const vacancyQuery = Promise.all([vacDetailQuery, vacSkillQuery]).then((values) => ({
              ...values[0][0],
              skills: values[1].map((val) => val.skills),
            }), (err) => {
              next(err);
            });
            vacancyQueries.push(vacancyQuery);
          }
          Promise.allSettled(vacancyQueries).then((values) => {
            const vacArr = [];
            values.forEach((result) => {
              if (result.status === 'fulfilled') {
                vacArr.push(result.value);
              }
            });
            console.log(vacArr);
            res.status(200).json({ success: true, vacancyDetails: vacArr, msg: 'Successfully found jobs for you' });
          });
        } else res.status(200).json({ success: false, msg: 'Sorry no matching jobs found!' });
      });
    }
  });

  router.post('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    console.log(req.headers);
    const vacId = uuidv4().slice(0, 10);
    if (req.body.getInfo) {
      let sqlQuery1;
      switch (req.body.userType) {
        case 'labour':
          sqlQuery1 = 'SELECT lab_skills.skills, lab_details.village, lab_details.city, lab_details.state FROM lab_skills JOIN lab_details ON lab_details.user_email = lab_skills.user_email WHERE lab_details.user_email = ?';
          break;
        case 'employer':
          sqlQuery1 = '';
          sqlQuery2 = '';
          break;
        default:
          // do nothing
      }
      dbConnection.query(sqlQuery1, [req.body.user], (err, users) => {
        if (err) next(err);
        if (users) {
          console.log(users);
          console.log(users[0].skills);
          return res.status(200).json({ success: true, users, msg: 'Thank you for your details!' });
        }
      });
    } else {
      switch (req.body.userType) {
        case 'labour':
          if (req.body.user && req.body.userVillage && req.body.userCity && req.body.userState && req.body.userSkills) {
            if (req.body.updateInfo) {
              dbConnection.query('UPDATE lab_details SET village = ?, city = ?, state = ? WHERE user_email = ?', [req.body.userVillage, req.body.userCity, req.body.userState, req.body.user], (err, user) => {
                if (err) next(err);
                if (user) {
                  dbConnection.query('DELETE FROM lab_skills WHERE user_email = ?', [req.body.user], (err2, user2) => {
                    if (err2) next(err2);
                    if (user2) {
                      for (let i = 0; i < req.body.userSkills.length; i += 1) {
                        dbConnection.query('INSERT INTO lab_skills (skills, user_email) VALUES (?, ?)', [req.body.userSkills[i], req.body.user], (error, User) => {
                          if (error) next(error);
                          if (User) {
                            console.log(`${req.body.userSkills[i]} updated`);
                          }
                        });
                      }
                    }
                  });
                  return res.status(200).json({ success: true, msg: 'Your details have been updated!' });
                }
              });
            } else {
              dbConnection.query('INSERT INTO lab_details (village, city, state, user_email) VALUES (?, ?, ?, ?)', [req.body.userVillage, req.body.userCity, req.body.userState, req.body.user], (err, user) => {
                if (err) next(err);
                if (user) {
                  dbConnection.query('UPDATE user_accounts SET details = ? WHERE user_email = ?', [req.body.details, req.body.user], (err2, user2) => {
                    if (err2) next(err2);
                    if (user2) {
                      for (let i = 0; i < req.body.userSkills.length; i += 1) {
                        dbConnection.query('INSERT INTO lab_skills (skills, user_email) VALUES (?, ?)', [req.body.userSkills[i], req.body.user], (error, User) => {
                          if (error) next(error);
                          if (User) {
                            console.log(`${req.body.userSkills[i]} added`);
                          }
                        });
                      }
                    }
                  });
                  return res.status(200).json({ success: true, msg: 'Thank you for your details!' });
                }
              });
            }
          } else return res.status(401).json({ success: false, msg: 'Malformed Request' });
          break;
        case 'employer':
          if (req.body.user && req.body.jobDesc && req.body.vacancy && req.body.userVillage && req.body.userCity && req.body.userState && req.body.jobName) {
            dbConnection.query('INSERT INTO vac_details (job_desc, vacancy, village, city, state, vac_id, vac_name, user_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.jobDesc, req.body.vacancy, req.body.userVillage, req.body.userCity, req.body.userState, vacId, req.body.jobName, req.body.user], (err, user) => {
              if (err) next(err);
              if (user) {
                for (let i = 0; i < req.body.userSkills.length; i += 1) {
                  dbConnection.query('INSERT INTO vac_skills (skills, vac_id, vac_name) VALUES (?, ?, ?)', [req.body.userSkills[i], vacId, req.body.jobName], (error, User) => {
                    if (error) next(error);
                    if (User) {
                      console.log(`${req.body.userSkills[i]} employer added`);
                    }
                  });
                }
                return res.status(200).json({ success: true, jobName: req.body.jobName, msg: 'Thank you for your details!' });
              }
            });
          } else return res.status(401).json({ success: false, msg: 'Malformed Request' });
          break;
        default:
          // do nothing
      }
    }
  });

  router.post('/login', (req, res, next) => {
    console.log(req.body);
    if (req.body.email && req.body.password) {
      dbConnection.query('SELECT * FROM user_accounts WHERE user_email = ?', [req.body.email], (err, user) => {
        console.log(user);
        if (err) {
          console.log('error in query');
          next(err);
        }
        if (!user[0]) {
          console.log('user not found');
          res.status(401).json({ success: false, msg: 'could not find user' });
        }
        if (user[0]) {
          console.log('user found');
          utils.validPassword(req.body.password, user[0].hash).then((isValid) => {
            console.log('password checked');
            if (isValid) {
              console.log('password is valid');
              const tokenObject = utils.issueJWT(user[0]);
              console.log('sending res');
              res.status(200).json({
                success: true, user: user[0].user_email, userType: user[0].userType, details: user[0].details, token: tokenObject.token, expiresIn: tokenObject.expires,
              });
            } else {
              console.log('password not valid');
              res.status(401).json({ success: false, msg: 'you entered the wrong password' });
            }
          }, () => {
          });
        }
      });
    } else {
      res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  // TODO
  router.post('/register', (req, res, next) => {
    dbConnection.query(`SELECT user_email, username FROM user_accounts WHERE ( user_email='${req.body.email}' OR mobileNum='${req.body.mobile}')`, (err, user) => {
      console.log(user);
      if (user[0]) return res.json({ success: false, msg: 'User already Exists!', user: user[0].username });
      utils.genPassword(req.body.password).then((hash) => {
        console.log(hash);
        dbConnection.query('INSERT INTO user_accounts (username, hash, userType, mobileNum, details, user_email) VALUES (?, ?, ?, ?, ?, ?)', [req.body.username, hash, req.body.userType, req.body.mobile, req.body.details, req.body.email], (error, User) => {
          console.log(req.body);
          console.log(req.body.userType);
          if (error) {
            console.log('error encountered!');
            next(error);
          } else if (User) {
            console.log('sending res');
            const jwt = utils.issueJWT({ user_email: req.body.email });
            return res.json({
              success: true, user: req.body.email, userType: req.body.userType, details: req.body.details, token: jwt.token, expiresIn: jwt.expires,
            });
          } else console.log('nothing here!');
        });
      }, () => console.log('error generating password'));
    });
  });
  return router;
};
