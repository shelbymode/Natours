const express = require('express')
const router = express.Router()
const bookingController = require('../controllers/bookingController')
const authController = require('../controllers/authController')

router.route('/create-checkout-session/:tourId').get(authController.protect, bookingController.createCheckoutSession)

router.route('/:id')
  .get(bookingController.getOneBooking)
  .delete(bookingController.deleteOneBooking)
  .patch(bookingController.updateBooking)

router.route('/user/:userId')
  .get(bookingController.getAllBooking)

module.exports = router