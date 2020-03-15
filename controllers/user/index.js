const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
const axios = require("axios")

module.exports = {
    fetchUser: ("/", async (req, res)=>{
        let { id } = req.params
        if(id == "" || !id){
            return res.status(400).json({
                status: false,
                description: "User ID is required",
                code: 99,
                data: {}
            })
        }else {
            let status
            let response = await axios({
                method: "GET",
                url: `${process.env.ALEPO_GET_USER}/${id}`,
                auth: {
                    username: process.env.ALEPO_USERNAME,
                    password: process.env.ALEPO_PASSWORD,
                }
            }).then((res)=>{
                let response = res.data
                status = true
                return response
            }).catch((err)=>{
                status = false
                return err.toString()
            })

            return res.status(status? 200 : 400).send({
                status: status,
                description: status? "Success" : response.toString(),
                data: status? {firstName: response.firstName, 
                               lastName: response.lastName,
                               email: response.email,
                               phoneHome: response.phoneHome
                            }: response,
                code: status? "00" : "99"
            })
        }
    })
}