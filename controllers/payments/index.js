const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
const uuid = require('uuid').v4
const axios = require('axios');
const nodemailer = require('nodemailer')
const Response = require('../../helpers/responseClass')
const AlepoCallService = require('../../helpers/AlepoCallService');
const SendMail = require('../../helpers/SendMail')
let mailService = new SendMail("Gmail");
let CallService = new AlepoCallService()
module.exports = {
    postPayment: ("/", async (req, res) => {
        let { id } = req.params
        let validationCall = await CallService.makeCall("GET", `${process.env.ALEPO_GET_USER}/${id}`)
        if (req.body) {
            let { firstName, lastName, email, phoneHome, amount, bankName, transactionStatus } = req.body
            let validationCall = await CallService.makeCall("GET", `${process.env.ALEPO_GET_USER}/${id}`)
            if (validationCall.status && validationCall.response.firstName == firstName.trim() && validationCall.response.lastName == lastName.trim() && validationCall.response.email == email.trim()) {
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
                    let callResponse = await CallService.makeCall("GET", `${process.env.ALEPO_POST_USER}/${id}/postamount?amount=${amount}&paymentMethod=8&transactionType=Credit&cardId=xc03&paymentReceiver=chijioke`)
                    let { status, response } = callResponse
                    let returnedResponse = new Response(status, status ? "Success" : response.toString(), status ? "00" : "99", response)
                    if (status) {
                        newTransaction.update({
                            post_amount_status: 'success',
                            payment_number_alepo: response.paymentNumber
                        })
                        await mailService.dispatch(email, process.env.EMAIL, "VDT Payment Complete", `Your payment of ${amount} has been successful`)
                    } else {
                        newTransaction.update({
                            post_amount_status: 'failed',
                            failure_reason_alepo: response.toString()
                        })
                        logger.error(returnedResponse.description)
                    }
                    return res.status(status ? 200 : 400).send(returnedResponse)

                } else {
                    let returnedResponse = new Response(false, "All parameters are required", "99", {})
                    return res.status(400).json(returnedResponse)
                }
            } else {
                let returnedResponse = new Response(false, "Invalid Payment user details", "99", {})
                logger.error(returnedResponse.description)
                return res.status(400).send(returnedResponse)
            }
        } else {
            let returnedResponse = new Response(false, "Invalid Payload", "99", {})
            logger.error(returnedResponse.description)
            return res.status(400).send(returnedResponse)
        }
    })
}