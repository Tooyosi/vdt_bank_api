const auth = require('basic-auth')

module.exports = {
    auth: (req, res, next)=>{
        var user = auth(req)
        if (!user || user.name !==process.env.SECRET_USERNAME || user.pass !== process.env.SECRET_PASSWORD) {
            res.set('WWW-Authenticate', 'Basic realm="example"')
            return res.status(401).send()
          }
          return next()
    },
    isLoggedIn: (req, res, next)=>{
        if(req.isAuthenticated()){
            return next()
        }else{
            req.flash("error", "Kindly login to access this page")
            return res.redirect("/auth/login")
        }
    }
}