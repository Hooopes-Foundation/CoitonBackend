"use strict";
const { Model } = require("sequelize");
const { HashPassword } = require("../../helpers");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    toJSON() {
      return {
        ...this.get(),
        accessToken: undefined,
        password: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "user name cant be null" },
          notEmpty: { msg: "user name can't be empty" },
        },
      },

      firstname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,

        validate: {
          notNull: { msg: "email cant be null" },
          notEmpty: { msg: "email can't be empty" },
          isEmail: { msg: "invalid email" },
        },
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: "password cant be null" },
          notEmpty: { msg: "password can't be empty" },
        },
      },
    },
    {
      sequelize,
      tableName: "users",
      modelName: "User",
    }
  );

  User.beforeCreate(async (user) => {
    const hashedPassword = await HashPassword(user?.password);
    user.password = hashedPassword;
  });

  return User;
};
