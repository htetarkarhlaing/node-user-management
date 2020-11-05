const { Role } = require("../models");

// Get method for Roles
const roleFetcher = async (req, res) => {
  try {
    const roleFetch = await Role.find();
    res.status(200).json({
      meta: {
        success: true,
        length: roleFetch.length,
      },
      data: roleFetch,
      self: req.originalUrl,
    });
  } catch (err) {
    res.status(500).json({
      meta: {
        success: false,
      },
      self: req.originalUrl,
    });
  }
}

// Post method for Roles
const roleInserter = async (req, res) => {
  const roleAdder = new Role({
    role: req.body.role,
  });
  try {
      const insertRole = await roleAdder.save();
      res.status(201).json({
          meta: {
              success: true
          },
          data: insertRole,
          self: req.originalUrl
      })
  } catch (err) {
    res.status(500).json({
      meta: {
        success: false,
      },
      self: req.originalUrl,
    });
  }
}

module.exports = { roleFetcher, roleInserter };