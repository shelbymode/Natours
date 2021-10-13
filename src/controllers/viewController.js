const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const axios = require('axios');
const AppError = require('../utils/appError');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  let bookingTours = []
  // If user login
  if (res.locals.user) {
    bookingTours = await Booking.find({ user: res.locals.user.id })
      .populate({ path: 'tour', select: 'name slug' });
    bookingTours = bookingTours.map(el => el.tour.slug);
  }

  let tours = await Tour.find({});
  res.render('main', {
    title: 'All tours overview',
    tours,
    bookingTours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const slug = req.params.slug;
  const name = slug.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  const tour = await Tour.findOne({ name })
    .populate({ path: 'guides', select: 'role email photo' })
    .populate({
      path: 'reviews',
      populate: [{
        path: 'user',
        select: 'photo email'
      }],
      select: 'review rating user'
    });

  let bookingTours = []
  // If user login
  if (res.locals.user) {
    bookingTours = await Booking.find({ user: res.locals.user.id }).populate({ path: 'tour', select: 'name slug' });
    bookingTours = bookingTours.map(el => el.tour.slug);
  }
  if (!tour) {
    return next(new AppError('There is no tour with that name.', 404));
  }

  res.render('details', {
    title: 'Tour details',
    tour: tour,
    bookingTours
  });
})
  ;

exports.getLogin = catchAsync(async (req, res, next) => {
  res.render('login', {
    title: 'Login'
  });
});

exports.getSignup = catchAsync(async (req, res, next) => {
  res.render('signup', {
    title: 'Sign Up'
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  res.render('account', {
    title: 'My account'
  });
});

exports.getSetNewPassword = async (req, res, next) => {
  res.render('restorePassword', {
    title: 'Restore password',
    resetToken: req.params.token
  });
};

exports.forgetPassword = async (req, res, next) => {
  res.render('forgetPassword', {
    title: 'Forget password'
  });
};

exports.getMyBookings = async (req, res, next) => {
  let existsReview = await Review.find({ user: req.user.id }).populate({ path: 'tour', select: 'name slug' })
  existsReview = existsReview.map(el => el.tour.slug)

  const bookings = await Booking.find({ user: req.user.id });
  const toursId = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: toursId } });
  return res.render('main', {
    title: 'My bookings',
    tours,
    bookingTours: [],
    existsReview,
    addReview: true
  });
};
exports.getPanelAdmin = async (req, res, next) => {
  res.render('panelAdmin', {
    title: 'Panel admin'
  });
};

exports.getMyReviews = async (req, res, next) => {
  const myReviews = await Review.find({ user: res.locals.user._id }).populate({ path: 'tour', select: 'name' });
  res.render('myReviews', {
    title: 'My reviews',
    reviews: myReviews
  });
};