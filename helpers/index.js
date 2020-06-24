let crypto = require('crypto')
const moment = require('moment-timezone')

module.exports = {
    bin2hashData:  (data, key)=> {
        // let genHash = crypto.createHmac('sha512', key).update(data, "ascii").digest('hex')
        // return genHash
        var crypto = require('crypto');
        //creating hash object 
        var hash = crypto.createHash('sha512');
        //passing the data to be hashed
        var data = hash.update(data, 'utf-8');
        //Creating the hash in the required format
        var gen_hash = data.digest('hex');
        return gen_hash
    },
    successCode: "00",
    failureCode: "01",
    nairaIsoCode: 566,
    transSuccess: "00",
    transPending: "01",
    transFailure: "02",
    convertDate:(date)=> {
        return moment.tz(date, "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
    },
    dateTime:  moment.tz(Date.now(), "Africa/Lagos").format().slice(0, 19).replace('T', ' '),
    getDay: (day)=>{
        return moment(day).format('YYYY-MM-DD')
    },
    getTime: (date)=>{
        return moment(date).format('HH:mm:ss')
    },
    addMinutes: (date, minutes) => {
        return moment.tz(new Date(date.getTime() + minutes * 60000), "Africa/Lagos").format().slice(0, 19).replace('T', ' ')
    },
    getTransMessage:(status)=>{
        let response
        switch(status){
            case "00":
                response = "Success";
            break;
            case "01":
                response = "Pending";
            break;
            case "02":
                response = "Failed";
            break;
            default:
                response = "Interdeterminate"
            break;
        }
        return response
    }
}