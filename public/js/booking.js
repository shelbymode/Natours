const stripe = Stripe('pk_test_51JdeniBMWZtA4gWDjE6hHiyPgH8wR64TUpu6j6JjnKAlMR4GZyQwS7hgFauXlXoPAumEbv4f94vmyKgd3vnwcYNg00ziEj5HSy')
import axios from 'axios'
import { showAlert, hideAlert } from './alert'

exports.createBookingSession = async (tourId) => {
  try {
    const session = await axios({
      method: 'GET',
      url: `/api/v1/bookings/create-checkout-session/${tourId}`
    })
    await stripe.redirectToCheckout({ sessionId: session.data.data.id })
    showAlert('alert--lazure', 'Success creating session!')
  } catch (err) {
    console.log(err)
    showAlert(err)
  } finally {
    setTimeout(() => {
      hideAlert()
    }, 2000)
  }

}