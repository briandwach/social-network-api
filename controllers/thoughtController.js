const { format } = require("date-fns");

const { Thought, User, Reaction } = require('../models');

// Uses native JavaScript date object and date-fns to get, format, and return current date/time
const timeOfQuery = () => { return format(Date.now(), "PPpp") };


module.exports = {
    // Get all thoughts
    async getThoughts(req, res) {
        try {
            const thoughts = await Thought.find().select('-__v');

            if (thoughts.length === 0) {
                thoughts.push('message: No thoughts in the database');
            }

            // Add message to the beginning of the returned array to confirm the requested query and time of query
            thoughts.unshift('query: Find all Thoughts', `timeOfQuery: ${timeOfQuery()}`);

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

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const thoughtObject = { query: `Find Thought by ID`, timeOfQuery: timeOfQuery(), ...thought.toObject() };

            res.json(thoughtObject);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // create a new thought
    async createThought(req, res) {
        try {
            const thought = await Thought.create(
                {
                    thoughtText: req.body.thoughtText,
                    username: req.body.username
                }
            );

            await User.findOneAndUpdate(
                { _id: req.body.userId },
                { $addToSet: { thoughts: thought._id } },
                { new: true }
            );

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const thoughtObject = { query: `Create Thought`, timeOfQuery: timeOfQuery(), ...thought.toObject() };

            res.json(thoughtObject);
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

            await User.findOneAndUpdate(
                { _id: req.body.userId },
                { $pull: { thoughts: thought._id } },
                { new: true }
            );

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const thoughtObject = {
                query: `Delete Thought`,
                timeOfQuery: timeOfQuery(),
                message: 'Thought successfully deleted',
                ...thought.toObject()
            };

            res.json(thoughtObject);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    // Update a thought's information 
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

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const thoughtObject = {
                query: `Update Thought`,
                timeOfQuery: timeOfQuery(),
                message: 'Thought successfully updated',
                ...thought.toObject()
            };

            res.json(thoughtObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Create a reaction
    async createReaction(req, res) {
        try {
            const reaction = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $addToSet: { reactions: { reactionBody: req.body.reactionBody, username: req.body.username } } },
                { new: true }
            );

            if (!reaction) {
                return res
                    .status(404)
                    .json({ message: 'Cannot create reaction. No thought found with that ID' });
            }

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const reactionObject = { 
                query: `Create Reaction`, 
                timeOfQuery: timeOfQuery(),
                message: 'Reaction successfully created', 
                ...reaction.toObject() 
            };

            res.json(reactionObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Remove reaction from thought
    async deleteReaction(req, res) {
        try {
            const reaction = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $pull: { reactions: { reactionId: req.params.reactionId } } },
                { runValidators: true, new: true }
            );

            if (!reaction) {
                return res
                    .status(404)
                    .json({ message: 'Cannnot remove reaction. No thought found with that ID' });
            }

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const reactionObject = { 
                query: `Delete Reaction`, 
                timeOfQuery: timeOfQuery(),
                message: 'Reaction successfully deleted', 
                ...reaction.toObject() 
            };

            res.json(reactionObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};