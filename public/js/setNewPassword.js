import axios from 'axios';
import { showAlert, hideAlert } from './alert';

exports.setNewPassword = async (data, resetToken, csrfToken) => {
  try {
    const url = `/api/v1/users/reset-password/${resetToken}`;
    const response = await axios({
      method: 'PATCH',
      url,
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      },
      data
    });
    if (response.data.status === 'success') {
      showAlert('alert--green', 'Success! Your password was changed!');
      setTimeout(() => {
        hideAlert();
        location.assign('/login');
      }, 2000);
    }
  } catch (err) {
    showAlert('alert--red', err.response.data.message);
    setTimeout(() => {
      hideAlert();
    }, 2000);
  } finally {
    setTimeout(() => {
      hideAlert();
      document.querySelector('.restore-button').disabled = false;
      document.querySelector('.restore-button').classList.remove('btn--disabled');
    }, 2000);
  }
};