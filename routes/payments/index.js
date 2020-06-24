const express = require("express")
const router = express.Router({mergeParams: true})
const paymentController = require('../../controllers/payments/index')
const {auth} = require('../../middleware/index')

/**
 * @swagger
 * tags:
 *   name: Payment
 *   description: Payment Routes
 */

/**
* @swagger
* /pay/initiate:
*   post:
*     summary:  Payment route .
*     tags: [Payment]

*     description: This Route accepts user successful payment.
*     consumes:
*       — application/json
*     parameters:
*       - name: Auth
*         in: header
*         description: Basic Auth
*         type: string*
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -referenceID
*              -otherDetails
*              -hash
*            properties:
*              referenceID:
*                type: string
*              otherDetails:
*                type: object
*                properties:
*                  isManualRenew:
*                     type: boolean
*              hash:
*                type: string
*     requestBody:
*         required: true
*         content:
*           application/json:
*              schema:
*                type: object
*                properties:
*                   firstName:
*                     type: string
*                minimum: 1
*                description: The user ID
*         name: id   
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/initiate', auth, paymentController.validatePayment)

/**
* @swagger
* /pay/update:
*   post:
*     summary:  Payment confirmation route .
*     tags: [Payment]

*     description: This Route accepts user successful payment.
*     consumes:
*       — application/json
*     parameters:
*       - name: Auth
*         in: header
*         description: Basic Auth
*         type: string*
*         properties:
*             username:
*               type: string
*             password:
*               type: string
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -referenceID
*              -otherDetails
*              -hash
*              -transReference
*              -totalAmount
*            properties:
*              referenceID:
*                type: string
*              transReference:
*                type: string
*              bankName:
*                type: string
*              channel:
*                type: string
*              totalAmount:
*                type: string
*              otherDetails:
*                type: object
*                properties:
*                  isManualRenew:
*                     type: boolean
*              hash:
*                type: string
*     requestBody:
*         required: true
*         content:
*           application/json:
*              schema:
*                type: object
*                properties:
*                   firstName:
*                     type: string
*                minimum: 1
*                description: The user ID
*         name: id   
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/update',auth,  paymentController.updatePayment)


/**
* @swagger
* /pay/query:
*   post:
*     summary:  Payment confirmation route .
*     tags: [Payment]

*     description: This Route accepts user successful payment.
*     consumes:
*       — application/json
*     parameters:
*       - name: Auth
*         in: header
*         description: Basic Auth
*         type: string*
*         properties:
*             username:
*               type: string
*             password:
*               type: string
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -ReferenceId
*              -TransactionReference 
*              -Date 
*              -Hash 
*            properties:
*              ReferenceId:
*                type: string
*              TransactionReference:
*                type: string
*              Date:
*                type: string
*              Hash:
*                type: string
*     requestBody:
*         required: true
*         content:
*           application/json:
*              schema:
*                type: object
*                properties:
*                   firstName:
*                     type: string
*                minimum: 1
*                description: The user ID
*         name: id   
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*       400:
*         description: Bad Request.
*/
router.post('/query', auth, paymentController.queryPayment)
module.exports = router