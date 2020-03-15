const axios = require("axios")


class AlepoCallService {
    constructor() {
        this.auth = {
            username: process.env.ALEPO_USERNAME,
            password: process.env.ALEPO_PASSWORD,
        }
    }

    async makeCall(method, url) {
        let response, status;
        try {
            response = await axios({
                method: method,
                url: url,
                auth: this.auth
            }).then((res)=>{
                status = true
                return res.data
            }).catch((err)=>{
                return err.toString()
            })

        } catch (error) {
            status = false
            response = error.toString()
        }

        return {response, status: status? true : false}
    }
}

module.exports = AlepoCallService