const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
const Response = require('../../helpers/responseClass') 
const AlepoCallService = require('../../helpers/AlepoCallService');
let CallService = new AlepoCallService()

module.exports = {
    fetchUser: ("/", async (req, res)=>{
        let { id } = req.params
        if(id == "" || !id){
            let returnedResponse = new Response(false, "User ID is required", "99", {})
            logger.error(returnedResponse.toString())
            return res.status(400).json(returnedResponse)
        }else {
            let callResponse = await CallService.makeCall("GET",`${process.env.ALEPO_GET_USER}/${id}` )
            let {status, response} = callResponse
            let returnedResponse = new Response(status, status? "Success" : response.toString(), status? "00" : "99", status? {firstName: response.firstName, 
                lastName: response.lastName,
                email: response.email,
                phoneHome: response.phoneHome
             }: response)
             !status? logger.error(returnedResponse.toString()) : null
            return res.status(status? 200 : 400).send(returnedResponse)
        }
    })
}