const mongoose = require('mongoose')
const Tour = require('./tourModel')
const User = require('./userModel')

const bookingModel = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean,
    default: true
  },
  createAt: {
    type: Date,
    default: Date.now()
  }
})

// bookingModel.pre(/^find/, function(next) {
//   this.populate('user')/*.populate({*/
//   //   path: 'tour',
//   //   select: 'name guides'
//   // });
//   next()
// })
const Booking = mongoose.model('Booking', bookingModel)

module.exports = Booking