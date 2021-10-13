const express = require('express');
const path = require('path');
const AdminBro = require('admin-bro');
const options = require('./src/panel-admin/admin.options');
const buildAdminRouter = require('./src/panel-admin/admin.router');
const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/controllers/errorController');
const tourRouter = require('./src/routes/tourRoutes');
const userRouter = require('./src/routes/userRoutes');
const reviewRouter = require('./src/routes/reviewRoutes');
const viewRouter = require('./src/routes/viewRouter');
const bookingRouter = require('./src/routes/bookingRoutes');
const authController = require('./src/controllers/authController');
const admin = new AdminBro(options);
const router = buildAdminRouter(admin);
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const csrf = require('csurf');
const { urlencoded } = require('express');
const bookingController = require('./src/controllers/bookingController')

const helmet = require('helmet')


const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views'));

// Before urlencoder 
app.post('/webhook-checkout', express.raw({ type: "*/*" }), bookingController.webhookCheckout)

app.use(express.json());
app.use(cookieParser());
// app.use(csrf(({ cookie: true })));
app.use(urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use(cors());
app.use(helmet())
app.use(compression());

// app.use(authController.csrf);


app.use(admin.options.rootPath, authController.protect, authController.protectByRoles('admin', 'lead-guide'), router);
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);


app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;





