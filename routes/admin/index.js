const express = require('express');
const router = express.Router({ mergeParams: true });
const adminController = require("../../controllers/admin/index")
const {isLoggedIn} = require('../../middleware/index')

router.get('/home', isLoggedIn, adminController.get)
router.get('/download', isLoggedIn, adminController.getCsv)

module.exports = router;
