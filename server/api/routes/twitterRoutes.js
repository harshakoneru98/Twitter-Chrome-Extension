// Importing express package
const express = require('express');

// Router-level middleware works in the same way as application-level middleware,
// except it is bound to an instance of express.Router().
const router = express.Router();

// Authentication Controller
const TwitterController = require('../controllers/twitterController');

router.post('/language-detection', TwitterController.language_detection);
router.post('/sentiment-score', TwitterController.sentiment_score);

module.exports = router;
