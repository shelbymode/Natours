import axios from 'axios'
import { showAlert, hideAlert } from './alert.js'


export const login = async (email, password, csrfToken) => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      },
      data: {
        email,
        password
      }
    })
    if (response.data.status === 'success') {
      // console.log('You have login!')
      showAlert('alert--green', 'Success! You will redirect!')
      setTimeout(() => {
        hideAlert()
        location.assign('/overview')
      }, 2000)

    }

  } catch (err) {
    showAlert('alert--red', err.response.data.message)
    setTimeout(() => {
      hideAlert()
    }, 2000)
  } finally {
    setTimeout(() => {
      document.querySelector('.form__button.login').disabled = false
      document.querySelector('.form__button.login').classList.remove('btn--disabled');
    }, 2000)
  }
}
