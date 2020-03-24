const axios = require("axios")
const {logger} = require('../loggers/logger')

class AlepoCallService {
    constructor() {
        this.auth = {
            username: process.env.ALEPO_USERNAME,
            password: process.env.ALEPO_PASSWORD,
        }
    }

    async makeCall(method, url) {
        let response, status = false;
        try {
            response = await axios({
                method: method,
                url: url,
                auth: this.auth
            }).then((res)=>{
                status = true
                return res.data
            }).catch((err)=>{
                logger.error(err.toString())
                return err.toString()
            })

        } catch (error) {
            logger.error(error.toString())
            status = false
            response = error.toString()
        }

        return {response, status: status? true : false}
    }
}

module.exports = AlepoCallService