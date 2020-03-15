const nodemailer = require('nodemailer')
const {logger} = require('../loggers/logger')
class SendMail {
    constructor(service) {
        this.service = service
        this.auth = {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    }

    async dispatch(to, from, subject, text) {
        var smtpTransport = nodemailer.createTransport({
            service: this.service,
            auth: this.auth
        });

        var mailOptions = {
            to: to,
            from: from,
            subject: subject,
            text: text
        };
        await smtpTransport.sendMail(mailOptions, (err) => {
            if (err) {
                logger.error(err.toString())
            } else {
                logger.info(`Mail sent to ${mailOptions.to}`)
            }
        });
    }
}

module.exports = SendMail