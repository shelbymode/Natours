const AdminBro = require('admin-bro');
const AdminBroMongoose = require('@admin-bro/mongoose');

const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');

AdminBro.registerAdapter(AdminBroMongoose);

const options = {
  rootPath: '/panel-admin',
  resources: [
    { resource: Tour },
    { resource: Booking },
    { resource: Review },
    {
      resource: User, options: {
        listProperties: ['role', 'isActive', 'email', 'photo'],
        editProperties: ['role', 'isActive', 'email', 'photo'],
        showProperties: ['role', 'isActive', 'email', 'photo']
      }
    }
  ],
  branding: {
    logo: 'https://michaeljamie.github.io/advanced-css-sass-less-course/Natours/img/Natours-Logo-green.png',
    companyName: 'Natours',
  }
};

module.exports = options;