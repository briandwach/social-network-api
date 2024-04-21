const { Thought, User, Reaction } = require('../models');

module.exports = {
    // Get all thoughts
    async getThoughts(req, res) {
        try {
            const thoughts = await Thought.find().select('-__v');

            res.json(thoughts);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // Get a single thought
    async getSingleThought(req, res) {
        try {
            const thought = await Thought.findOne({ _id: req.params.thoughtId })
                .select('-__v');

            if (!thought) {
                return res.status(404).json({ message: 'No thought with that ID' })
            }

            res.json(thought);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // create a new thought
    async createThought(req, res) {
        try {
            const thought = await Thought.create(
                {thoughtText: req.body.thoughtText,
                username: req.body.username}
            );

            const user = await User.findOneAndUpdate(
                { _id: req.body.userId },
                { $addToSet: { thoughts: thought._id } },
                { new: true }
            );

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Delete a thought
    async deleteThought(req, res) {
        try {
            const thought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

            if (!thought) {
                return res.status(404).json({ message: 'No thought matches that ID' });
            }

            const user = await User.findOneAndUpdate(
                { _id: req.body.userId },
                { $pull: { thoughts: thought._id } },
                { new: true }
            );

            res.json({ message: `Thought successfully deleted` });
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    // Update a user's information 
    async updateThought(req, res) {
        try {
            const thought = await Thought
                .findOneAndUpdate(
                    // Finds document matching thought ID 
                    { _id: req.params.thoughtId },
                    // Replaces thought text provided in body
                    { thoughtText: req.body.thoughtText },
                    // Sets to true so updated document is returned; Otherwise original document will be returned
                    { runValidators: true, new: true }
                );

            if (!thought) {
                return res.status(404).json({ message: 'Cannot update.  No thought with that ID' })
            }

            res.json(thought);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Create a reaction
    async createReaction(req, res) {
        try {
            const reaction = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $addToSet: { reactions: {reactionBody: req.body.reactionBody, username: req.body.username}} },
                { new: true }
            );

            if (!reaction) {
                return res
                    .status(404)
                    .json({ message: 'Cannot create reaction. No thought found with that ID' });
            }

            res.json(reaction);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Remove reaction from thought
    async deleteReaction(req, res) {
        try {
            const reaction = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $pull: { reactions: { reactionId: req.params.reactionId } }},
                { runValidators: true, new: true }
            );

            if (!reaction) {
                return res
                    .status(404)
                    .json({ message: 'Cannnot remove reaction. No thought found with that ID' });
            }

            res.json(reaction);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};