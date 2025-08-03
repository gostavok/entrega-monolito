import { DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface: any) => {
    await queryInterface.createTable('products', {
      id: {
        type: DataTypes.STRING(255),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      purchasePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      salesPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    })
  },

  down: async (queryInterface: any) => {
    await queryInterface.dropTable('products')
  }
} 
