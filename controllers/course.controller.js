const Course = require("../models/Course.model");

const courseFetcher = async ( req, res ) => {
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