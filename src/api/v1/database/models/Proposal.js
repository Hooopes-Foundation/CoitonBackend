"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Proposal extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Proposal.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      initiator: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      implemented: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      index: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          // Custom getter for parsing JSON when retrieved from the database
          const jsonString = this.getDataValue("index");
          return jsonString ? JSON.parse(jsonString) : null;
        },
        set(value) {
          // Custom setter for stringifying JSON when stored in the database
          this.setDataValue("index", value ? JSON.stringify(value) : null);
        },
      },
    },
    {
      sequelize,
      tableName: "proposals",
      modelName: "Proposal",
    }
  );

  return Proposal;
};
