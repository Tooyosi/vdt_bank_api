class PaymentQueryResponse{
    constructor(ResponseCode ,ResponseDesc , TransDate, TransTime, TransRef ,Amount , MerchantName, TransStatus, TransMessage, Hash    ){
        this.ResponseCode  = ResponseCode 
        this.ResponseDesc  = ResponseDesc 
        this.TransDate  = TransDate 
        this.TransTime  = TransTime 
        this.TransRef  = TransRef 
        this.Amount = Amount
        this.MerchantName = MerchantName
        this.TransStatus  = TransStatus 
        this.TransMessage  = TransMessage 
        this.Hash  = Hash 
    }
    
}

module.exports = PaymentQueryResponse