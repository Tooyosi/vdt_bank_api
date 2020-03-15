const express = require("express")
const router = express.Router({mergeParams: true})
const paymentController = require('../../controllers/payments/index')

router.post("/:id", paymentController.postPayment)

module.exports = router