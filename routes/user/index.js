const express = require("express")
const router = express.Router({mergeParams: true})
const userController = require('../../controllers/user/index')

router.get('/:id',  userController.fetchUser)

module.exports = router