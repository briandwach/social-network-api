const router = require('express').Router();
const {
  getThoughts,
  getSingleThought,
  createThought,
  updateThought,
  deleteThought,
  createReaction,
  deleteReaction
} = require('../../controllers/thoughtController');

// /api/thoughts
router.route('/').get(getThoughts).post(createThought);

// /api/thoughts/:thoughtId
router.route('/:thoughtId').get(getSingleThought).post(updateThought).delete(deleteThought);

// /api/thoughts/:thoughtId/reactions
router.route('/:studentId/reactions').post(createReaction);

// /api/thoughts/:thoughtId/reactions/:reactionId
router.route('/:studentId/reactions').delete(deleteReaction);

module.exports = router;