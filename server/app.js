//@flow

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ufoaRouter = require('./ufoa/router'); 
const ufobRouter = require('./ufob/router'); 
const secrets = require('./secrets');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');

// Home = Models

app.get('/' + secrets.adminURL, (req, res: any) => {
  res.render('index', { admin: true, page: "model" });
});

app.get('/', (req, res: any) => {
  res.render('index', { admin: false, page: "model" });
});

app.get('/methodology', (req, res: any) => {
  res.render('index', { admin: false, page: "methodology" });
});

app.get('/about', (req, res: any) => {
  res.render('index', { admin: false, page: "about" });
});

app.use('/', ufoaRouter);
app.use('/', ufobRouter);

module.exports = app;
