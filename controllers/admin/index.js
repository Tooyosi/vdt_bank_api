const models = require('../../connection/sequelize')
const Op = require('sequelize').Op
const { logger } = require('../../loggers/logger')
var moment = require('moment');
const createCsvWriter = require('csv-writer').createObjectCsvWriter

module.exports = {
    get: ('/', async (req, res) => {
        try {
            var perPage = 20;

            var pageQuery = parseInt(req.query.page);
            let { subsId, ref, email, amount, status, date, channel } = req.query
            var pageNumber = pageQuery ? pageQuery : 1;
            let whereObj = {}
            if (subsId) {
                whereObj.subscriber_id = subsId
            }
            if (ref) {
                whereObj.transaction_ref = ref
            }
            
            if (channel) {
                whereObj.channel = channel
            }
            if (email) {
                whereObj.customer_email = email
            }
            if (amount) {
                whereObj.amount = amount
            }
            if (status) {
                whereObj.transaction_status = status
            }
            if(date){
                whereObj.payment_date = {
                    [Op.startsWith] : moment(new Date(date)).format('YYYY-MM-DD')
                }

            }
            let transactions = await models.Transactions.findAndCountAll({
                offset: ((perPage * pageNumber) - perPage),
                limit: perPage,
                where: whereObj,
                order: [['trans_id', 'DESC']],

            })
            return res.render("admin", {
                page: "home",
                data: transactions.rows,
                current: pageNumber,
                pages: Math.ceil(transactions.count / perPage),
                subsId: subsId ? subsId : false,
                ref: ref ? ref : false,
                email: email ? email : false,
                amount: amount ? amount : false,
                status: status ? status : false,
                channel: channel ? channel : false,
                date: date ? date : false
            });

        } catch (error) {
            logger.error(error)
            req.flash('error', error)
            return res.redirect('back')
        }
    }),

    getCsv:  ('/', async (req, res) => {
        try {
            var perPage = 20;

            var pageQuery = parseInt(req.query.page);
            let { subsId, ref, email, amount, status, date, channel } = req.query
            var pageNumber = pageQuery ? pageQuery : 1;
            let whereObj = {}
            if (subsId) {
                whereObj.subscriber_id = subsId
            }
            if (ref) {
                whereObj.transaction_ref = ref
            }
            if (channel) {
                whereObj.channel = channel
            }
            if (email) {
                whereObj.customer_email = email
            }
            if (amount) {
                whereObj.amount = amount
            }
            if (status) {
                whereObj.transaction_status = status
            }
            if(date){
                whereObj.payment_date = {
                    [Op.startsWith] : moment(new Date(date)).format('YYYY-MM-DD')
                }
            }
            let transactions = await models.Transactions.findAndCountAll({
                offset: ((perPage * pageNumber) - perPage),
                limit: perPage,
                where: whereObj,
                order: [['trans_id', 'DESC']],

            })
            const options = { 
                fieldSeparator: ',',
                headers: ['Transaction id','Subscriber Id', 'Customer Firstname', 'Customer Lastname', 'Customer Phone', 'Customer Email', 'Transaction Reference', 'Amount', 'Transaction Status', 'Paymwnt Date', 'Paystack Failure Reason', 'Post amount status', 'Alepo payment status', 'Alepo failure reason']
              };
             
            
            let filename = `Transactions.csv`
            const csvWriter = createCsvWriter({
                path: `${filename}`,
                header: [{id: 'trans_id', title : 'Transaction id'},{id: "subscriber_id", title: 'Subscriber Id'}, { id: "customer_firstname", title: 'Customer Firstname'}, {id:"customer_lastname", title:'Customer Lastname'}, {id:"customer_phone", title: 'Customer Phone'}, {id:"customer_email", title: 'Customer Email'}, {id: "transaction_ref", title: 'Transaction Reference'}, {id: "amount", title: 'Amount'}, {id: "transaction_status", title: 'Transaction Status'}, {id: "payment_date", title: 'Paymwnt Date'}, {id: "failure_reason_paystack", title: 'Paystack Failure Reason'}, {id: "post_amount_status", title: 'Post amount status'}, {id: "payment_number_alepo", title: 'Alepo payment status'}, {id: "failure_reason_alepo", title: 'Alepo failure reason', id: "bank_name", title: "Bank"}]
            })
                
            csvWriter
                .writeRecords(transactions.rows)
                .then(()=> {
                    res.download(`${filename}`)
                })
            // fs.writeFileSync(`transactions${Date.now()}`,csvData)
        } catch (error) {
            console.log(error)
            logger.error(error)
            req.flash('error', error.toString())
            return res.redirect('/admin/home')
        }
    }),
};
