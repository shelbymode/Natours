const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const crypto = require('crypto');
const Email = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');


// Without reading directly
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/assets/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   }
// })
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // 415 Unsupported Media Type
    cb((new AppError('Not an image! Please upload only image!', 415)), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/assets/users/${req.file.filename}`);

  next();
});

function verifyToken(clientToken) {
  return jwt.verify(clientToken, process.env.JWT_SECRET_KEY);
}

function getToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_TIME_EXPIRES });
}

function createSendToken(user, statusCode, res) {
  const token = getToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // 24h
    httpOnly: true
  };

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: user
  });
}

exports.signUp = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;
  let emailConfirmToken = crypto.randomBytes(32).toString('hex');

  const url = `${req.protocol}://${req.get('host')}/verify-email/${emailConfirmToken}`;

  emailConfirmToken = crypto.createHash('sha256').update(emailConfirmToken).digest('hex');
  const emailConfirmExpires = Date.now() + 5 * 60 * 1000;
  const newUser = await User.create({ email, password, passwordConfirm, emailConfirmToken, emailConfirmExpires });

  // Creating letter to email (verify email)
  await new Email(newUser, url).send(['verify email!', 'Do you want verify email?']);
  res.status(200).json({
    status: 'success',
    data: {
      newUser
    }
  });
});

exports.emailConfirmation = catchAsync(async (req, res, next) => {
  const emailConfirmToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ emailConfirmToken, emailConfirmExpires: { $gt: new Date(Date.now()) } });
  if (!user || !(user.emailConfirmToken === emailConfirmToken)) {
    return next(new AppError('Your token is not correct or time is up! Repeat restore password!', 500));
  }
  user.emailConfirmed = true;
  // user.emailConfirmToken = '0';
  user.emailConfirmToken = undefined;
  user.emailConfirmExpires = undefined;
  await user.save({ validateBeforeSave: false });
  return res.redirect('/login');
});

exports.logIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Bad request 400?
    return next(new AppError('Fields email and password must be filled!', 400));
  }
  const candidateUser = await User.findOne({ email });


  if (!candidateUser || !(await candidateUser.correctPassword(password, candidateUser.password))) {
    // 401 - Unautorized
    return next(new AppError('Email or password is incorrect', 401));
  }
  // if it's new account
  if (typeof (candidateUser.emailConfirmed)) {
    if (!candidateUser.emailConfirmed && !(await candidateUser.confirmedTokenAlive())) {
      await User.findByIdAndDelete(candidateUser._id);
      // console.log('Account has deleted!');
      return next(new AppError('Your token has died! Repeat process of registration', 500));
    }
    if (!candidateUser.emailConfirmed && (await candidateUser.confirmedTokenAlive())) {
      return next(new AppError('You must verify your account! Check email specified during registration ', 500));
    }
  }
  candidateUser.passwordChangeAt = undefined;
  candidateUser.save({ validateBeforeSave: false });
  createSendToken(candidateUser, 200, res);
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is not user with entered email!', 500));
  }
  if (!(await user.emailConfirmed)) {
    return next(new AppError('You must activate first your account via email!', 500));
  }
  let passwordResetToken = crypto.randomBytes(32).toString('hex');
  // Reset token is valid for 5 minutes
  const passwordResetExpires = Date.now() + 5 * 60 * 1000;

  user.passwordResetToken = crypto.createHash('sha256').update(passwordResetToken).digest('hex');
  user.passwordResetExpires = passwordResetExpires;

  await user.save({ validateBeforeSave: false });
  try {
    const url = `${req.protocol}://${req.get('host')}/set-new-password/${passwordResetToken}`;
    await new Email(user, url).send(['password recovery...((', 'Do you forget your password?']);
  } catch (e) {
    console.log(e);
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Your email to restore wasn\'t sended!', 500));
  }
  res.status(200).json({
    status: 'success'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  if (!passwordResetToken) {
    return next(new AppError('You have already restore password!', 500));
  }
  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError('Your password and password confirmed must be same!', 500));
  }

  const user = await User.findOne({ passwordResetToken, passwordResetExpires: { $gt: new Date(Date.now()) } });
  if (!user || !(user.passwordResetToken === passwordResetToken)) {
    return next(new AppError('Your token is not correct or time is up! Repeat restore password!', 500));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // user.passwordResetToken = '0';
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangeAt = new Date(Date.now());
  await user.save({ validateBeforeSave: false });
  res.json({
    status: 'success',
    message: 'password was changed!',
    'new password': user.password
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  const clientToken = req.cookies.jwt;
  if (clientToken) {
    try {
      // Based on payload and secret key generate new token
      const reliableToken = await verifyToken(clientToken);
      if (!reliableToken) {
        // 423 Locked
        return next(new AppError('You dont have JWT token! Pls re-login!', 423));
      }

      // Check if user exists
      const user = await User.findById(reliableToken.id);
      if (!user) {
        return next(new AppError('Something strange occurred with user', 500));
      }
      // Check if user changed password after token was issued
      if (await user.changePasswordAfter(reliableToken.iat)) {
        // 423 Locked
        return next(new AppError('Change password after token issue, pls re-login', 423));
      }
      // GRANT ACCESS TO PROTECTED ROUTE
      req.user = user;
      res.locals.user = user;
      return next()

    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        // 423 Locked
        return next(new AppError('Your token has expired. Re-login!', 423));
      }
    }

  } else {
    return res.redirect('/login')
  }
});


