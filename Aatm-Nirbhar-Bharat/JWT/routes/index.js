module.exports = (connection) => {
  const router = require('express').Router();
  const path = require('path');

  router.use('/users', require('./users')(connection));
  router.use('/employers', require('./employers')(connection));
  router.use('/admin', require('./admin')(connection));

  router.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, '..', '..', 'src', 'login.html'));
  });

  router.get('/register', (req, res) => {
      res.sendFile(path.join(__dirname, '..', '..', 'src', 'register.html'));
  });

  return router;
}