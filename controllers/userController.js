const { format } = require("date-fns");

const { User, Thought } = require('../models');

// Uses native JavaScript date object and date-fns to get, format, and return current date/time
const timeOfQuery = () => { return format(Date.now(), "PPpp") };


module.exports = {
    // Get all users
    async getUsers(req, res) {
        try {
            const users = await User.find().select('-__v');

            if (users.length === 0) {
                users.push('message: No users in the database');
            }

            // Add message to the beginning of the returned array to confirm the requested query and time of query
            users.unshift('query: Find all Users', `timeOfQuery: ${timeOfQuery()}`);

            res.json(users);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    // Get a single user
    async getSingleUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.userId })
                .select('-__v')
                .populate('thoughts')
                .populate('friends');

            if (!user) {
                return res.status(404).json({ message: 'No user with that ID' })
            }

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const userObject = { query: `Find User by ID`, timeOfQuery: timeOfQuery(), ...user.toObject() };

            res.json(userObject);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },

    // create a new user
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);

            // Convert the Mongoose document to a plain JavaScript object and add an action property for feedback
            const userObject = { query: `Create User`, timeOfQuery: timeOfQuery(), ...user.toObject() };

            res.json(userObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Delete a user and delete their associated thoughts
    async deleteUser(req, res) {
        try {
            const user = await User.findOneAndDelete({ _id: req.params.userId });

            if (!user) {
                return res.status(404).json({ message: 'No such user exists' });
            }

            let deletedThoughtsNum = 0;

            if (user.thoughts.length > 0) {
                const thoughts = await Thought.deleteMany({ username: user.username });

                if (thoughts.acknowledged !== true) {
                    return res.status(500).json({ message: 'Error deleting associated thoughts' });
                } else {
                    deletedThoughtsNum = thoughts.deletedCount;
                }
            };

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const userObject = {
                query: `Delete User`,
                timeOfQuery: timeOfQuery(),
                message: `User successfully deleted including ${deletedThoughtsNum} associated thoughts`,
                ...user.toObject()
            };

            res.json(userObject);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },

    // Update a user's information 
    async updateUser(req, res) {
        try {
            const user = await User
                .findOneAndUpdate(
                    // Finds document matching 
                    { _id: req.params.userId },
                    // Replaces username and/or email if included in request body
                    { username: req.body.username, email: req.body.email },
                    // Sets to true so updated document is returned; Otherwise original document will be returned
                    { runValidators: true, new: true }
                );

            if (!user) {
                return res.status(404).json({ message: 'Cannot update.  No user with that ID' })
            }

            // Convert the Mongoose document to a plain JavaScript object and add a query property for feedback
            const userObject = {
                query: `Update User`,
                timeOfQuery: timeOfQuery(),
                message: `User information updated`,
                ...user.toObject()
            };

            res.json(userObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // Add a friend to user's friend list
    async addFriend(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.params.friendId } },
                { new: true }
            );

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Cannot add friend. No user found with that ID' });
            }

            // Convert the Mongoose document to a plain JavaScript object and add a query  property for feedback
            const userObject = {
                query: `Add Friend`,
                timeOfQuery: timeOfQuery(),
                message: `Friend successfully added`,
                ...user.toObject()
            };

            res.json(userObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Remove friend from user's friend list
    async removeFriend(req, res) {
        try {
            const user = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: req.params.friendId } },
                { runValidators: true, new: true }
            );

            if (!user) {
                return res
                    .status(404)
                    .json({ message: 'Cannnot remove friend. No user found with that ID' });
            }

            const userObject = {
                query: `Delete Friend`,
                timeOfQuery: timeOfQuery(),
                message: `Friend successfully deleted`,
                ...user.toObject()
            };

            res.json(userObject);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};