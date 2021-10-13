export const showAlert = (alertStyle, alertMessage) => {
  const alert = `<div class="alert ${alertStyle}">${alertMessage}</div>`
  document.querySelector('body').insertAdjacentHTML('afterbegin', alert)


}

export const hideAlert = () => {
  const alert = document.querySelector('.alert')
  if (alert) {
    alert.parentElement.removeChild(alert)
  }
}

// admin@natours.io