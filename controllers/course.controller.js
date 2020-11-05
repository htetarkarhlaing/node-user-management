const { Course } = require("../models/");

const courseFetcher = async (req, res) => {
  try {
    const courseFetching = await Course.find();
    res.status(200).json({
      meta: {
        success: true,
        length: courseFetching.length,
      },
      data: courseFetching,
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
};

const courseSpecifFetcher = async (req, res) => {
  const _id = req.params.id;
  try {
    const courseFetching = await Course.find({_id});
    res.status(200).json({
      meta: {
        success: true,
        length: courseFetching.length,
      },
      data: courseFetching,
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
};

const courseInserter = async (req, res) => {
  const courseAdder = new Course({
    courseName: req.body.courseName,
    instructor: req.body.instructor,
    instructorDetail: req.body.instructorDetail,
    tag: req.body.tag,
    level: req.body.level,
    duration: req.body.duration,
  });
  try {
    const insertCourse = await courseAdder.save();
    res.status(201).json({
      meta: {
        success: true,
        message: "Upload success.",
      },
      data: insertCourse,
      self: req.originalUrl,
    });
  } catch (err) {
    res.status(500).json({
      meta: {
        success: false,
        message: "fail while inserting course =" + err,
      },
      self: req.originalUrl,
    });
  }
};

const lectureInserter = (req, res) => {
  const _id = req.params.id;
  const lectures = req.body.lectures;
  const lecture = lectures.length;
  try {
    lectures.map((data) => {
      return (Course.findByIdAndUpdate(_id, {
        $push: {
          lectures: {
            title: data.title,
            link: data.link,
            duration: data.duration,
          },
        },
      }, (err, course) => {
        if(err){
          res.status(400).json({
            meta: {
              success: false,
              message: "Error occur " + err,
            },
            self: req.originalUrl,
          })
        }
        else {
          return res.status(201).json({
            meta: {
              success: true,
              message: lecture + " added.",
            },
            data: course,
            self: req.originalUrl,
          })
        }
      }))
    })
  } catch (error) {
    return res.status(500).json({
      meta: {
        success: false,
        message: "Error occur while inserting lectures " + error,
      },
      self: req.originalUrl,
    });
  }
};

module.exports = { courseFetcher, courseInserter, lectureInserter, courseSpecifFetcher };
