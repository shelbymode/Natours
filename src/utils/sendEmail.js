const nodemailer = require('nodemailer')
const pug = require('pug')

module.exports = class Email {
  constructor(user, url) {
    this.from = 'some-test-email@gmail.com'
    this.to = user.email
    this.url = url
  }

  createTransport() {
    // if (process.env.NODE_ENV === 'production') {
    //   //  Sendgrid doesn't work
    // }
    return nodemailer.createTransport({
      host: 'smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: '7dda6f47c91976',
        pass: '65fe350dc41c6c'
      }
    })
  }

  async send(subject) {
    const html = pug.renderFile(`${__dirname}/../views/mailTemplate.pug`, {
      subject,
      url: this.url
    })
    const mailConfig = {
      from: this.from,
      to: this.to,
      subject: subject[0],
      // html: htmlToText.fromString(html)
      html
    }
    await this.createTransport().sendMail(mailConfig)
  }
}
