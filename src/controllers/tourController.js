const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');
const sharp = require('sharp');
const multer = require('multer');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // 415 - Unsupport media type
    cb((new AppError('Not an image! Please upload only image!', 415)), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);
exports.resizeTourImages = async (req, res, next) => {
  // imageCover and images not found!
  if (!req.files.imageCover && !req.files.images) return next();

  if (req.files.imageCover) {
    // imageCover handler
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/assets/tours/${req.body.imageCover}`);
  }
  if (req.files.images) {
    // images handler
    req.body.images = [];

    await Promise.all(req.files.images.map(async file => {
      const filename = `${file.originalname}-${req.params.id}-${Date.now()}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/assets/tours/${filename}`);

      req.body.images.push(filename);
    }));

  }


  next();
};

exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.getTour = factory.getOne(Tour, { path: 'guides', select: 'role email photo' });
exports.getAllTours = factory.getAll(Tour, { path: 'reviews' });

exports.tourWithin = catchAsync(async (req, res, next) => {
  const { distance, coordinates } = req.params;
  if (!distance || !coordinates) {
    // 400 - Bad request?
    return next(new AppError('You must specify distance and your coordinates!', 400));
  }
  const [latitude, longitude] = coordinates.split(','); // x, y
  const radius = distance / 6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] }
    }
  });
  res.json({
    amount: tours.length,
    data: tours
  });
});

exports.getDistance = catchAsync(async (req, res, next) => {
  const { coordinates } = req.params;
  if (!coordinates) {
    // 400 - Bad request?
    return next(new AppError('You must specify distance and your coordinates!', 400));
  }
  const [latitude, longitude] = coordinates.split(','); // x, y
  const tours = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [longitude * 1, latitude * 1] },
        distanceField: 'expectedDistance',
        distanceMultiplier: 0.001
      }
    },
    {
      $project: {
        name: 1,
        expectedDistance: 1,
        _id: 0
      }
    }
  ]);

  res.json({
    amount: tours.length,
    data: tours
  });
});


