const { User, Thought } = require('../models');

module.exports = {
    // Get all users
    async getUsers(req, res) {
        try {
            const users = await User.find().select('-__v');

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

            res.json(user);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // create a new user
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);
            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Delete a student and remove them from the course
    async deleteUser(req, res) {
        try {
            const user = await User.findOneAndDelete({ _id: req.params.userId });

            if (!user) {
                return res.status(404).json({ message: 'No such user exists' });
            }

            const thoughts = await Thought.deleteMany({ username: user.username });

            if (thoughts.ok !== 1) {
                return res.status(500).json({ message: 'Error deleting associated thoughts' });
             }

            res.json({ message: `User successfully deleted including ${thoughts.deletedCount} associated thoughts` });
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

            res.json(user);
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

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // Remove friend from user's friend list
    async removeFriend(req, res) {

        console.log(req.params.userId);
        console.log(req.params.friendId);

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

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};