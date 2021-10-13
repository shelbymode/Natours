import axios from 'axios';
import { hideAlert, showAlert } from './alert';

export const sendResetPassword = async (data, csrfToken) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forget-password',
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      },
      data: {
        email: data.get('email')
      }
    });

    if (res.data.status === 'success') {
      showAlert('alert--green', 'Email was sent successfully!');

    }
  } catch (err) {
    showAlert('alert--red', err.response.data.message);

  } finally {
    setTimeout(() => {
      document.querySelector('.restore-password').classList.remove('btn--disabled');
      document.querySelector('.restore-password').disabled = false;
      hideAlert();
    }, 2000);

  }
};