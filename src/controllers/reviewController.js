const catchAsync = require('../utils/catchAsync')
const Review = require('../models/reviewModel')
const factory = require('./handlerFactory')


exports.createReview = factory.createOne(Review)
exports.deleteReview = factory.deleteOne(Review)
exports.updateReview = factory.updateOne(Review)
exports.getReview = factory.getOne(Review)
exports.getAllReviews = factory.getAll(Review)
