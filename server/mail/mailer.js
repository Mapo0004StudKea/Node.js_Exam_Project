import nodemailer from 'nodemailer';

let transporter;
let testAccount;

export async function setupMailer() {
  testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendSignUpEmail(toEmail, username) {
  const info = await transporter.sendMail({
    from: `"My App" <no-reply@myapp.com>`,
    to: toEmail,
    subject: `Sign Up Notification`,
    text: `Hi ${username}, You have just signed up!`,
    html: `<p><b>Hi ${username}</b>, you just signed up!</p>`,
  });
  
  console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}

export async function sendLoginEmail(toEmail, username) {
  const info = await transporter.sendMail({
    from: `"My App" <no-reply@myapp.com>`,
    to: toEmail,
    subject: `Login Notification`,
    text: `Hi ${username}, you just logged in!`,
    html: `<p><b>Hi ${username}</b>, you just logged in!</p>`,
  });

  // console.log("Message sent:", info.messageId);
  console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
}
