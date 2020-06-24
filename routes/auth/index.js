const express = require('express');
const router = express.Router({ mergeParams: true });
const authController = require("../../controllers/auth/index")
// const middleware = require('../../middleware/index')

router.get('/signup',  authController.getSignup)
router.post('/signup',  authController.postSignup)
router.get('/login',  authController.getLogin)
router.post('/login',  authController.postLogin)
router.get('/logout',  authController.logout)
router.get('/forgot',  authController.getForgot)
router.post('/forgot',  authController.postForgot)
router.get('/reset/:token',  authController.getReset)
router.post('/reset/:token',  authController.postReset)

module.exports = router;
