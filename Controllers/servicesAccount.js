const admin = require('firebase-admin');
require('dotenv').config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: `-----BEGIN PRIVATE KEY-----
  MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDIztlqmnHgyYBr
  uIRvaxDOXsTCJvZoLHOHRdDtpvlziZi/LChJw1q2KAqanHEAs8NJk6zTXVubVGdM
  oe5ROCPwMqi7yzu+szIyz1/XRaJu84TtLtk57qVdkZvEDPg8aCei67vjYthnSFdS
  o4tUQv2hYEWSbohCyl++Lam7dsxfGIDqR4cQun5mgJXHrIZsGGtJMx6wu0O6gXQQ
  X4g+ekPYsiuli8ghQGNKZXxg1oTYfjcI0uvoT+87vCo2V/WBA8yYdgLjy4XpgHyz
  4y4XDjCJt8t+rYmj7hpwv0NgllMxRNkkP/dsA+xuq+n2n8XmFrTd6quA0SjERIIP
  mc8AOxQvAgMBAAECggEATsf0PWIFXmK/isNz1cCD8er1N5SQpHMYChCmdK5G/ICV
  mB7rWXEWlBNmgZzxqoxcB/AzZCMizvBQrJx1ApFLbC97yl1j/Z+RCKUaHTtZDD1m
  v6TbHWLWprx7B3HtK8nTDxR7/KwpaW/UrnuyLGcx2U+LS/UoaUe7Q0Hn7r+fU4j4
  E5HYINTbVXHUtwKKYGKW5ZhrOqxWOxTVwTKqSnkLvh1IDHBBTU78VgGBWZ7/4M/M
  3flfSTt3jLLjwZAZLjm6p6L4CFcX7fnfRj0RVWUZOKPowy7yoDBqtNHWQ2uPPYph
  3odtuQrdekW6zPrRG1nd0wZZrVnNCj1pADEOKOIroQKBgQDli2s+MQ+qpyJOkm14
  VXjGBFev0Z0d57nOtyUw2KLQzvyFpvujsxZZKozydoIFtdRmjWHH6Rwz7avnlWFF
  z+hjWGVw3yfiM07DXzZxyfg7kf5XuSoYiQzbThO+uF7QAwaD8NJOtPLUYKUM5Vp4
  UmVugDM9UqJR75Y8+qYzi6D4oQKBgQDf85LVJV+z42ZST6x0ZgSl2X8hwapWjpJA
  BkesZrWem0fBY0vY7G5vac9vUKBC+rNbJT/9+LFhrwHDjDhtcnX5D2uctqSF4D46
  G9gGujI7ivtTh/HLCC5Omcfg+37zHfplBdqXkfAHHLnIlacn7eFDm/Lf3P3nRhUT
  HlH6SwPKzwKBgQCjA6X/nrvvh443momfoaOJjN/w/r3D1SMBiNMio1bNT5HKINIo
  aTB/1lYOgtbH01+qDNHaNNRQlIM2jcFs4L+6fbZcuD4MyD8xRFbX7IUbWQz1o4wf
  rISy4fnnweujceKYpNfWCW9CH/hW9jKPrIRYOzcoX5zi73EUkTSi+pAwwQKBgD27
  NWE9kRjT+PN9dMsNCADzaADVEnATkqrFUGJsWWnj4a6kAVdFLNfXMc+8SMDNvDzG
  ktIeCD8l73WIpFE++NfzcTVcfxNMEbsQy8Zm8svI7qhC09qkYadW6mrQyFiZjdjk
  +TFIkAJV37wzzETMZIivZw5gKzjh75M6i1xT6zKvAoGBAJ+bRoCAvb5caxkJHQcA
  KMzz5MHnltbrhAweLGlIVLljyelFZQr5lQfJBgeAkPjqOr3AH9KQt6W+fvEHQWeF
  sTz7uDldWIFWUq2asWvoR6m4RiV9HAKq5OzFQrnHZXMw7uh9SbJrDLfGxbjlDhBR
  /x0Bq2lI/3Xp2sGdn9dXZXyE
  -----END PRIVATE KEY-----`,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
};

// Initialize the Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`, // Correctly reference the storage bucket
});

// Export the admin instance for use in other modules
module.exports = admin;
