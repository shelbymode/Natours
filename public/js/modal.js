const Review = require('../../src/models/reviewModel');
import axios from 'axios';

const stableElement = document.querySelector('.container');

module.exports = class Modal {
  constructor(modalBtn) {
    this.modalBtn = modalBtn;
  }

  createModal() {
    // create modal
    const html = `
    <div class='modal-header'>
      <h2>${this.modalBtn.dataset.title}</h2>
      <span data-close class='close-modal' data-close='true'>&times;</span>
    </div>
    <hr>
    <div class='modal-body'>
      <label for='review'>Tell us your review:)</label>
      
      <ul class='slider'>
        <li class='slider-item'>
          <label>Terrible (1)</label>
          <input type='radio' name='rating-tour' value='1'>
        </li>
        <li class='slider-item'>
          <label>Bad (2)</label>
          <input type='radio' name='rating-tour' value='2'>
        </li>
        <li class='slider-item'>
          <label>Unclear (3)</label>
          <input type='radio' checked name='rating-tour' value='3'>
        </li>
           <li class='slider-item'>
          <label>Good(4)</label>
          <input type='radio' name='rating-tour' value='4'>
        </li>
           <li class='slider-item'>
          <label>Excellent (5)</label>
          <input type='radio' name='rating-tour' value='5'>
        </li>
      </ul>

      
      <textarea class='textarea-review' placeholder='Describe your expression about tour...' id='review' name='story' rows='7'></textarea>
    </div>
    <div class='modal-footer' style='display:flex; justify-content:space-evenly; align-items: center'>
      <button type='button' class='btn-create'>Create review</button>
      <button type='button' class='btn-remove'>Remove review</button>
      <button type='button' class='btn-edit'>Save review</button>
    </div>
  `;

    // Create modal overlay
    this.modalOverlay = document.createElement('div');
    this.modalOverlay.classList.add('modal-overlay');
    this.modalOverlay.classList.add('hide');
    this.modalOverlay.setAttribute('data-close', '');
    // insert modalOverlay before container
    stableElement.insertAdjacentElement('beforebegin', this.modalOverlay);

    // Create modal body
    this.modalContent = document.createElement('div');
    this.modalContent.classList.add('modal-content');
    this.modalContent.classList.add('hide');
    this.modalContent.innerHTML = html;
    // insert modalContent before container
    stableElement.insertAdjacentElement('beforebegin', this.modalContent);
    document.querySelector('.btn-create').classList.remove('hide');
    document.querySelector('.btn-remove').classList.add('hide');
    document.querySelector('.btn-edit').classList.add('hide');

  }

  openModal() {
    this.modalOverlay.classList.remove('hide');
    this.modalContent.classList.remove('hide');
  }

  hideModal() {
    this.modalOverlay.classList.add('hide');
    this.modalContent.classList.add('hide');
  }

  destroyModal() {
    this.modalOverlay.parentNode.removeChild(this.modalOverlay);
    this.modalContent.parentNode.removeChild(this.modalContent);
  }

  async setConfig(reviewId) {
    const response = await axios({
      method: 'GET',
      url: `api/v1/reviews/${reviewId}`
    });
    document.querySelectorAll('input[name=\'rating-tour\']')[response.data.data.rating - 1].checked = true
    document.querySelector('.textarea-review').value = response.data.data.review;
    document.querySelector('.btn-create').classList.add('hide');
    document.querySelector('.btn-remove').classList.remove('hide');
    document.querySelector('.btn-edit').classList.remove('hide');
  }
};


