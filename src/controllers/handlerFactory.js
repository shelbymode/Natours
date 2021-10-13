const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndDelete(req.params.id);

  if (!doc) {
    return next(new AppError('No doc found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.createOne = Model => catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  const newDoc = await Model.create(req.body);
  res.json({
    status: 'success',
    data: newDoc
  });
});
exports.updateOne = Model => catchAsync(async (req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!doc) {
    return next(new AppError('No doc found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      doc
    }
  });
});
exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
  let docQuery = Model.findById(req.params.id);
  if (popOptions) docQuery = docQuery.populate(popOptions);

  const data = await docQuery;
  if (!data) return next(new AppError('No tour found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data
  });
});
exports.getAll = (Model, popOptions) => catchAsync(async (req, res) => {
  let filter = {};
  if (!popOptions) {
    popOptions = '';
  }
  if (req.query?.fields?.split(',').includes('-reviews')) {
    popOptions = '';
    req.query.fields = req.query.fields.split(',').filter(el => el !== '-reviews').join(',');
  }
  if (req.params.tourId) filter = { tour: req.params.tourId };
  if (req.params.userId) filter = { user: req.params.userId };

  const features = new APIFeatures(Model.find(filter).populate(popOptions), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query;

  res.json({
    status: 'success',
    length: docs.length,
    docs
  });
});
