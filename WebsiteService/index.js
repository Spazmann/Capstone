const express = require('express');
const createError = require('http-errors');
const app = express();
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Router Imports
const imagesPageRouter = require('./routes/images');

const PORT = process.env.PORT || 3000;

// View Engine Setup
app.set('views', path.join(__dirname, 'public/views'));  // Views directory
app.set('view engine', 'pug');
console.log(process.env.S3_BUCKET);

// RestAPI Router Setup
app.use('/', imagesPageRouter);

// Cookies and Session Setup
app.use(session({
  secret: '1234',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.get('/cookie', function(req, res) {
  let today = new Date();
  let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate() + " " + today.getHours() + ":" + today.getMinutes() + "." + today.getSeconds();
  res.cookie('lastVisited', date, { maxAge: 86400000, httpOnly: true }).send('Cookie is set');
});

app.get('/cookieGet', function(req, res) {
  const lastVisited = req.cookies.lastVisited;
  res.send(lastVisited);
});

app.get('/logout', function(req, res) {
  req.session.user = null;
  res.redirect('/');
});

// Error Handling
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
})

module.exports = app;