exports.logout = async (req, res) => {
  await res.clearCookie('jwt');
  res.json({
    status: 'success',
    message: 'You have exit from system! Your JWT was deleted'
  });
};

exports.protectByRoles = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // 412 - Precondition failed
      return next(new AppError(`You dont have permission to this API! You are only ${req.user.role}`, 412));
    }
    next();
  }
  );
};

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { email, currentPassword, newPassword, newPasswordConfirm } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    // 401 Unautorized
    return next(new AppError('Email or password is incorrect!', 401));
  }
  if (newPassword !== newPasswordConfirm) {
    return next(new AppError('New password and new password confirm must be same!'), 500);
  }
  user.password = newPassword;
  user.passwordChangeAt = new Date(Date.now() - 1000);
  await user.save({ validateBeforeSave: false });
  createSendToken(user, 200, res);

});

exports.deactivateAccount = catchAsync(async (req, res, next) => {
  const { email, currentPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await user.correctPassword(currentPassword, user.password))) {
    // 401 Unautorized
    return next(new AppError('Email or password is incorrect!', 401));
  }
  user.isActive = false;
  await user.save({ validateBeforeSave: false });
  await res.clearCookie('jwt');
  res.json({
    status: 'success',
    message: 'Your account was deleted (deactivated) and JWT token was deleted',
    user,
    jwt: req.headers.cookie
  });
});
exports.csrf = async (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  // console.log(res.locals.csrfToken);
  next();
};

exports.updateData = catchAsync(async (req, res, next) => {
  const data = {};
  if (req.file && req.file.filename) {
    data.photo = req.file.filename;
  }
  data.email = req.body.email;
  const newEmail = await User.findByIdAndUpdate(req.user.id, {
    ...data
  }, {
    new: true,
    runValidators: true
  });
  if (!newEmail) {
    return res.json({
      status: 'failure',
      data: 'User with this id not found!'
    });
  }
  res.json({
    status: 'success',
    data: newEmail
  });
});


exports.isLoggedIn = async (req, res, next) => {
  const clientToken = req.cookies.jwt;
  if (clientToken) {
    try {
      // Based on payload and secret key generate new token
      let reliableToken = jwt.verify(clientToken, process.env.JWT_SECRET_KEY);
      // Check if user exists
      const user = await User.findById(reliableToken.id);

      // Check if user changed password after token was issued
      if (await user.changePasswordAfter(reliableToken.iat)) {
        user = undefined
      }
      req.user = user;
      res.locals.user = user;

      return next();

    } catch (err) {
      console.log('SOMETHING ERRORROROOR!', err);
      return next();
    }

  } else {
    req.user = undefined
    res.locals.user = undefined;
    return next();
  }
};









// exports.protect = async (req, res, next) => {
//   const clientToken = req.cookies.jwt;
//   if (clientToken) {
//     // console.log('Client token exists')
//     try {
//       // Based on payload and secret key generate new token
//       let reliableToken = jwt.verify(clientToken, process.env.JWT_SECRET_KEY);

//       // Check if user exists
//       const user = await User.findById(reliableToken.id);
//       if (!user) {
//         return next(new AppError('Something strange occurred with user', 500));
//       }

//       // Check if user changed password after token was issued
//       if (await user.changePasswordAfter(reliableToken.iat)) {
//         // 423 Locked
//         return next(new AppError('Change password after token issue, pls re-login', 423));
//         // return next()
//       }
//       req.user = user;
//       res.locals.user = user;

//       return next();

//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         // 423 Locked
//         return next(new AppError('Your JWT has expired. Please, re-login!', 423));
//       }
//       console.log('Something error', err);
//       return next(new AppError(err, 500));
//     }


//   } else {
//     return res.redirect('/login');

//   }

// };