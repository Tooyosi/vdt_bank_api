const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
const Response = require('../../helpers/responseClass')
const passport = require('../../helpers/functions_passport')
const { bin2hashData, successCode, failureCode, nairaIsoCode, transSuccess, transPending, transFailure, getTime, getDay, convertDate, dateTime, addMinutes } = require('../../helpers/index')
let crypto = require('crypto')
const moment = require('moment-timezone')

const SendMail = require('../../helpers/SendMail')
module.exports = {
    getSignup: ('/', (req, res) => {
        return res.render("auth/signup", { page: "signup" })
    }),
    postSignup: ('/', async (req, res) => {
        let { firstname, lastname, email, password, confirmPassword } = req.body
        let response
        if (firstname.trim() == "" || lastname.trim() == "" || email.trim() == "" || password.trim() == "") {
            req.flash("error", "Validation Error, All fields are required")
            return res.redirect('back')
        } else if (password !== confirmPassword) {
            req.flash("error", "Validation Error, Passwords don't match")
            return res.redirect('back')
        } else {
            let existingUser = await models.User.findOne({
                where: {
                    email: email
                }
            })
            if (existingUser == null || existingUser == undefined) {
                try {
                    let newUser = await models.User.create({
                        email: email,
                        firstname: firstname,
                        lastname: lastname,
                        password: bin2hashData(password)
                    })
                    req.flash("success", "Success, Proceed to login")
                    return res.redirect('/auth/login')
                } catch (error) {
                    req.flash("error", error.toString())
                    return res.redirect('back')
                }
            } else {
                req.flash("error", "User already exists")
                return res.redirect('back')
            }
        }
    }),

    getLogin: ('/', (req, res) => {
        return res.render("auth/login", { page: "login" })
    }),

    postLogin: ('/', passport.authenticate('local', {
        successRedirect: '/admin/home',
        failureRedirect: 'login',
        failureFlash: true,
        successFlash: "Welcome Back",
    })),

    getForgot: ('/', (req, res) => {
        return res.render("auth/forgot", { page: "forgot" })
    }),

    postForgot: ('/', async (req, res) => {
        let { email } = req.body
        let dateTime = moment.tz(Date.now(), "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
        if (email.trim() == "") {
            req.flash("error", "Email is required")
            return res.redirect("back")
        }
        try {
            let user = await models.User.findOne({
                where: {
                    email: email
                }
            })

            if (user == null || user == undefined) {
                req.flash("error", "User does not exist")
                return res.redirect("back")
            }
            let resetToken = crypto.randomBytes(20).toString('hex')
            let currentDate = new Date(dateTime)
            let expiryDate = addMinutes(currentDate, 30)


            let mailSend = new SendMail("Gmail")
            mailSend.dispatch(email, "Reset Password", "Reset Password", "You are recieving this because you have requested a password reset \n\n" +
                "Please click on the following link, or paste into your browser to complete the process \n\n" +
                "http://" + req.headers.host + "/auth/reset/" + resetToken + "\n\n" +
                "If you did not request this, please ignore and your password would remain unchanged", async (err) => {
                    if (err) {
                        req.flash("error", "An error occured while sending mail, kindly try again or contact support")
                        return res.redirect("back")
                    }
                    await user.update({
                        reset_password_token: resetToken,
                        reset_password_expiry: expiryDate
                    })
                    req.flash("success", "An email has been sent with instructions")
                    return res.redirect("back")
                })
        } catch (error) {
            req.flash("failure", err.toString())
            return res.redirect("back")
        }
    }),

    getReset: ('/', async (req, res) => {
        let { token } = req.params
        try {
            let user = await models.User.findOne({
                where: {
                    reset_password_token: token
                }
            })
            if (user == null || user == undefined) {
                req.flash("error", "Invalid Token")
                return res.redirect("back")
            }else if(moment.tz("Africa/Lagos").unix() > moment.tz(user.reset_password_expiry, "Africa/Lagos").unix()){
                await user.update({
                    reset_password_token: null,
                    reset_password_expiry: null
                })
                response = new BaseResponse(failureStatus, "Token Expired", failureCode, {})
                return res.status(400).json(response)
            }
            return res.render("auth/reset", { page: "forgot", token: token })

        } catch (error) {
            req.flash("error", error.toString())
            return res.redirect("back")
        }
    }),

    postReset: ('/', async (req, res) => {
        let { token } = req.params
        let {password} = req.body
        try {
            let user = await models.User.findOne({
                where: {
                    reset_password_token: token
                }
            })
            if (user == null || user == undefined) {
                req.flash("error", "Invalid Token")
                return res.redirect("back")
            }else if(moment.tz("Africa/Lagos").unix() > moment.tz(user.reset_password_expiry, "Africa/Lagos").unix()){
                await user.update({
                    reset_password_token: null,
                    reset_password_expiry: null
                })
                req.flash("error", "Token Expired")
                return res.redirect("/auth/forgot")
            }
            await user.update({
                reset_password_token: null,
                reset_password_expiry: null,
                password: bin2hashData(password)
            })
            req.flash("success", "Proceed to login")
            return res.redirect('/auth/login')

        } catch (error) {
            req.flash("error", error.toString())
            return res.redirect("back")
        }
    }),


    logout: ('/', (req, res) => {
        req.logout();
        res.redirect("/auth/login")
    })
}