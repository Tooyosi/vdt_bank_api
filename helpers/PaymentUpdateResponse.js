class PaymentUpdateResponse {
    constructor(referenceID, transReference, PaymentReference, responseCode, responseDesc, hash) {
        this.referenceID = referenceID
        this.transReference = transReference
        this.PaymentReference = PaymentReference
        this.responseCode = responseCode
        this.responseDesc = responseDesc
        this.hash = hash
    }
}

module.exports = PaymentUpdateResponse