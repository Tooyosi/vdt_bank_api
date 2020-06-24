const {nairaIsoCode} = require('./index')
class PaymentValidationResponse{
    constructor(referenceID, CustomerName, otherDetails,  statusCode, statusMessage, hash ){
        this.referenceID  = referenceID 
        this.CustomerName  = CustomerName 
        this.otherDetails  = otherDetails 
        // this.totalAmount  = totalAmount 
        this.Currency  = nairaIsoCode 
        this.statusCode  = statusCode 
        this.statusMessage = statusMessage 
        this.hash = hash 
    }
}

module.exports = PaymentValidationResponse