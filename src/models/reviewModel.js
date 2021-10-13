const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);


reviewSchema.index({ rating: 1 });
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// Because Admin Bro doesn't understand populate
// reviewSchema.pre(/^find/, function(next) {
//   this.populate({
//     path: 'user',
//     select: 'name photo',
//   })
//   next()
// })


reviewSchema.statics.getAverageInfo = async function(tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId
      }
    },
    {
      $group: {
        _id: '$tour',
        avgRating: { $avg: '$rating' },
        amountReviews: { $sum: 1 }
      }
    }
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].amountReviews
  });
};

reviewSchema.post('save', async function() {
  this.constructor.getAverageInfo(this.tour);
});

reviewSchema.pre(/findOneAnd/, async function() {
  this.temp = await this.findOne();
});
reviewSchema.pre('delete', async function() {
  this.temp = await this.findOne();
});
reviewSchema.post(/findOneAnd/, async function() {
  this.temp.constructor.getAverageInfo(this.temp.tour);
});

reviewSchema.post('delete', async function() {
  this.temp.constructor.getAverageInfo(this.temp.tour);
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
