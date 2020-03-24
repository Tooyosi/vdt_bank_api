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
const { bin2hashData, successCode, failureCode, nairaIsoCode, transSuccess ,transPending,transFailure, getTime, getDay, dateTime, getTransMessage } = require('../../helpers/index')

module.exports = {
    validatePayment: ('/', async (req, res) => {
        let response
        let { referenceID, otherDetails, hash } = req.body
        let { amount } = otherDetails
        console.log(bin2hashData(referenceID + amount, process.env.HASH_KEY), 1)
        if (referenceID.trim() == "") {
            response = new PaymentValidationResponseClass(referenceID, "", otherDetails, 0.00, failureCode, "Invalid User Id", hash)
            return res.status(200).json(response)
        } else if (amount < 0) {
            response = new PaymentValidationResponseClass(referenceID, "", otherDetails, 0.00, failureCode, "Invalid Amount", hash)
            return res.status(200).json(response)
        } else if (hash !== bin2hashData(referenceID + amount, process.env.HASH_KEY)) {
            response = new PaymentValidationResponseClass(referenceID, "", otherDetails, 0.00, failureCode, "Invalid Hash", hash)
            return res.status(200).json(response)
        } else {
            let callResponse = await CallService.makeCall("GET", `${process.env.ALEPO_GET_USER}/${referenceID}`)
            let { status } = callResponse
            if (status == true) {
                let { firstName, lastName, email, phoneHome } = callResponse.response
                response = new PaymentValidationResponseClass(referenceID, `${firstName} ${lastName}`, { ...otherDetails, currency: nairaIsoCode, charges: parseFloat(process.env.TRANSACTION_CHARGES) }, parseFloat(amount + Number(process.env.TRANSACTION_CHARGES)), successCode, "Successful", hash)
                return res.status(200).json(response)
            } else {
                response = new PaymentValidationResponseClass(referenceID, "", otherDetails, 0.00, failureCode, "Invalid User", hash)
                return res.status(200).json(response)
            }
        }
    }),

    updatePayment: ('/', async (req, res) => {
        let response
        let { referenceID, transReference, totalAmount, Currency, otherDetails, hash } = req.body
        let { amount, charges, currency } = otherDetails
        console.log(bin2hashData(referenceID + amount + charges + currency, process.env.HASH_KEY), 2)
        if (referenceID.trim() == "") {
            response = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, "Invalid User Id", hash)
            return res.status(200).json(response)
        } else if (totalAmount < 0 || amount < 0) {
            response = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, "Invalid Amount", hash)
            return res.status(200).json(response)
        } else if (hash !== bin2hashData(referenceID + amount + charges + currency, process.env.HASH_KEY)) {
            response = new PaymentUpdateResponseClass(referenceID, transReference, "", failureCode, "Invalid Hash", hash)
            return res.status(200).json(response)
        } else {
            let validateResponse = await CallService.makeCall("GET", `${process.env.ALEPO_GET_USER}/${referenceID}`)
            let paymentReference = uuid()
            let newTransaction = await models.Transactions.create({
                subscriber_id: referenceID,
                customer_firstname: validateResponse.response.firstName,
                customer_lastname: validateResponse.response.lastName,
                customer_phone: validateResponse.response.phoneHome,
                customer_email: validateResponse.response.email,
                transaction_ref: transReference,
                payment_ref: paymentReference,
                total_amount: totalAmount,
                charge: charges,
                amount: amount,
                bank_name: "GtBank",
                transaction_status: transSuccess,
                payment_date: dateTime

            })
            let callResponse = await CallService.makeCall("GET", `${process.env.ALEPO_POST_USER}/${referenceID}/postamount?amount=${amount}&paymentMethod=8&transactionType=Credit&cardId=xc03&paymentReceiver=chijioke`)
            let { status, response } = callResponse
            let returnedResponse 
            if (status) {
                newTransaction.update({
                    post_amount_status: 'success',
                    payment_number_alepo: response.paymentNumber
                })
                await mailService.dispatch(validateResponse.response.email, process.env.EMAIL, "VDT Payment Complete", `Your payment of ${amount} has been successful`, async (err)=>{
                    returnedResponse = new PaymentUpdateResponseClass(referenceID, transReference, paymentReference, successCode, "Successful", hash)
                    return res.status(200).send(returnedResponse)
                })
            } else {
                newTransaction.update({
                    post_amount_status: 'failed',
                    failure_reason_alepo: response.toString()
                })
                logger.error(response.toString())
                returnedResponse = new PaymentUpdateResponseClass(referenceID, transReference, paymentReference, failureCode,  response.toString(), hash)
                return res.status(200).send(returnedResponse)

            }

        }
    }),

    queryPayment: ('/', async(req, res)=>{
        let response
        let {ReferenceId , CustomerId , FormId , FieldId  , Hash } = req.body
        let incomingDate = req.body.Date
            console.log(bin2hashData(String(ReferenceId + CustomerId + FormId + FieldId + incomingDate), process.env.HASH_KEY))
      
        if(ReferenceId.trim() == ""){
            response = new PaymentQueryResponse(failureCode, "", "", "", "", "", "",transPending, "Transacrion reference is required" )
            return res.status(200).send(response)
        }else if (Hash !== bin2hashData(String(ReferenceId + CustomerId + FormId + FieldId + incomingDate), process.env.HASH_KEY)) {
            response = new PaymentQueryResponse(failureCode, "", "", "", "", "", "",transPending, "Invalid Hash" )
            return res.status(200).json(response)
        } else{
            let transaction = await models.Transactions.findOne({
                where: {
                    transaction_ref: ReferenceId
                }
            })
            if(transaction !== null && transaction !== undefined){
                let {dataValues} = transaction
                response = new PaymentQueryResponse(successCode,"Successful", getDay(dataValues.payment_date),getTime(dataValues.payment_date),dataValues.transaction_ref, dataValues.amount, `${dataValues.customer_firstname} ${dataValues.customer_lastname}`,dataValues.transaction_status, getTransMessage(dataValues.transaction_status), Hash )
                return res.status(200).send(response)
            }else{
                response = new PaymentQueryResponse(failureCode, "", "", "", "", "", "",transPending, "Transacrion not found" )
                return res.status(200).send(response)
            }
        }

    })
}