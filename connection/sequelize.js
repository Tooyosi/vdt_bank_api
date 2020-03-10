const Sequelize = require('sequelize');

const UserModel = require("../models/user");
const TransactionsModel = require("../models/transactions");
const ProductsModel = require("../models/products");


const sequelize = require('./index')

var models = {}
models.User = UserModel(sequelize, Sequelize)
models.Transactions = TransactionsModel(sequelize, Sequelize)
models.Products = ProductsModel(sequelize, Sequelize)


sequelize.sync()
    .then((res) => {

        console.log("Db Connnected")
    })
    .catch((err) => {
        console.log(err)
    })

module.exports = models;