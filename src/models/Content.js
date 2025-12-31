const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Content extends Model {}

  Content.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    page: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    },
    section: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 100]
      }
    }
  }, {
    sequelize,
    modelName: 'Content',
    tableName: 'contents',
    indexes: [
      {
        unique: true,
        fields: ['page'],
        where: {
          page: { [sequelize.Sequelize.Op.ne]: null }
        }
      },
      {
        unique: true,
        fields: ['section'],
        where: {
          section: { [sequelize.Sequelize.Op.ne]: null }
        }
      }
    ]
  });

  return Content;
};