const express = require("express")
const router = express.Router({mergeParams: true})
const userController = require('../../controllers/user/index')

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User Routes
 */
/**
* @swagger
* /user/{id}:
*   get:
*     summary: User fetch route .
*     tags: [Users]
*     description: This Route accepts user successful payment.
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: id   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user ID
*
*     responses: 
*       200:
*         description: Receive back flavor and flavor Id.
*         examples:
*           status: true,
*           description: Success,
*           code: 00,
*           data: 
*             value:
*               firstName: Billing,
*               lastName: fash,
*               email: billing@bitflux.com,
*               phoneHome: 08132366399
*       400:
*         description: Bad Request.
*/
router.get('/:id',  userController.fetchUser)

/**
* @swagger
* /user/{id}/pay:
*   post:
*     summary: User payment route .
*     tags: [Users]

*     description: This Route accepts user successful payment.
*     consumes:
*       — application/json
*     parameters:
*       - in: path
*         name: id   
*         required: true
*         schema:
*           type: integer
*           minimum: 1
*           description: The user ID
*       - in: body
*         name: body   
*         required: true
*         schema:
*            type: object
*            required:
*              -firstName
*              -lastName
*              -email
*              -phoneHome
*              -bankName
*              -transactionStatus
*              -amount
*            properties:
*              firstName:
*                type: string
*              lastName:
*                type: string
*              email:
*                type: string
*              phoneHome:
*                type: string
*              bankName:
*                type: string
*              transactionStatus:
*                type: boolean
*              amount:
*                type: integer
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
router.post('/:id/pay',  userController.payUser)

module.exports = router