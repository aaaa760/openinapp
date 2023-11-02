// Import required modules and libraries
const { authenticate } = require("@google-cloud/local-auth");
const path = require("path");

// Define the required OAuth 2.0 scopes for Gmail API
const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.labels",
  "https://mail.google.com/",
];

// Function for Gmail authentication
const gmail_auth = async () => {
  // Authenticate the application using the provided credentials.json file and required scopes
  const auth = await authenticate({
    keyfilePath: path.join(__dirname, "credentials.json"),
    scopes: SCOPES,
  });
  return auth; // Return the authenticated client
};

// Export the gmail_auth function for use in other parts of the application
module.exports = { gmail_auth };

