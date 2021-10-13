import axios from 'axios'
import { showAlert, hideAlert } from './alert'

export const logout = async (csrfToken) => {
  try {
    const response = await axios({
      method: 'POST',
      url: '/api/v1/users/logout',
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      }
    })
    if (response.data.status === 'success') {
      showAlert('alert--lazure', 'You have successfully logout!')
      setTimeout(() => {
        hideAlert()
        location.reload(true)

      }, 2000)

      setTimeout(() => {
        document.querySelector('.link-logout').style.display = 'block'
      }, 2500)


    }
  } catch (err) {
    console.log(err)

  }
}