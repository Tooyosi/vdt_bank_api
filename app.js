const express = require('express')
const app = express()
const {logger} = require('./loggers/logger')
require('dotenv').config();

app.listen(process.env.PORT, ()=>{
    logger.info(`Application is running on port ${process.env.PORT}`)
})