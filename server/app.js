//@flow

// Imports {{{1
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ufoaRouter = require('./ufoa/router'); 
const ufobRouter = require('./ufob/router'); 

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res: any) => {
  res.status(200).render('index.html');
});
app.use('/', ufoaRouter);
app.use('/', ufobRouter);

module.exports = app;
