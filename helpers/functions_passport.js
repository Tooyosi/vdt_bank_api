const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const models = require('../connection/sequelize')
const md5 = require('md5')
let newUserDetails
// define login strategy
passport.use(new LocalStrategy(
  {
    // set the fields to be used for validation
    usernameField: 'userLogin',
    passwordField: 'password'
  },
  async (username, password, done) => {
    // hash the password for db comparison
    let pin = md5(password.trim())
    // console.log(pin)
    let newUsername = username.trim()
    user = await models.User.findOne({
      where: {
        username: newUsername
      }
    })

    // if no user in the user table, check operator table by agent details
    if (user === null) {
      let agent
      agent = await models.Agents.findOne({
        where: {
          email: newUsername
        }
      })
      if (agent !== null) {
        try {
          user = await models.Operator.findOne({
            where: {
              agent_id: agent.dataValues.id
            }
          })
        } catch (error) {
          console.log(error)
        }
      }
      // console.log(user.dataValues.PIN, "userrrrr")

      // return  console.log(user.pin)
      // if user passes validation
      if (user && (user.pin === pin || user.password === pin)) {
        // return console.log(user)
        try {
          newUserDetails = await models.User.create({
            agent_code: agent.dataValues.code,
            email: agent.dataValues.email,
            pin: user.dataValues.pin,
            password_hash: user.pin,
            date_confirmed: agent.dataValues.date_created,
            date_created: agent.dataValues.date_created,
            last_login_date: functions.getDate(),
            status: user.dataValues.status,
            date_updated: functions.getDate()
          })
        } catch (err) {
          return done(null, false, { responseDetails: err })
        }
      // return  console.log(newUserDetails)

        return done(null, newUserDetails, { message: 'redirect to update password' })
      } else {
        return done(null, false, { responseDetails: 'Incorrect User Details' })
      }
    }
    // console.log(newUserDetails.dataValues)
    if (!user) {
      return done(null, false, { responseDetails: 'Incorrect Username' })
    }
    if (user.pin !== pin) {
      if (user.password_hash !== pin) {
        return done(null, false, { responseDetails: 'Incorrect password' })
      }
    }
    if (user.pin === pin) {
      return done(null, user, { message: 'redirect to update password' })
    }
    if (user.password_hash !== pin) { return done(null, false, { responseDetails: 'Incorrect Pasword' }) }
    return done(null, user)
  }
))

passport.serializeUser((user, done) => {
  done(null, user.dataValues.id)
})

passport.deserializeUser((id, done) => {
  const users = user.dataValues.id === id ? user : false
  done(null, users)
})

module.exports = passport
