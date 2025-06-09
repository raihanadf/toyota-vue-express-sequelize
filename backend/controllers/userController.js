const db = require('../models');
const User = db.User;
const { Op } = require('sequelize');

// Create
exports.create = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).send({
        message: "Name and email are required"
      });
    }

    const user = await User.create({ name, email });
    return res.status(201).json(user);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Email already exists"
      });
    }
    return res.status(500).json({
      message: error.message || "Some error occurred while creating the User."
    });
  }
};

// List with pagination and search
exports.findAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offset = (pageNum - 1) * limitNum;
    
    const whereCondition = search ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ]
    } : {};
    
    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      limit: limitNum,
      offset: offset,
      order: [['id', 'ASC']]
    });
    
    const totalPages = Math.ceil(count / limitNum);
    
    return res.status(200).json({
      users: rows,
      pagination: {
        currentPage: pageNum,
        totalPages: totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while retrieving users."
    });
  }
};

// Find User with an id
exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({
        message: `User with id=${id} not found`
      });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      message: error.message || `Error retrieving User with id=${id}`
    });
  }
};

// Update a User by the id
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).send({
        message: "Name and email are required"
      });
    }

    const [num] = await User.update({ name, email }, {
      where: { id }
    });
    
    if (num === 1) {
      const updatedUser = await User.findByPk(id);
      return res.status(200).json(updatedUser);
    } else {
      return res.status(404).json({
        message: `Cannot update User with id=${id}. Maybe User was not found or req.body is empty!`
      });
    }
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "Email already exists"
      });
    }
    return res.status(500).json({
      message: error.message || `Error updating User with id=${id}`
    });
  }
};

// Delete a User
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const num = await User.destroy({
      where: { id }
    });
    
    if (num === 1) {
      return res.status(200).json({
        message: "User was deleted successfully!"
      });
    } else {
      return res.status(404).json({
        message: `Cannot delete User with id=${id}. Maybe User was not found!`
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || `Could not delete User with id=${id}`
    });
  }
};
