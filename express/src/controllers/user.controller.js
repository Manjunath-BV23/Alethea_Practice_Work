const express = require('express');
const router = express.Router();
const User = require('../models/user.model.js');

// GET /users

router.get('/', async (req, res, next) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

//  GET /users/:id

router.get('/:id', async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        // Handle invalid ObjectId error
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        next(error);
    }
});

// POST /users

router.post('/', async (req, res, next) => {
    try {
        const { name, email, age } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const newUser = new User({
            name,
            email,
            age,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages });
        }
        next(error);
    }
});

//   PUT /users/:id

router.put('/:id', async (req, res, next) => {
    try {
        const { name, email, age } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, age },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        // Handle invalid ObjectId error and validation errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages });
        }
        next(error);
    }
});

//   DELETE /users/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        // Handle invalid ObjectId error
        if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        next(error);
    }
});

module.exports = router;
