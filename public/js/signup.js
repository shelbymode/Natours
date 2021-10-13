import axios from 'axios'
import { showAlert, hideAlert } from './alert'

exports.signup = async (data, csrfToken) => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      },
      data
    })

    if (response.data.status === 'success') {
      showAlert('alert--green', 'Success! Your account was created! Verify its via email.')
      setTimeout(() => {
        location.assign('/login')
      }, 2000)
    }
  } catch (err) {
    showAlert('alert--red', err.response.data.message)

  } finally {
    setTimeout(() => {
      hideAlert()
      document.querySelector('.signup').disabled = false;
      document.querySelector('.signup').classList.remove('btn--disabled');
    }, 2000)
  }
}
