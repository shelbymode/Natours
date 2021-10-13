const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel')
const factory = require('../controllers/handlerFactory');


exports.createCheckoutSession = async (req, res, next) => {
  // 1) Getting tour
  const tour = await Tour.findById(req.params.tourId);

  // 2) Creating checkout session
  let session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/my-tours`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [{
      name: `Tour (${tour.name})`,
      description: tour.description,
      images: [`${req.protocol}://${req.get('host')}/public/assets/tours/${tour.imageCover}`],
      amount: tour.price * 100,
      currency: 'usd',
      quantity: 1
    }]
  });

  // 3) Creating session as response
  res.status(200).json({
    status: 'success',
    data: session
  });
}

const createBookingCheckout = async (checkout) => {
  const tour = checkout.client_reference_id
  const price = checkout.amount_total / 100
  const user = (await User.findOne({ email: checkout.customer_email })).id
  await Booking.create({ tour, price, user })
}

exports.webhookCheckout = (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object)
  }

  res.status(200).json({ created: true })
}


exports.getAllBooking = factory.getAll(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);