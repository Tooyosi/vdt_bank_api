class PaymentUpdateRequest{
    constructor(referenceID, transReference, totalAmount, Currency, otherDetails, hash   ){
        this.referenceID  = referenceID 
        this.transReference  = transReference
        this.totalAmount = totalAmount 
        this.Currency = Currency
        this.otherDetails  = otherDetails 
        this.hash  = hash 
    }
}

module.exports = PaymentUpdateRequest