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
*         description: authorization details
*         type: object
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
*            properties:
*              referenceID:
*                type: string
*              otherDetails:
*                type: object
*                properties:
*                  amount:
*                     type: integer
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
*         description: authorization details
*         type: object
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
*              -Currency
*              -totalAmount
*            properties:
*              referenceID:
*                type: string
*              transReference:
*                type: string
*              totalAmount:
*                type: integer
*              Currency:
*                type: integer
*              otherDetails:
*                type: object
*                properties:
*                  amount:
*                     type: integer
*                  currency:
*                     type: integer
*                  charges:
*                     type: integer
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
*         description: authorization details
*         type: object
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
*              -CustomerId 
*              -FormId 
*              -FieldId 
*              -Date 
*              -Hash 
*            properties:
*              ReferenceId:
*                type: string
*              CustomerId:
*                type: integer
*              FormId:
*                type: integer
*              FieldId:
*                type: integer
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