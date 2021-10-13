const User = require('../models/userModel')
const catchAsync = require('../utils/catchAsync')
const factory = require('./handlerFactory')


exports.deleteUser = factory.deleteOne(User)
exports.getUser = factory.getOne(User)
exports.getAllUsers = factory.getAll(User)