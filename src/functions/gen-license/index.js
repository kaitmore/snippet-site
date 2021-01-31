let { setLicenseKey } = require("../../utils/db.js");
const mailgun = require("mailgun-js");
const { v4: uuidv4 } = require("uuid");
const { genHash, genSalt } = require("../../utils/hash.js");

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

exports.handler = async function (req, context) {
  const event = JSON.parse(req.body);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const licenseKey = uuidv4();
    const salt = await genSalt();
    const hash = await genHash(salt, licenseKey);
    const email = paymentIntent.receipt_email || `kaitmore@gmail.com`;
    console.log("paymentIntent", paymentIntent);
    try {
      await setLicenseKey(email, hash);
    } catch (e) {
      console.error(e);
      return {
        statusCode: 500,
        body: JSON.stringify(e)
      };
    }
  } else {
    return {
      statusCode: 404,
      body: `Unhandled event type ${event.type}`
    };
  }

  return {
    statusCode: 200
  };
};

function sendEmail(email) {
  const data = {
    from: "CopyPasta <kaitmore@gmail.com>",
    to: email,
    subject: "Your CopyPasta license key",
    text: ```
    Thanks for ordering CopyPasta! If you have any trouble or want a refund at any time, please don't hesitate to contact me personally at kaitmore@gmail.com.

    License name: Kaitlin Moreno
    License number: ${licenseKey}

    Thanks!
    Kait
    ```
  };
  mg.messages().send(data, function (error, body) {
    if (error) console.error(error);
    else console.log(body);
  });
}
