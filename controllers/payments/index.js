const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
const Response = require('../../helpers/responseClass')
const AlepoCallService = require('../../helpers/AlepoCallService');
let CallService = new AlepoCallService()
const uuid = require('uuid').v4
const SendMail = require('../../helpers/SendMail')
let mailService = new SendMail("Gmail");
const PaymentValidationResponseClass = require('../../helpers/PaymentValidationResponse')
const PaymentUpdateResponseClass = require('../../helpers/PaymentUpdateResponse')
const PaymentQueryResponse = require('../../helpers/PaymentQueryResponse')
const { bin2hashData, successCode, failureCode, nairaIsoCode, transSuccess, transPending, transFailure, getTime, getDay, convertDate, dateTime, getTransMessage } = require('../../helpers/index')
const moment = require('moment-timezone')
module.exports = {
    validatePayment: ('/', async (req, res) => {
        let response
        let { referenceID, otherDetails, hash } = req.body
        let { isManualRenew } = otherDetails
        //console.log(bin2hashData(referenceID + isManualRenew + process.env.HASH_KEY, process.env.HASH_KEY), 1)
        if (referenceID.trim() == "") {
            let responseHash = bin2hashData(referenceID + "" + isManualRenew + failureCode + "Invalid User Id" + process.env.HASH_KEY)
            response = new PaymentValidationResponseClass(referenceID, "", otherDetails, failureCode, "Invalid User Id", responseHash)
            return res.status(200).json(response)
        }
        //  else if (amount < 0) {
        //     response = new PaymentValidationResponseClass(referenceID, "", otherDetails, 0.00, failureCode, "Invalid Amount", hash)
        //     return res.status(200).json(response)
        // } 
        else if (hash !== bin2hashData(referenceID + isManualRenew + process.env.HASH_KEY, process.env.HASH_KEY)) {
            let responseHash = bin2hashData(referenceID + "" + isManualRenew + failureCode + "Invalid Hash" + process.env.HASH_KEY)
            response = new PaymentValidationResponseClass(referenceID, "", otherDetails, failureCode, "Invalid Hash", responseHash)
            return res.status(200).json(response)
        } else {
            let callResponse = await CallService.makeCall("GET", `${process.env.ALEPO_GET_USER}/${referenceID}`)
            let { status } = callResponse
            if (status == true) {
                let { firstName, lastName, email, phoneHome } = callResponse.response
                let responseHash = bin2hashData(referenceID + `${firstName} ${lastName}` + isManualRenew + successCode + "Successful" + process.env.HASH_KEY)

                response = new PaymentValidationResponseClass(referenceID, `${firstName} ${lastName}`, { ...otherDetails }, successCode, "Successful", responseHash)
                return res.status(200).json(response)
            } else {
                let responseHash = bin2hashData(referenceID + "" + isManualRenew + successCode + "Successful" + process.env.HASH_KEY)
                response = new PaymentValidationResponseClass(referenceID, "", otherDetails, failureCode, callResponse.response.toString(), responseHash)
                return res.status(200).json(response)
            }
        }
    }),

    updatePayment: ('/', async (req, res) => {
        let response
        let { referenceID, transReference, totalAmount, Currency, otherDetails, hash, bankName, channel } = req.body
        totalAmount = parseInt(totalAmount)
        let { isManualRenew } = otherDetails
        // console.log(bin2hashData(referenceID + isManualRenew + transReference + parseInt(totalAmount).toFixed(2) + process.env.HASH_KEY, process.env.HASH_KEY), 2)
        if (referenceID.trim() == "") {
            let responseHash = bin2hashData(referenceID + transReference + "" + failureCode + "Invalid User Id" + process.env.HASH_KEY)

            response = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, "Invalid User Id", responseHash)
            return res.status(200).json(response)
        } else if (parseInt(totalAmount) < 1) {
            let responseHash = bin2hashData(referenceID + transReference + "" + failureCode + "Invalid Amount" + process.env.HASH_KEY)
            response = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, "Invalid Amount", responseHash)
            return res.status(200).json(response)
        } else if (hash !== bin2hashData(referenceID + isManualRenew + transReference + totalAmount.toFixed(2) + process.env.HASH_KEY, process.env.HASH_KEY)) {
            let responseHash = bin2hashData(referenceID + transReference + "" + failureCode + "Invalid Hash" + process.env.HASH_KEY)
            response = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, "Invalid Hash", responseHash)
            return res.status(200).json(response)
        } else {
            let validateResponse = await CallService.makeCall("GET", `${process.env.ALEPO_GET_USER}/${referenceID}`)
            if (validateResponse.status == true) {
                let paymentReference = uuid()
                try {


                    let newTransaction = await models.Transactions.create({
                        subscriber_id: referenceID,
                        customer_firstname: validateResponse.response.firstName,
                        customer_lastname: validateResponse.response.lastName,
                        customer_phone: validateResponse.response.phoneHome ? validateResponse.response.phoneHome : 'nill',
                        customer_email: validateResponse.response.email ? validateResponse.response.email : 'nill',
                        transaction_ref: transReference,
                        payment_ref: paymentReference,
                        total_amount: parseInt(totalAmount).toFixed(2),
                        charge: 0,
                        amount: totalAmount.toFixed(2),
                        bank_name: bankName && bankName !== "" ? bankName : "GtBank",
                        channel: channel,
                        transaction_status: transSuccess,
                        payment_date: convertDate(Date.now())

                    })
                    let callResponse = await CallService.makeCall("GET", `${process.env.ALEPO_POST_USER}/${referenceID}/postamount?amount=${totalAmount.toFixed(2)}&paymentMethod=8&transactionType=Credit&cardId=xc03&paymentReceiver=chijioke`)
                    if (isManualRenew == true) {
                            if (moment.tz("Africa/Lagos").unix() > moment.tz(validateResponse.response.expiryDate, "Africa/Lagos").unix()) {
                            let manualRenew = await CallService.makeCall("GET", `${process.env.ALEPO_MANUAL_RENEW}/${referenceID}/manualRenew`, { operationComment: "manual renew" })
                        }
                    }
                    let { status, response } = callResponse
                    let returnedResponse
                    if (status) {
                        let affiliateCall = await CallService.makeCall("GET", `${process.env.ALEPO_MANUAL_RENEW}/vdt/postamount?amount=${parseInt(totalAmount).toFixed(2)}&paymentMethod=0&transactionType=Debit`)
                        

                        newTransaction.update({
                            post_amount_status: 'success',
                            payment_number_alepo: response.paymentNumber
                        })
                        await mailService.dispatch(validateResponse.response.email, process.env.EMAIL, "VDT Payment Complete", `Your payment of ${totalAmount} has been successful`, async (err) => {
                            let responseHash = bin2hashData(referenceID + transReference + paymentReference + successCode + "Successful" + process.env.HASH_KEY)
                            returnedResponse = new PaymentUpdateResponseClass(referenceID, transReference, paymentReference, successCode, "Successful", responseHash)
                            return res.status(200).send(returnedResponse)
                        })
                    } else {
                        newTransaction.update({
                            post_amount_status: 'failed',
                            failure_reason_alepo: response.toString()
                        })

                        logger.error(response.toString())
                        let responseHash = bin2hashData(referenceID + transReference + paymentReference + failureCode + response.toString() + process.env.HASH_KEY)
                        returnedResponse = new PaymentUpdateResponseClass(referenceID, transReference, paymentReference, failureCode, response.toString(), responseHash)
                        return res.status(200).send(returnedResponse)

                    }
                } catch (error) {
                    logger.error(error.toString())
                    let responseHash = bin2hashData(referenceID + transReference + paymentReference ? paymentReference : "" + failureCode + error.toString() + process.env.HASH_KEY)
                    returnedResponse = new PaymentUpdateResponseClass(referenceID, transReference, paymentReference, failureCode, error.toString(), responseHash)
                    return res.status(200).send(returnedResponse)

                }
            } else {
                let responseHash = bin2hashData(referenceID + transReference + "" + failureCode + validateResponse.response.toString() + process.env.HASH_KEY)
                returnedResponse = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, validateResponse.response.toString(), responseHash)
                return res.status(200).send(returnedResponse)
            }

        }
    }),

    queryPayment: ('/', async (req, res) => {
        let response
        let { ReferenceId, TransactionReference, Hash } = req.body
        let incomingDate = req.body.Date
        let merchantName = "VDT COMMUNICATIONS LTD"
        //console.log(bin2hashData(ReferenceId + TransactionReference + incomingDate + process.env.HASH_KEY))

        if (TransactionReference.trim() == "") {
            let responseHash = bin2hashData(failureCode + "" + "" + "" + "" + "" + merchantName + transPending + "Transacrion reference is required" + process.env.HASH_KEY)
            response = new PaymentQueryResponse(failureCode, "", "", "", "", "", merchantName, transPending, "Transacrion reference is required", responseHash)
            return res.status(200).send(response)
        } else if (Hash !== bin2hashData(ReferenceId + TransactionReference + incomingDate + process.env.HASH_KEY)) {
            let responseHash = bin2hashData(failureCode + "" + "" + "" + "" + "" + merchantName + transPending + "Invalid Hash" + process.env.HASH_KEY)
            response = new PaymentQueryResponse(failureCode, "", "", "", "", "", merchantName, transPending, "Invalid Hash", responseHash)
            return res.status(200).json(response)
        } else {
            let whereObj = {
                transaction_ref: TransactionReference
            }
            if (incomingDate && incomingDate.trim() !== "") {
                let lessDate = new Date(incomingDate)
                lessDate.setDate(lessDate.getDate() + 1);
                whereObj.payment_date = {
                    [Op.gt]: getDay(incomingDate),
                    [Op.lt]: getDay(lessDate)
                }
            }

            let transaction = await models.Transactions.findOne({
                where: whereObj
            })
            if (transaction !== null && transaction !== undefined) {
                let { dataValues } = transaction
                let responseHash = bin2hashData(successCode + "Successful" + getDay(dataValues.payment_date) + getTime(dataValues.payment_date) + dataValues.transaction_ref + dataValues.amount + merchantName + dataValues.transaction_status + getTransMessage(dataValues.transaction_status) + process.env.HASH_KEY)
                response = new PaymentQueryResponse(successCode, "Successful", getDay(dataValues.payment_date), getTime(dataValues.payment_date), dataValues.transaction_ref, dataValues.amount, merchantName, dataValues.transaction_status, getTransMessage(dataValues.transaction_status), responseHash)
                return res.status(200).send(response)
            } else {
                let responseHash = bin2hashData(failureCode + "" + "" + "" + "" + "" + merchantName + transPending + "Transacrion not found" + process.env.HASH_KEY)
                response = new PaymentQueryResponse(failureCode, "", "", "", "", "", merchantName, transPending, "Transacrion not found", responseHash)
                return res.status(200).send(response)
            }
        }

    })
}