let { setLicenseKey } = require("../../utils/db.js");
const mailgun = require("mailgun-js");
const { v4: uuidv4 } = require("uuid");
const { genHash, genSalt } = "../../utils/hash.js";

exports.handler = async function (req, context) {
  const event = JSON.parse(req.body);

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const licenseKey = uuidv4();
    const salt = await genSalt();
    const hash = await genHash(salt, licenseKey);
    const email = paymentIntent.receipt_email || `kaitmore@gmail.com`;

    const mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN
    });
    const data = {
      from: "Excited User <me@samples.mailgun.org>",
      to: email,
      subject: "Hello",
      text: `Your License key is: ${licenseKey}`
    };
    mg.messages().send(data, function (error, body) {
      console.log(body);
    });

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
