import { login } from './login';
import { logout } from './logout';
import { mapbox } from './mapbox';
import { saveDataInit, savePasswordInit } from './settings';
import { sendResetPassword } from './resetPassword';
import { setNewPassword } from './setNewPassword';
import { signup } from './signup';
import { createBookingSession } from './booking';
import Modal from './modal';
import axios from 'axios';
import { hideAlert, showAlert } from './alert';

let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

// Loading mapbox
const map = document.getElementById('map');
if (map) {
  const locations = JSON.parse(map.dataset.locations);
  mapbox(locations);
}

// Login handler
const loginForm = document.querySelector('.form-login');

if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const [email, password] = Array.from(loginForm.querySelectorAll('.form__input-login')).map(el => el.value);
    if (email && password) {
      document.querySelector('.form__button.login').disabled = true;
      document.querySelector('.form__button.login').classList.add('btn--disabled');
      await login(email, password, csrfToken);
    }
  });
}

// Logout handler
const logoutLink = document.querySelector('.link-logout');
if (logoutLink) {
  logoutLink.addEventListener('click', async e => {
    e.preventDefault();
    // console.log('You have logout');
    logoutLink.style.display = 'none';
    await logout(csrfToken);
  });
}

const formUpdateData = document.querySelector('.form-email');
const formUpdatePassword = document.querySelector('.form-password');

// Update email and photo handler
if (formUpdateData) {
  formUpdateData.addEventListener('submit', async e => {
    e.preventDefault();

    const form = new FormData();
    form.append('email', document.getElementById('input-email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await saveDataInit(form, csrfToken);


  });
}

// Update password handler
if (formUpdatePassword) {
  formUpdatePassword.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.save-password').textContent = 'Updating...';
    const email = document.getElementById('input-email').value;
    const currentPassword = document.getElementById('input-cur-pass').value;
    const newPassword = document.getElementById('input-new-pass').value;
    const newPasswordConfirm = document.getElementById('input-new-pass-conf').value;
    document.querySelector('.save-password').disabled = true;
    document.querySelector('.save-password').classList.add('btn--disabled');
    await savePasswordInit(email, currentPassword, newPassword, newPasswordConfirm, csrfToken);

    document.getElementById('input-cur-pass').value = '';
    document.getElementById('input-new-pass').value = '';
    document.getElementById('input-new-pass-conf').value = '';
    document.querySelector('.save-password').textContent = 'SAVE PASSWORD';

  });
}

// Forget handler
const forgetButton = document.querySelector('.restore-password');
if (forgetButton) {
  forgetButton.addEventListener('click', async e => {
    e.preventDefault();
    const dataEmail = new FormData();
    dataEmail.append('email', document.querySelector('.form__input-forget-email').value);
    forgetButton.disabled = true;
    forgetButton.classList.add('btn--disabled');

    await sendResetPassword(dataEmail, csrfToken);
    // admin@natours.com
  });
}

// Restore handler
const restoreForm = document.querySelector('.form-restore');

if (restoreForm) {
  restoreForm.addEventListener('submit', async e => {
    e.preventDefault();

    const resetToken = document.querySelector('.resetToken').value;
    const [password, passwordConfirm] = Array.from(document.querySelectorAll('.form__input-restore')).map(el => el.value);
    document.querySelector('.restore-button').disabled = true;
    document.querySelector('.restore-button').classList.add('btn--disabled');

    await setNewPassword({ password, passwordConfirm }, resetToken, csrfToken);
  });
}

// Signup handler
const signupForm = document.querySelector('.form-signup');
if (signupForm) {
  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.querySelector('.form__input-signup-email').value;
    const password = document.querySelector('.form__input-signup-password').value;
    const passwordConfirm = document.querySelector('.form__input-signup-password-confirm').value;
    document.querySelector('.signup').disabled = true;
    document.querySelector('.signup').classList.add('btn--disabled');
    await signup({ email, password, passwordConfirm }, csrfToken);
  });
}

// Booktour handler
const bookingBtn = document.querySelector('.booktoor__button');
if (bookingBtn) {
  bookingBtn.addEventListener('click', async e => {
    e.target.innerText = 'Processing...';
    const tourId = e.target.dataset.tourId;
    await createBookingSession(tourId);
    e.target.innerText = 'BUY BOOKTOUR';
  });
}

// Modal handler

let modalBtns = document.querySelectorAll('.card__btn-review');
if (modalBtns) {
  for (let modalBtn of modalBtns) {
    modalBtn.addEventListener('click', e => {
      document.documentElement.scrollTop = 0;
      let modal = new Modal(modalBtn);
      modal.createModal();
      modal.openModal();
      if (location.pathname === '/my-reviews') {
        const reviewId = modalBtn.dataset.review;
        modal.setConfig(reviewId);

        // Create listener for button to remove review
        document.querySelector('.btn-remove').addEventListener('click', async e => {
          e.preventDefault();
          const reviewId = modalBtn.dataset.review;
          try {
            const response = await axios({
              method: 'DELETE',
              url: `/api/v1/reviews/${reviewId}`,
              headers: {
                'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
              },
            });
            if (response.status == '204') {
              showAlert('alert--green', 'Your review was been removed!');
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
        });
        // Create listener for button to edit review
        document.querySelector('.btn-edit').addEventListener('click', async e => {
          e.preventDefault();
          const reviewId = modalBtn.dataset.review;
          const review = document.querySelector('.textarea-review').value;
          const rating = document.querySelector('input[name="rating-tour"]:checked').value;

          try {
            const response = await axios({
              method: 'PATCH',
              url: `/api/v1/reviews/${reviewId}`,
              data: {
                review, rating
              },
              headers: {
                'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
              },
            });
            if (response.status == '200') {
              showAlert('alert--green', 'Your review was been edited!');
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
        });
      }

      // Create listener for button to create review
      document.querySelector('.btn-create').addEventListener('click', async e => {
        e.preventDefault();
        const review = document.querySelector('.textarea-review').value;
        const rating = document.querySelector('input[name="rating-tour"]:checked').value;
        const tour = modalBtn.dataset.tour;
        const user = modalBtn.dataset.user;
        try {
          const response = await axios({
            method: 'POST',
            url: '/api/v1/reviews',
            headers: {
              'X-CSRF-Token': csrfToken // <-- is the csrf token as a header
            },
            data: {
              review, rating, tour, user
            }
          });
          if (response.data.status === 'success') {
            showAlert('alert--green', 'Your review was been added!');
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
      });

      // Handler to close modal
      function destroy(e) {
        if ('close' in e.target.dataset) {
          modal.destroyModal();
          document.querySelector('body').removeEventListener('click', destroy);
        }
      }

      document.querySelector('body').addEventListener('click', destroy);
    }
    );
  }
}
