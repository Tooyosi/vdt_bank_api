module.exports = {
    auth: (req, res, next)=>{
        if(req.headers.auth == null || req.headers.auth == undefined){
            return res.status(401).send("Unauthorized")
        }
        let {username, password} =JSON.parse(req.headers.auth)
        if(username !== process.env.SECRET_USERNAME || password !== process.env.SECRET_PASSWORD){
            return res.status(401).send("Unauthorized")
        }else{
            next()
        }
    }
}