const express = require('express')
const app = express()
const expressSwagger = require('express-swagger-generator')(app);
const {logger} = require('./loggers/logger')
const path = require("path")
const flash = require('connect-flash');
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
const adminRoute = require('./routes/admin/index')

app.use('/user', userRoutes)
app.use('/admin', adminRoute)

let options = {
    swaggerDefinition: {
        info: {
            description: 'This is a sample server',
            title: 'Swagger',
            version: '1.0.0',
        },
        host: `${process.env.IP}:${process.env.PORT}`,
        basePath: '/',
        produces: [
            "application/json",
            "application/xml"
        ],
        schemes: ['http', 'https'],
        securityDefinitions: {
            JWT: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
                description: "",
            }
        }
    },
    basedir: __dirname, //app absolute path
    files: ['./routes/**/*.js'] //Path to the API handle folder
};
expressSwagger(options)

app.use('/user', userRoutes)

app.listen(process.env.PORT, ()=>{
    logger.info(`Application is running on port ${process.env.PORT}`)
})