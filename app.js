const express = require('express')
const app = express()
const {logger} = require('./loggers/logger')
const path = require("path")
const flash = require('connect-flash');
const swaggerUi = require('swagger-ui-express');
const specs = require('./swagger/index')
const cookieParser = require('cookie-parser');
require('dotenv').config();


app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/js", express.static(path.join(__dirname, "node_modules/jquery/dist")));
app.use(flash());
app.use(cookieParser());
app.use(require("express-session")({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(function (req, res, next) {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
})

const userRoutes = require('./routes/user/index')
const paymentRoutes = require('./routes/payments/index')
const adminRoute = require('./routes/admin/index')

app.use('/user', userRoutes)
app.use('/pay', paymentRoutes)
app.use('/admin', adminRoute)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
});

app.listen(process.env.PORT, ()=>{
    logger.info(`Application is running on port ${process.env.PORT}`)
})