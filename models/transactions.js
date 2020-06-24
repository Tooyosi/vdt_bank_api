/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transactions', {
    'trans_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'subscriber_id': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'customer_firstname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'customer_lastname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'customer_phone': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'customer_email': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'transaction_ref': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null",
      unique: true
    },
    'payment_ref': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'amount': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'bank_name': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'channel': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'transaction_status': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'payment_date': {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "null"
    },
    'failure_reason': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'post_amount_status': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'payment_number_alepo': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'failure_reason_alepo': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'total_amount': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    },
    'charge': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      comment: "null"
    }
  }, {
    tableName: 'transactions'
  });
};
