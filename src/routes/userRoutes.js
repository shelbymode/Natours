const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/login', authController.logIn);
router.post('/logout', authController.logout);
router.post('/signup', authController.signUp);
router.post('/forget-password', authController.forgetPassword);
router.patch('/reset-password/:token', authController.resetPassword);


router.use(authController.protect);

router.get('/', userController.getAllUsers);
router.patch('/update-data',
  authController.uploadUserPhoto,
  authController.resizeUserPhoto,
  authController.updateData);
router.patch('/update-password', authController.updatePassword);
router.route('/:id')
  .delete(authController.protectByRoles('guide', 'admin'), userController.deleteUser)
  .get(userController.getUser);


router.use(authController.protectByRoles('guide', 'admin'));

router.post('/deactivate-account', authController.deactivateAccount);

module.exports = router;
