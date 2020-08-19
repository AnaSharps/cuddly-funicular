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

  router.post('/viewApplications', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (req.body.user && req.body.vacancyId) {
      dbConnection.query('SELECT vac_id FROM vac_details WHERE user_email = ?', [req.body.user], (err, vacId) => {
        if (err) next(err);
        if (vacId.length > 0) {
          if (vacId[0].vac_id === req.body.vacancyId) {
            dbConnection.query('SELECT * FROM vac_applications WHERE vac_id = ?', [req.body.vacancyId], (err2, applications) => {
              if (err2) next(err2);
              if (applications) {
                console.log(applications);
                res.status(200).json({ success: true, applications, msg: 'Successfully retrieved the applications' });
              }
            });
          } else res.status(200).json({ success: false, msg: 'Unauthorized Request' });
        } else res.status(200).json({ success: false, msg: 'No vacancies found' });
      });
    }
  });

  // router.post('/viewApplications', passport.authenticate('jwt', { session: false }), (req, res, next) => {
  //   console.log(req.body);
  //   if (req.body.user && req.body.vacancyId) {
  //     (async () => {
  //       const vacId = await query('SELECT vac_id FROM vac_details WHERE user_email = ?', [req.body.user]);
  //       if (vacId.length > 0) {
  //         if (vacId[0].vac_id === req.body.vacancyId) {
  //           const applications = await query('SELECT * FROM vac_applications WHERE vac_id = ?', [req.body.vacancyId]);
  //           res.status(200).json({ success: true, applications, msg: 'Successfully retrieved the applications' });
  //         } else res.status(200).json({ success: false, msg: 'Unauthorized Request' });
  //       } else res.status(200).json({ success: false, msg: 'No vacancies found' });
  //     })();
  //   }
  // });

  router.post('/createVacancy', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (req.body.user && req.body.userType === 'employer' && req.body.vacancy && req.body.userVillage && req.body.userCity && req.body.userState && req.body.userSkills && req.body.jobDesc && req.body.jobName) {
      console.log('valid request');
      const vacId = uuidv4();
      dbConnection.query('INSERT INTO vac_details (job_desc, vacancy, village, city, state, vac_id, vac_name, user_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.jobDesc, req.body.vacancy, req.body.userVillage, req.body.userCity, req.body.userState, vacId, req.body.jobName, req.body.user], (err, user) => {
        if (err) next(err);
        if (user) {
          console.log('vacancy created');
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
  });

  router.post('/applyforJob', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.user && req.body.vacancyId) {
      dbConnection.query('SELECT applicant_email FROM vac_applications WHERE applicant_email = ? AND vac_id = ?', [req.body.user, req.body.vacancyId], (err1, applicant) => {
        if (err1) next(err1);
        if (applicant.length > 0) res.status(200).json({ success: false, msg: 'You have already applied for this job' });
        else {
          dbConnection.query('SELECT vac_skills.skills FROM vac_skills JOIN lab_skills ON lab_skills.skills = vac_skills.skills WHERE vac_skills.vac_id = ?', [req.body.vacancyId], (err, vacSkills) => {
            console.log(req.body);
            if (err) next(err);
            if (vacSkills.length > 0) {
              const labDetailsQuery = query('SELECT village, city, state FROM lab_details WHERE user_email = ?', [req.body.user]);
              const labContactQuery = query('SELECT username, mobileNum FROM user_accounts WHERE user_email = ?', [req.body.user]);
              Promise.all([labDetailsQuery, labContactQuery]).then((values) => {
                console.log(values);
                return ([{ ...values[0][0], ...values[1][0] }]);
              }, (err2) => next(err2)).then((details) => {
                console.log(details);
                const address = `${details[0].village}, ${details[0].city}, ${details[0].state}`;
                const skills = vacSkills.map((val) => val.skills).join(', ');
                dbConnection.query('INSERT INTO vac_applications (vac_id, applicant, applicant_mobile, applicant_email, applicant_address, applicant_skills) VALUES (?, ?, ?, ?, ?, ?)', [req.body.vacancyId, details[0].username, details[0].mobileNum, req.body.user, address, skills], (err3, result) => {
                  if (err3) next(err3);
                  if (result) {
                    console.log('sending res for job applied');
                    res.status(200).json({ success: true, msg: 'Applied successfully' });
                  }
                });
              });
            } else res.status(200).json({ success: false, msg: 'You are not eligible for this job vacancy!' });
          });
        }
      });
    }
  });

  router.post('/withdrawJob', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.user && req.body.vacancyId) {
      dbConnection.query('SELECT applicant_email FROM vac_applications WHERE vac_id = ?', [req.body.vacancyId], (err, applicant) => {
        if (err) next(err);
        if (applicant.length > 0) {
          dbConnection.query('DELETE FROM vac_applications WHERE vac_id = ? AND applicant_email = ?', [req.body.vacancyId, req.body.user], (err2, result) => {
            if (err2) next(err2);
            res.status(200).json({ success: true, msg: 'Aplpication withdrawn' });
          });
        } else res.status(200).json({ success: false, msg: 'You have not applied for this job' });
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
          const sql2 = 'SELECT vac_details.job_desc, vac_details.vacancy, vac_details.vac_name, vac_details.village, vac_details.city, vac_details.state, vac_details.vac_id FROM vac_details JOIN lab_details ON lab_details.state = vac_details.state WHERE vac_details.vac_id = ?';
          for (let i = 0; i < vacancies.length; i += 1) {
            const vacDetailQuery = query(sql2, [vacancies[i].vac_id]);
            const vacSkillQuery = query('SELECT DISTINCT skills FROM vac_skills WHERE vac_id = ?', [vacancies[i].vac_id]);
            const appliedStatusQuery = query('SELECT applicant_email FROM vac_applications WHERE vac_id = ?', [vacancies[i].vac_id]);
            const vacancyQuery = Promise.all([vacDetailQuery, vacSkillQuery, appliedStatusQuery]).then((values) => ({
              ...values[0][0],
              skills: values[1].map((val) => val.skills),
              applied: values[2].map((val) => val.applicant_email).indexOf(req.body.user) !== -1,
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

  router.post('/searchVacancy', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (req.body.skills || req.body.location || req.body.company) {
      const sql = `SELECT DISTINCT vac_details.user_email, vac_details.vac_id, vac_details.vac_name FROM vac_details JOIN vac_skills ON vac_details.vac_id = vac_skills.vac_id WHERE ${req.body.skills === '' ? '' : 'vac_skills.skills = ?'} ${req.body.skills && req.body.location ? 'AND' : ''} ${!req.body.location ? '' : '(vac_details.village = ? OR vac_details.city = ? OR vac_details.state = ?)'} ${(req.body.skills || req.body.location) && req.body.company ? 'AND' : ''} ${req.body.company ? 'vac_details.vac_name = ?' : ''}`;
      const searchArr = [];
      if (req.body.skills) searchArr.push(req.body.skills);
      if (req.body.location) {
        searchArr.push(req.body.location);
        searchArr.push(req.body.location);
        searchArr.push(req.body.location);
      }
      if (req.body.company) searchArr.push(req.body.company);
      dbConnection.query(sql, searchArr, (err, results) => {
        if (err) next(err);
        if (results) {
          console.log(sql);
          console.log(searchArr);
          console.log(results);
          res.status(200).json({ success: true, results, msg: 'Search results found' });
        }
      });
    } else res.status(400).json({ success: false, msg: 'Bad Request' });
  });

  router.post('/searchLabour', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (req.body.skills || req.body.location) {
      const sql = `SELECT DISTINCT lab_details.user_email FROM lab_details JOIN lab_skills ON lab_details.user_email = lab_skills.user_email WHERE ${req.body.skills === '' ? '' : 'lab_skills.skills = ?'} ${req.body.skills !== '' && req.body.location !== '' ? 'AND' : ''} ${req.body.location === '' ? '' : '(lab_details.village = ? OR lab_details.city = ? OR lab_details.state = ?)'}`;
      const searchArr = [];
      if (req.body.skills !== '') searchArr.push(req.body.skills);
      if (req.body.location !== '') {
        searchArr.push(req.body.location);
        searchArr.push(req.body.location);
        searchArr.push(req.body.location);
      }
      dbConnection.query(sql, searchArr, (err, results) => {
        if (err) next(err);
        if (results) {
          console.log(sql);
          console.log(searchArr);
          console.log(results);
          res.status(200).json({ success: true, results, msg: 'Search results found' });
        }
      });
    } else res.status(400).json({ success: false, msg: 'Bad Request' });
  });

  router.post('/viewLabour', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (req.body.getInfo) {
      console.log(req.body);
      let sqlQuery1;
      switch (req.body.userType) {
        case 'labour':
          console.log('labour identified');
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
    }
  });

  router.post('/protected', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    console.log(req.headers);
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
      default:
        // do nothing
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
