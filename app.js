const express = require('express')
const app = express()
const expressSwagger = require('express-swagger-generator')(app);
const {logger} = require('./loggers/logger')
require('dotenv').config();

const sequelize = require('./connection/sequelize')

app.use(express.json());
app.use(express.urlencoded({extended: true}))

const userRoutes = require('./routes/user/index')

app.use('/user', userRoutes)

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