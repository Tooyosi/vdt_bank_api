const express = require("express")
const router = express.Router({mergeParams: true})
const userController = require('../../controllers/user/index')

router.get('/:id',  userController.fetchUser)
router.post('/:id/pay',  userController.payUser)

module.exports = router