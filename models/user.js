/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
    'user_id': {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      primaryKey: true,
      comment: "null",
      autoIncrement: true
    },
    'email': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null",
      unique: true
    },
    'firstname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'lastname': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'password': {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "null"
    },
    'last_login': {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "null"
    },
    'reset_password_token': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    },
    'reset_password_expiry': {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "null"
    }
  }, {
    tableName: 'user'
  });
};
