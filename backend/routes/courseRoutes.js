const express = require('express');
const router = express.Router();
const { joinCourse } = require('../controllers/courseController');

router.post('/join', joinCourse);

module.exports = router;










