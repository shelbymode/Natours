const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewController = require('../controllers/reviewController')
const reviewRouter = require('./reviewRoutes')
const router = express.Router()



router.route('/')
  .get(tourController.getAllTours)
  .post(authController.protect, authController.protectByRoles('guide', 'admin'), tourController.createTour)

router.route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,
    authController.protectByRoles('guide', 'admin'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour)
  .delete(authController.protect, authController.protectByRoles('user', 'admin'), tourController.deleteTour)

router.route('/tour-within/distance/:distance/center/:coordinates')
  .get(tourController.tourWithin)

router.route('/get-distance-to-tour/center/:coordinates')
  .get(tourController.getDistance)

router.use('/:tourId/reviews', reviewRouter)
module.exports = router
