const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('./../Models/UserModel');

const signInToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN });
}

exports.signup = async (req, res) => {
    try {

        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        const token = signInToken(newUser._id);

        res.status(201).json({
            status: 'success',
            token,
            data: newUser
        });

    }
    catch (err) {
        res.status(500).json({
            status: 'fail',
            message: err.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.correctPassword(password))) {
        return res.status(401).json({
            status: 'fail',
            message: 'Incorrect email or password'
        });
    }

    const token = signInToken(user._id);

    res.status(200).json({
        status: 'success',
        user,
        token
    });
};

exports.protect = async (req, res, next) => {
    //Check if the token is present in header and get the token
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        console.log(token);
    }

    if (!token) {
        // return res.redirect('/api/users/login');
        return res.status(401).json({
            status: 'fail',
            message: 'Please log in to get access'
        });
    }

    //Decode the token to get the user id
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

    //Find user based on decoded id
    const user = await User.findById(decoded.id);

    if (!user) {
        return res.status(401).json({
            status: 'fail',
            message: 'User associated with this token no longer exists'
        });
    }

    //If authorization is successful
    req.user = user;
    next();
};