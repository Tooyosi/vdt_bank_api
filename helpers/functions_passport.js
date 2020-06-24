'use strict';
const passport = require('passport');
const Strategy = require('passport-local');
const models = require('../connection/sequelize')
const {bin2hashData} = require('./index')

passport.use(new Strategy({
    // set the fields to be used for validation
    usernameField: 'email',
    passwordField: 'password'
},
    async (username, password, done) => {
        let userDetails = await models.User.findOne({
            where: {
                email: username,
                password: bin2hashData(password)
            }
        })
        if (userDetails !== null && userDetails !== undefined) {
            let {dataValues} = userDetails

            done(null, userDetails)
        }else if(userDetails == null){
            done(null, false, "User does not exist");
        }else{
            done(null, false, "Invalid Credentials");
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.user_id)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

module.exports = passport;