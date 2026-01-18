const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Visitor extends Model {}

  Visitor.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    page: {
      type: DataTypes.STRING,
      allowNull: false
    },
    referer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Visitor',
    tableName: 'visitors',
    indexes: [
      { fields: ['ip'] },
      { fields: ['page'] },
      { fields: ['createdAt'] },
      { fields: ['sessionId'] },
      { fields: ['email'] }
    ]
  });

  return Visitor;
};