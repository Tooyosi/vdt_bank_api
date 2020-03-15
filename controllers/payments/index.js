const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
const uuid = require('uuid').v4
const axios = require('axios');
const nodemailer = require('nodemailer')
module.exports = {
    postPayment: ("/", async (req, res) => {
        let { id } = req.params
        if (req.body) {
            let { firstName, lastName, email, phoneHome, amount, bankName, transactionStatus } = req.body
            if ((amount && amount !== "") && (firstName && firstName.trim() !== "") && (lastName && lastName.trim() !== "") && (email && email.trim() !== "") && (phoneHome && phoneHome.trim() !== "") && (bankName && bankName.trim() !== "")) {
                let newTransaction = await models.Transactions.create({
                    subscriber_id: id,
                    customer_firstname: firstName,
                    customer_lastname: lastName,
                    customer_phone: phoneHome,
                    customer_email: email,
                    transaction_ref: uuid(),
                    amount: amount,
                    bank_name: bankName,
                    transaction_status: transactionStatus ? "success" : "failed",
                    payment_date: new Date().toISOString().slice(0, 19).replace('T', ' ')

                })
                let status
                let response = await axios({
                    method: "GET",
                    url: `${process.env.ALEPO_POST_USER}/${id}/postamount?amount=${amount}&paymentMethod=8&transactionType=Credit&cardId=xc03&paymentReceiver=chijioke`,
                    auth: {
                        username: process.env.ALEPO_USERNAME,
                        password: process.env.ALEPO_PASSWORD,
                    }
                }).then(async (res) => {
                    let response = res.data
                    status = true
                    newTransaction.update({
                        post_amount_status: 'success',
                        payment_number_alepo: response.paymentNumber
                    })
                    var smtpTransport = nodemailer.createTransport({
                        service: "Gmail",
                        auth: {
                            user: process.env.EMAIL,
                            pass: process.env.PASSWORD
                        }
                    });
                    var mailOptions = {
                        to: email,
                        from: process.env.EMAIL,
                        subject: "VDT Payment Complete",
                        text: `Your payment of ${amount} has been successful`
                    };
                    let mailResponse = await smtpTransport.sendMail(mailOptions, (err) => {
                        if (err) {
                            console.log(err)
                            logger.error(err.toString())
                        }else{
                            logger.info(`Mail sent to ${email}`)
                        }
                    });
                    return response
                }).catch((err) => {
                    status = false
                    newTransaction.update({
                        post_amount_status: 'failed',
                        failure_reason_alepo: err.toString()
                    })
                    return err
                })

                return res.status(status ? 200 : 400).send({
                    status: status,
                    description: status ? "Success" : response.toString(),
                    data: response,
                    code: status ? "00" : "99"
                })

            } else {
                return res.status(400).json({
                    status: false,
                    description: "All parameters are required",
                    code: 99,
                    data: {}
                })
            }
        } else {
            return res.status(400).send({
                status: false,
                description: "Invalid Payload",
                data: {},
                code: "99"
            })
        }
    })
}