const { model, Schema } = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: validator.isEmail

  },
  password: {
    type: String,
    required: true,
    minLength: 8
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password
      }
    }
  },
  photo: { type: String, default: 'default.jpg' },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user'
  },
  passwordChangeAt: Date,
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  emailConfirmed: {
    type: Boolean,
    default: false
  },
  emailConfirmToken: {
    type: String,
  },
  emailConfirmExpires: Date
})

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  this.password = await bcrypt.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
})

// userSchema.pre('/^find/', function(next) {
userSchema.pre(/^find/, function (next) {
  this.find({
    isActive: { $ne: false }
  })
  next()
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}
userSchema.methods.changePasswordAfter = function (JWTIssued) {
  if (this.passwordChangeAt) {
    const passwordChangeAt = this.passwordChangeAt.getTime() / 1000
    // console.log(`PasswordChangeAt: ${passwordChangeAt}`)
    // console.log(`Token was issued: ${JWTIssued}`)
    console.log(passwordChangeAt > JWTIssued)
    return passwordChangeAt > JWTIssued
  }
  // False means NOT changed
  return false
}

userSchema.methods.confirmedTokenAlive = function () {
  return Date.parse(this.emailConfirmExpires) >= Date.now();
}

module.exports = model('User', userSchema)
