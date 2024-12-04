const express = require('express');
const createError = require('http-errors');
const app = express();
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Router Imports
const indexPageRouter = require('./routes/index');
const homePageRouter = require('./routes/home');
const profilePageRouter = require('./routes/profile');
const createAccountRouter = require('./routes/createAccount');
const settingsRouter = require('./routes/settings');
const postRouter = require('./routes/post');
const postCommunityRouter = require('./routes/community');
const bookmarksRouter = require('./routes/bookmarks');
const messagingRouter = require('./routes/messages');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

const PORT = process.env.PORT || 3000;

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));  // Views directory
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
console.log(process.env.S3_BUCKET);

// RestAPI Router Setup
app.use('/', indexPageRouter);
app.use('/home', homePageRouter);
app.use('/profile', profilePageRouter);
app.use('/createAccount', createAccountRouter);
app.use('/settings', settingsRouter);
app.use('/post', postRouter);
app.use('/community', postCommunityRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/messages', messagingRouter);

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