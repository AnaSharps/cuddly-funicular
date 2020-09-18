/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
module.exports = (dbConnection) => {
  const express = require('express');
  const router = express.Router();
  const passport = require('passport');
  const utils = require('../lib/utils');
  const { v4: uuidv4 } = require('uuid');
  const util = require('util');
  const { verifySchema } = require('../lib/schemaVerifier');
  const query = util.promisify(dbConnection.query).bind(dbConnection);

  router.use(express.json());

  router.get('/test', (req, res) => {
    console.log('Got testeinga req');
    res.status(200).json({
      good: 'Work',
    });
  });

  router.post('/viewApplications', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (verifySchema('viewApplications', req.body)) {
      dbConnection.query('SELECT DISTINCT vac_id FROM vac_details WHERE user_email = ?', [req.body.user], (err, vacId) => {
        if (err) next(err);
        if (vacId.length > 0) {
          console.log('vacancies found');
          console.log(vacId);
          let valid = false;
          for (let i = 0; i < vacId.length; i += 1) {
            if (vacId[i].vac_id === req.body.vacancyId) {
              valid = true;
              break;
            }
          }
          if (valid) {
            console.log('vacancy valid');
            dbConnection.query('SELECT * FROM vac_applications WHERE vac_id = ?', [req.body.vacancyId], (err2, applications) => {
              if (err2) next(err2);
              if (applications.length >= 0) {
                console.log(applications);
                return (res.status(200).json({ success: true, applications, msg: 'Successfully retrieved the applications' }));
              }
            });
          } else {
            console.log('not valid')
            return (res.status(200).json({ success: false, msg: 'Unauthorized Request' }));
          }
        } else {
          console.log('no vacancy found');
          return (res.status(200).json({ success: false, msg: 'No vacancies found' }));
        }
      });
    } else {
      console.log('malformed');
      return (res.status(401).json({ success: false, msg: 'Malformed Request' }));
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
    if (verifySchema('createVacancy', req.body)) {
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
    if (verifySchema('applyforJob', req.body)) {
      dbConnection.query('SELECT applicant_email FROM vac_applications WHERE applicant_email = ? AND vac_id = ?', [req.body.user, req.body.vacancyId], (err1, applicant) => {
        if (err1) next(err1);
        if (applicant.length > 0) {
          console.log('applied already');
          return res.status(200).json({ success: false, msg: 'You have already applied for this job' });
        }
        if (applicant.length === 0) {
          dbConnection.query('SELECT vac_skills.skills FROM vac_skills JOIN lab_skills ON lab_skills.skills = vac_skills.skills WHERE vac_skills.vac_id = ?', [req.body.vacancyId], (err, vacSkills) => {
            console.log(req.body);
            if (err) next(err);
            if (vacSkills.length > 0) {
              const labDetailsQuery = query('SELECT village, city, state FROM lab_details WHERE user_email = ?', [req.body.user]);
              const labContactQuery = query('SELECT username, mobileNum FROM user_accounts WHERE user_email = ?', [req.body.user]);
              const result = Promise.all([labDetailsQuery, labContactQuery]).then((values) => ([{ ...values[0][0], ...values[1][0] }]), (err2) => next(err2)).then((details) => {
                console.log(details);
                const address = `${details[0].village}, ${details[0].city}, ${details[0].state}`;
                const skills = vacSkills.map((val) => val.skills).join(', ');
                dbConnection.query('INSERT INTO vac_applications (vac_id, applicant, applicant_mobile, applicant_email, applicant_address, applicant_skills) VALUES (?, ?, ?, ?, ?, ?)', [req.body.vacancyId, details[0].username, details[0].mobileNum, req.body.user, address, skills], (err3, result) => {
                  if (err3) next(err3);
                  if (result) {
                    console.log('sending res for job applied');
                    return true;
                  }
                });
              });
              if (result === true) return res.status(200).json({ success: true, msg: 'Applied successfully' });
            }
            // else return res.status(200).json({ success: false, msg: 'You are not eligible for this job vacancy!' });
          });
        }
      });
    } return res.status(401).json({ success: false, msg: 'Malformed Request' });
  });

  router.post('/withdrawJob', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (verifySchema('withdrawJob', req.body)) {
      dbConnection.query('SELECT applicant_email FROM vac_applications WHERE vac_id = ?', [req.body.vacancyId], (err, applicant) => {
        if (err) next(err);
        if (applicant.length > 0) {
          dbConnection.query('DELETE FROM vac_applications WHERE vac_id = ? AND applicant_email = ?', [req.body.vacancyId, req.body.user], (err2, result) => {
            if (err2) next(err2);
            res.status(200).json({ success: true, msg: 'Aplpication withdrawn' });
          });
        } else res.status(401).json({ success: false, msg: 'You have not applied for this job' });
      });
    }
  });

  router.post('/viewVacancies', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (verifySchema('viewVacancies', req.body)) {
      dbConnection.query('SELECT DISTINCT * FROM vac_details WHERE user_email = ?', [req.body.user], (err, vacancies) => {
        if (err) next(err);
        if (vacancies.length > 0) {
          console.log(vacancies);
          res.status(200).json({ success: true, vacancies, msg: 'Vacancies found' });
        } else res.status(200).json({ success: false, msg: 'You have no current vacancy' });
      });
    } else res.status(401).json({ success: false, msg: 'Malformed Request' });
  });

  router.post('/viewJobsLabour', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    if (verifySchema('viewJobsLabour', req.body)) {
      console.log('schema verified');
      dbConnection.query('SELECT DISTINCT vac_skills.vac_id FROM vac_skills JOIN lab_skills ON lab_skills.skills = vac_skills.skills WHERE lab_skills.user_email = ?', [req.body.user], (err2, vacancies) => {
        if (err2) next(err2);
        if (vacancies.length > 0) {
          console.log('length > 0');
          const vacancyQueries = [];
          const sql2 = 'SELECT vac_details.job_desc, vac_details.vacancy, vac_details.vac_name, vac_details.village, vac_details.city, vac_details.state, vac_details.vac_id FROM vac_details WHERE vac_details.vac_id = ?';
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
    } else {
      console.log('schema incorrect');
      res.status(401).json({ success: false, msg: 'Malformed Request' });
    }
  });

  router.post('/searchVacancy', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    const insertQueries = [];
    const sId = uuidv4();
    if (verifySchema('searchVacancy', req.body)) {
      if (req.body.skills && req.body.location && req.body.company) {
        const skillArr = req.body.skills.split(', ');
        const locArr = req.body.location.split(', ');
        const companyArr = req.body.company.split(', ');
        skillArr.forEach((skillVal) => {
          locArr.forEach((locVal) => {
            companyArr.forEach((compVal) => {
              const insertQuery = query('INSERT INTO search_lab (searchId, skills, company, village, city, state, user_email) VALUES (?, ?, ?, ?, ?, ?, ?)', [sId, skillVal, compVal, locVal, locVal, locVal, req.body.user]);
              insertQueries.push(insertQuery);
            });
          });
        });
      } else if (req.body.skills && !req.body.location && !req.body.company) {
        const skillArr = req.body.skills.split(', ');
        skillArr.forEach((skillVal) => {
          const insertQuery = query('INSERT INTO search_lab (searchId, skills, user_email) VALUES (?, ?, ?)', [sId, skillVal, req.body.user]);
          insertQueries.push(insertQuery);
        });
      } else if (req.body.location && !req.body.skills && !req.body.company) {
        const locArr = req.body.location.split(', ');
        locArr.forEach((locVal) => {
          const insertQuery = query('INSERT INTO search_lab (searchId, village, city, state, user_email) VALUES (?, ?, ?, ?, ?)', [sId, locVal, locVal, locVal, req.body.user]);
          insertQueries.push(insertQuery);
        });
      } else if (req.body.company && !req.body.skills && !req.body.location) {
        const compArr = req.body.company.split(', ');
        compArr.forEach((compVal) => {
          const insertQuery = query('INSERT INTO search_lab (searchId, company, user_email) VALUES (?, ?, ?)', [sId, compVal, req.body.user]);
          insertQueries.push(insertQuery);
        });
      } else if (req.body.skills && req.body.location && !req.body.company) {
        const skillArr = req.body.skills.split(', ');
        const locArr = req.body.location.split(', ');
        skillArr.forEach((skillVal) => {
          locArr.forEach((locVal) => {
            const insertQuery = query('INSERT INTO search_lab (searchId, skills, village, city, state, user_email) VALUES (?, ?, ?, ?, ?, ?)', [sId, skillVal, locVal, locVal, locVal, req.body.user]);
            insertQueries.push(insertQuery);
          });
        });
      } else if (req.body.skills && req.body.company && !req.body.location) {
        const skillArr = req.body.skills.split(', ');
        const compArr = req.body.company.split(', ');
        skillArr.forEach((skillVal) => {
          compArr.forEach((compVal) => {
            const insertQuery = query('INSERT INTO search_lab (searchId, skills, company, user_email) VALUES (?, ?, ?, ?, ?, ?)', [sId, skillVal, compVal, req.body.user]);
            insertQueries.push(insertQuery);
          });
        });
      } else if (req.body.location && req.body.company && !req.body.skills) {
        const compArr = req.body.company.split(', ');
        const locArr = req.body.location.split(', ');
        locArr.forEach((locVal) => {
          compArr.forEach((compVal) => {
            const insertQuery = query('INSERT INTO search_lab (searchId, company, village, city, state, user_email) VALUES (?, ?, ?, ?, ?, ?)', [sId, compVal, locVal, locVal, locVal, req.body.user]);
            insertQueries.push(insertQuery);
          });
        });
      } else res.status(401).json({ success: false, msg: 'Bad Request' });
    } else res.status(401).json({ success: false, msg: 'Malformed Request' });
    Promise.allSettled(insertQueries).then((val) => {
      console.log(val);
      const sql = `SELECT DISTINCT ${req.body.skills ? 'vac_skills' : 'vac_details'}.vac_id FROM ${req.body.skills ? 'vac_skills JOIN search_lab ON vac_skills.skills = search_lab.skills' : ''} ${req.body.skills && req.body.location ? 'JOIN vac_details ON (vac_details.village = search_lab.village OR vac_details.city = search_lab.city OR vac_details.state = search_lab.state)' : ''} ${req.body.skills && req.body.location && req.body.company ? 'AND vac_details.vac_name = search_lab.company' : ''} ${req.body.skills && !req.body.location && req.body.company ? 'JOIN search_lab ON vac_details.vac_name = search_lab.company' : ''} ${!req.body.skills && req.body.location ? 'vac_details JOIN search_lab ON (vac_details.village = search_lab.village OR vac_details.city = search_lab.city OR vac_details.state = search_lab.state)' : ''} ${!req.body.skills && req.body.location && req.body.company ? 'AND vac_details.vac_name = search_lab.company' : ''} ${!req.body.skills && !req.body.location && req.body.company ? 'vac_details JOIN search_lab ON vac_details.vac_name = search_lab.company' : ''} WHERE search_lab.searchId = ?`;
      dbConnection.query(sql, [sId], (err, vacancies) => {
        console.log(sql);
        if (err) next(err);
        if (vacancies && vacancies.length > 0) {
          console.log('length > 0');
          const vacancyQueries = [];
          const sql2 = 'SELECT job_desc, vacancy, vac_name, village, city, state, vac_id, user_email FROM vac_details WHERE vac_id = ?';
          for (let i = 0; i < vacancies.length; i += 1) {
            const vacDetailQuery = query(sql2, [vacancies[i].vac_id]);
            const vacSkillQuery = query('SELECT DISTINCT skills FROM vac_skills WHERE vac_id = ?', [vacancies[i].vac_id]);
            const vacancyQuery = Promise.all([vacDetailQuery, vacSkillQuery]).then((values) => ({
              ...values[0][0],
              skills: values[1].map((value) => value.skills),
            }), (err2) => {
              next(err2);
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
            res.status(200).json({ success: true, results: vacArr, msg: 'Successfully found jobs for you' });
          });
        } else res.status(200).json({ success: false, msg: 'No such vacancies found' });
      });
    });
  });

  router.post('/searchLabour', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    const insertQueries = [];
    const sId = uuidv4();
    if (verifySchema('searchLabour', req.body)) {
      if (req.body.skills && req.body.location) {
        const skillArr = req.body.skills.split(', ');
        const locArr = req.body.location.split(', ');
        skillArr.forEach((skillVal) => {
          locArr.forEach((locVal) => {
            const insertQuery = query('INSERT INTO search_vac (searchId, skills, village, city, state, user_email) VALUES (?, ?, ?, ?, ?, ?)', [sId, skillVal, locVal, locVal, locVal, req.body.user]);
            insertQueries.push(insertQuery);
          });
        });
      } else if (req.body.skills) {
        const skillArr = req.body.skills.split(', ');
        skillArr.forEach((skillVal) => {
          const insertQuery = query('INSERT INTO search_vac (searchId, skills, user_email) VALUES (?, ?, ?)', [sId, skillVal, req.body.user]);
          insertQueries.push(insertQuery);
        });
      } else if (req.body.location) {
        const locArr = req.body.location.split(', ');
        locArr.forEach((locVal) => {
          const insertQuery = query('INSERT INTO search_vac (searchId, village, city, state, user_email) VALUES (?, ?, ?, ?, ?)', [sId, locVal, locVal, locVal, req.body.user]);
          insertQueries.push(insertQuery);
        });
      } else res.status(401).json({ success: false, msg: 'Bad Request' });
    } else res.status(401).json({ success: false, msg: 'Malformed Request' });
    Promise.allSettled(insertQueries).then(() => {
      const sql = `SELECT DISTINCT ${req.body.skills ? 'lab_skills' : 'lab_details'}.user_email FROM ${req.body.skills ? 'lab_skills JOIN search_vac ON lab_skills.skills = search_vac.skills' : ''} ${req.body.skills && req.body.location ? 'JOIN lab_details ON (lab_details.village = search_vac.village OR lab_details.city = search_vac.city OR lab_details.state = search_vac.state)' : ''} ${!req.body.skills && req.body.location ? 'lab_details JOIN search_vac ON (lab_details.village = search_vac.village OR lab_details.city = search_vac.city OR lab_details.state = search_vac.state)' : ''} WHERE search_vac.searchId = ?`;
      dbConnection.query(sql, [sId], (err, userEmails) => {
        if (err) next(err);
        if (userEmails.length > 0) {
          const candidateQueries = [];
          const sql2 = 'SELECT lab_details.user_email, lab_details.village, lab_details.city, lab_details.state, user_accounts.mobileNum, user_accounts.username FROM lab_details JOIN user_accounts ON lab_details.user_email = user_accounts.user_email WHERE lab_details.user_email = ?';
          userEmails.forEach((email) => {
            const labDetailQuery = query(sql2, [email.user_email]);
            const labSkillQuery = query('SELECT DISTINCT skills FROM lab_skills WHERE user_email = ?', [email.user_email]);
            const candidateQuery = Promise.all([labDetailQuery, labSkillQuery]).then((values) => ({
              ...values[0][0],
              skills: values[1].map((val) => val.skills),
            }), (err2) => {
              next(err2);
            });
            candidateQueries.push(candidateQuery);
          });
          Promise.allSettled(candidateQueries).then((values) => {
            const resultArr = [];
            values.forEach((result) => {
              if (result.status === 'fulfilled') {
                resultArr.push(result.value);
              }
            });
            console.log(resultArr);
            res.status(200).json({ success: true, results: resultArr, msg: 'Successfully found jobs for you' });
          });
        } else res.status(200).json({ success: false, msg: 'No such candidates found' });
      });
    });
  });

  router.post('/viewLaboursList', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (verifySchema('viewLaboursList', req.body)) {
      console.log('schema verified');
      dbConnection.query('SELECT username, user_email, mobileNum, details FROM user_accounts WHERE userType = ?', ['labour'], (err, users) => {
        if (err) next(err);
        if (users && users.length > 0) {
          console.log(users);
          return res.status(200).json({ success: true, users, msg: 'Found Labourers' });
        } else {
          console.log('no laborers found');
          return res.status(200).json({ success: false, msg: 'No labourers have registered yet' });
        }
      });
    } else {
      console.log('schema not verified');
      return res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  router.post('/viewEmployersList', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (verifySchema('viewEmployersList', req.body)) {
      console.log('schema verified');
      dbConnection.query('SELECT user_accounts.username, user_accounts.user_email, user_accounts.mobileNum, user_accounts.details, emp_details.village, emp_details.city, emp_details.state FROM user_accounts LEFT JOIN emp_details ON user_accounts.user_email = emp_details.user_email WHERE user_accounts.userType = ?', ['employer'], (err, users) => {
        if (err) next(err);
        if (users && users.length > 0) {
          console.log(users);
          return res.status(200).json({ success: true, users, msg: 'Found Employers' });
        } else {
          console.log('no employers found');
          return res.status(200).json({ success: false, msg: 'No employers have registered yet' });
        }
      });
    } else {
      console.log('schema not verified');
      return res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  router.post('/viewAdminList', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (verifySchema('viewAdminList', req.body)) {
      console.log('schema verified');
      dbConnection.query('SELECT username, user_email, mobileNum FROM user_accounts WHERE userType = ?', ['admin'], (err, users) => {
        if (err) next(err);
        if (users && users.length > 0) {
          console.log(users);
          return res.status(200).json({ success: true, users, msg: 'Found Admins' });
        } else {
          console.log('no admins found');
          return res.status(200).json({ success: false, msg: 'No admins have registered yet' });
        }
      });
    } else {
      console.log('schema not verified');
      return res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  router.post('/removeMember', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (verifySchema('removeMember', req.body)) {
      let sql1;
      dbConnection.query('SELECT userType FROM user_accounts WHERE user_email = ?', [req.body.user], (err, user) => {
        if (err) next(err);
        if (user && user.length > 0 && user[0].userType === 'admin') {
          dbConnection.query('SELECT userType FROM user_accounts WHERE user_email = ?', [req.body.removeMemberId], (err2, user2) => {
            if (err2) next(err2);
            if (user2 && user2.length > 0 && user2[0].userType === req.body.userType) {
              switch (user2[0].userType) {
                case 'labour':
                  sql1 = 'DELETE user_accounts, lab_details, lab_skills, vac_applications FROM user_accounts LEFT JOIN lab_details ON user_accounts.user_email = lab_details.user_email LEFT JOIN lab_skills ON user_accounts.user_email = lab_skills.user_email LEFT JOIN vac_applications ON user_accounts.user_email = vac_applications.applicant_email WHERE user_accounts.user_email = ?';
                  break;
                case 'employer':
                  sql1 = 'DELETE user_accounts, emp_details, vac_details, vac_skills, vac_applications FROM user_accounts LEFT JOIN emp_details ON user_accounts.user_email = emp_details.user_email LEFT JOIN vac_details ON user_accounts.user_email = vac_details.user_email LEFT JOIN vac_skills ON vac_details.vac_id = vac_skills.vac_id LEFT JOIN vac_applications ON vac_details.vac_id = vac_applications.vac_id WHERE user_accounts.user_email = ?';
                  break;
                case 'admin':
                  sql1 = 'DELETE FROM user_accounts WHERE user_email = ?';
                  break;
                default:
                  //
              }
              dbConnection.query(sql1, [req.body.removeMemberId], (err3, response) => {
                if (err3) next(err3);
                if (response) {
                  console.log('Deleted successfully');
                  return res.status(200).json({ success: true, msg: 'Successfully deleted member' });
                }
              });
            } else {
              console.log('Invalid Request');
              return res.status(200).json({ success: false, msg: 'Invalid Request' });
            }
          });
        } else {
          console.log('Unauthorized Request');
          return res.status(200).json({ success: false, msg: 'Unauthorized Request' });
        }
      });
    } else {
      console.log('schema not verified');
      return res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  router.post('/viewLabour', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    if (verifySchema('viewLabour', req.body)) {
      console.log('schema verified');
      if (req.body.userType === 'labour' || req.body.userType === 'admin') {
        const sqlQuery1 = 'SELECT DISTINCT lab_skills.skills, lab_details.village, lab_details.city, lab_details.state, user_accounts.username, user_accounts.mobileNum FROM lab_skills JOIN lab_details ON lab_details.user_email = lab_skills.user_email JOIN user_accounts ON lab_skills.user_email = user_accounts.user_email WHERE lab_details.user_email = ?';
        dbConnection.query(sqlQuery1, [req.body.user], (err, users) => {
          if (err) next(err);
          if (users[0]) {
            console.log(users);
            console.log(users[0].skills);
            return res.status(200).json({ success: true, users, msg: 'Thank you for your details!' });
          } return res.status(200).json({ success: true, users: [], msg: 'Details not entered' });
        });
      } else if (req.body.userType === 'employer' || req.body.userType === 'admin') {
        const sqlQuery1 = 'SELECT DISTINCT emp_details.village, emp_details.city, emp_details.state, emp_details.company, user_accounts.username, user_accounts.mobileNum FROM emp_details JOIN user_accounts ON emp_details.user_email = user_accounts.user_email WHERE emp_details.user_email = ?';
        dbConnection.query(sqlQuery1, [req.body.user], (err, users) => {
          if (err) next(err);
          if (users && users.length > 0) {
            console.log(users);
            return res.status(200).json({ success: true, users, msg: 'Thank you for your details!' });
          } return res.status(200).json({ success: true, users: [], msg: 'Details not entered' });
        });
      }
    } else {
      console.log('schema not verified');
      return res.status(401).json({ success: false, msg: 'Malformed request' });
    }
  });

  router.post('/updateMe', passport.authenticate('jwt', { session: false }), (req, res, next) => {
    console.log(req.body);
    console.log(req.headers);
    if (verifySchema('updateMe', req.body)) {
      console.log('schema correct');
      if (req.body.userType === 'labour' || req.body.userType === 'admin') {
        if (req.body.updateInfo) {
          console.log('update info true');
          dbConnection.query('UPDATE lab_details SET village = ?, city = ?, state = ? WHERE user_email = ?', [req.body.userVillage, req.body.userCity, req.body.userState, req.body.user], (err, user) => {
            if (err) next(err);
            if (user) {
              dbConnection.query('UPDATE user_accounts SET mobileNum = ? WHERE user_email = ?', [req.body.mobile, req.body.user], (err3, user3) => {
                if (err3) next(err3);
              });
              dbConnection.query('DELETE FROM lab_skills WHERE user_email = ?', [req.body.user], (err2, user2) => {
                if (err2) next(err2);
                // if (user2) {
                // }
              });
              for (let i = 0; i < req.body.userSkills.length; i += 1) {
                dbConnection.query('INSERT INTO lab_skills (skills, user_email) VALUES (?, ?)', [req.body.userSkills[i], req.body.user], (error, User) => {
                  if (error) next(error);
                  if (User) {
                    console.log(`${req.body.userSkills[i]} updated`);
                  }
                });
              }
              return res.status(200).json({ success: true, msg: 'Your details have been updated!' });
            }
          });
        } else {
          console.log('update info false');
          dbConnection.query('INSERT INTO lab_details (village, city, state, user_email) VALUES (?, ?, ?, ?)', [req.body.userVillage, req.body.userCity, req.body.userState, req.body.user], (err, user) => {
            if (err) next(err);
            if (user) {
              console.log('insertion successful');
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
              console.log('sending response');
              return res.status(200).json({ success: true, msg: 'Thank you for your details!' });
            }
          });
        }
      } else if (req.body.userType === 'employer' || req.body.userType === 'admin') {
        if (req.body.updateInfo) {
          console.log('update employer info true');
          dbConnection.query('UPDATE emp_details SET village = ?, city = ?, state = ?, company = ? WHERE user_email = ?', [req.body.userVillage, req.body.userCity, req.body.userState, req.body.company, req.body.user], (err, user) => {
            if (err) next(err);
            if (user) {
              dbConnection.query('UPDATE user_accounts SET mobileNum = ? WHERE user_email = ?', [req.body.mobile, req.body.user], (err2, user2) => {
                if (err2) next(err2);
                if (user2) {
                  return res.status(200).json({ success: true, msg: 'Your details have been updated!' });
                }
              });
            }
          });
        } else {
          console.log('update info false');
          dbConnection.query('INSERT INTO emp_details (village, city, state, user_email) VALUES (?, ?, ?, ?)', [req.body.userVillage, req.body.userCity, req.body.userState, req.body.user], (err, user) => {
            if (err) next(err);
            if (user) {
              console.log('insertion successful');
              dbConnection.query('UPDATE user_accounts SET details = ? WHERE user_email = ?', [req.body.details, req.body.user], (err2, user2) => {
                if (err2) next(err2);
                if (user2) {
                  console.log('sending response');
                  return res.status(200).json({ success: true, msg: 'Thank you for your details!' });
                }
              });
            }
          });
        }
      }
    } else {
      console.log('schema updateMe incorrect');
      return res.status(401).json({ success: false, msg: 'Malformed Request' });
    }
  });

  router.post('/login', (req, res, next) => {
    console.log(req.body);
    if (verifySchema('login', req.body)) {
      dbConnection.query('SELECT * FROM user_accounts WHERE user_email = ?', [req.body.email], (err, user) => {
        console.log(user);
        if (err) {
          console.log('error in query');
          next(err);
        } else if (!user || user.length <= 0) {
          console.log('user not found');
          return res.status(200).json({ success: false, msg: 'could not find user' });
        } else if (user && user.length > 0) {
          console.log('user found');
          utils.validPassword(req.body.password, user[0].hash).then((isValid) => {
            console.log('password checked');
            if (isValid) {
              console.log('password is valid');
              const tokenObject = utils.issueJWT(user[0]);
              console.log('sending res');
              return res.status(200).json({
                success: true, user: user[0].user_email, userType: user[0].userType, details: user[0].details, token: tokenObject.token, expiresIn: tokenObject.expires,
              });
            } else {
              console.log('password not valid');
              return res.status(401).json({ success: false, msg: 'you entered the wrong password' });
            }
          }, () => {
          });
        }
      });
    } else return res.status(401).json({ success: false, msg: 'Malformed Request!' });
  });

  // TODO
  router.post('/register', (req, res, next) => {
    if (verifySchema('register', req.body)) {
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
    } else res.status(401).json({ success: false, msg: 'Malformed Request!' });
  });

  router.post('/addMember', (req, res, next) => {
    console.log(req.body);
    if (verifySchema('addMember', req.body)) {
      console.log('authorized request');
      dbConnection.query('SELECT userType FROM user_accounts WHERE user_email = ?', [req.body.user], (er, userType) => {
        if (er) next(er);
        if (userType && userType.length > 0 && userType[0].userType === 'admin') {
          console.log('valid request');
          dbConnection.query(`SELECT user_email, username FROM user_accounts WHERE ( user_email='${req.body.emailM}' OR mobileNum='${req.body.mobileM}')`, (err, user) => {
            console.log(user);
            if (user[0]) return res.json({ success: false, msg: 'User already Exists!', user: user[0].usernameM });
            utils.genPassword(req.body.passwordM).then((hash) => {
              console.log(hash);
              dbConnection.query('INSERT INTO user_accounts (username, hash, userType, mobileNum, details, user_email) VALUES (?, ?, ?, ?, ?, ?)', [req.body.usernameM, hash, req.body.userTypeM, req.body.mobileM, req.body.details, req.body.emailM], (error, User) => {
                console.log(req.body);
                console.log(req.body.userTypeM);
                if (error) {
                  console.log('error encountered!');
                  next(error);
                } else if (User) {
                  console.log('sending res');
                  return res.json({
                    success: true,
                  });
                } else console.log('nothing here!');
              });
            }, () => console.log('error generating password'));
          });
        } else return res.status(200).json({ success: false, msg: 'Unauthorized Request' });
      });
    } else {
      console.log('schema incorrect');
      return res.status(401).json({ success: false, msg: 'Malformed Request!' });
    }
  });

  return router;
};
