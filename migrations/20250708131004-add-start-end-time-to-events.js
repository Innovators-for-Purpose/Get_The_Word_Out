'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('events', 'startTime', {
      type: Sequelize.STRING,
      allowNull: true, // or false if required
    });
    
    await queryInterface.addColumn('events', 'endTime', {
      type: Sequelize.STRING,
      allowNull: true,
    });    
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('events', 'startTime');
    await queryInterface.removeColumn('events', 'endTime');
  }
};
