"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable("proposals", {
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
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });

    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("proposals");

    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
