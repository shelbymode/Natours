const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router.route('/set-new-password/:token')
  .get(viewController.getSetNewPassword);

router.route('/verify-email/:token')
  .get(authController.emailConfirmation);

router.route('/my-tours')
  .get(authController.protect, viewController.getMyBookings);

router.route('/overview')
  .get(authController.isLoggedIn, viewController.getOverview);

router.route('/')
  .get(authController.isLoggedIn, viewController.getOverview);

router.route('/login')
  .get(viewController.getLogin);


router.route('/signup')
  .get(viewController.getSignup);

router.route('/me')
  .get(authController.protect, viewController.getAccount);

router.route('/tour/:slug')
  .get(authController.isLoggedIn, viewController.getTour);

router.route('/forget-password')
  .get(viewController.forgetPassword);

router.route('/my-reviews')
  .get(authController.protect, viewController.getMyReviews);

module.exports = router;