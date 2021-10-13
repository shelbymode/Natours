import axios from 'axios';
import { showAlert, hideAlert } from './alert';

export const saveDataInit = async (data, csrfToken) => {
  try {

    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/update-data',
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      },
      data
    });

    if (res.data.status === 'success') {
      showAlert('alert--green', 'Data updated successfully!');
      setTimeout(() => {
        hideAlert();
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert('alert--red', err.response.data.message);
    setTimeout(() => {
      hideAlert();
    }, 2000);
  }
};

export const savePasswordInit = async (email, currentPassword, newPassword, newPasswordConfirm, csrfToken) => {
  try {

    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/update-password',
      data: {
        email, currentPassword, newPassword, newPasswordConfirm
      },
      headers: {
        'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
      }
    });
    if (res.data.status === 'success') {
      showAlert('alert--green', 'Password was updated!');

    }
  } catch (err) {
    showAlert('alert--red', err.response.data.message);

  } finally {
    setTimeout(() => {
      document.querySelector('.save-password').disabled = false;
      document.querySelector('.save-password').classList.remove('btn--disabled');
      hideAlert();
    }, 2000);

  }


};