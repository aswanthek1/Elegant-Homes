let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let hbs = require('express-handlebars')
const mongoose = require('mongoose');
let session = require('express-session');
const multer = require("multer");
const easyinvoice = require('easyinvoice')
const dotenv = require('dotenv')
dotenv.config({path:"./config.env"})

let usersRouter = require('./routes/users');
let adminRouter = require('./routes/admin');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/',
helpers:{
eq: function (v1,v2) {return v1 === v2;},
gt: function (v1,v2) {return v1 > v2;},
ne: function (v1, v2) { return v1 !== v2; },
lt: function (v1, v2) { return v1 < v2; },
lte: function (v1, v2) { return v1 <= v2; },
gte: function (v1, v2) { return v1 >= v2; },
and: function (v1, v2) { return v1 && v2; },
or: function (v1, v2) { return v1 || v2; },

format:function(date){
  newdate=date.toUTCString()
  return newdate.slice(0,16)
},
subTotal:function (price,quantity){
  return price*quantity
},
inc1:(n) => {
  return n+1
}



}}))


const mongoURI = process.env.DATABASE
mongoose.connect(mongoURI).then((res)=>{
  console.log("mongoose connected");
}).catch((err)=>{
  console.log("not connected");
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
  saveUninitialized:true,
  cookie: { maxAge: 6000000000 },
  resave: false 
}));


app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})




app.use('/', usersRouter);
app.use('/admin', adminRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
