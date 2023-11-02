const express = require("express");
const app = express();
const port = 8000;
const path = require("path");
const fs = require("fs").promises;
const { google } = require("googleapis");
const { gmail_auth } = require("./login.js");
const {
  login,
  getLabelsList,
  getUnrepliedMessages,
  sendReply,
  createlabel,
  addLabel,
} = require("./gmail.js");

// Serve the CSS file
app.use("/styles.css", express.static(path.join(__dirname, "styles.css")));

// Route for Gmail authentication
app.get("/authenticate", async (req, res) => {
  const credentials = await fs.readFile("credentials.json");

  // Authenticate with Gmail API
  const auth = await gmail_auth();
  const gmail = login(auth);

  // Get a list of Gmail labels
  const response = await getLabelsList(gmail);
  const LABEL_NAME = "vacation";

  async function main() {
    // Create or get the "vacation" label
    const labelId = await createlabel(auth, LABEL_NAME);
    console.log(`created a label id with id ${labelId}`);

    // Periodically check for unreplied messages and apply labels
    setInterval(async () => {
      const messages = await getUnrepliedMessages(auth);
      console.log(`found ${messages.length} unreplied messages`);

      for (const message of messages) {
        await sendReply(auth, message);
        console.log(`send reply to message with id${message.id}`);

        await addLabel(auth, message, labelId);
        console.log(`added label to message with id ${message.id}`);
      }
    }, Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000);
  }
  main().catch(console.error);

  const labels = response.data.labels;
  res.send("You have successfully subscribed for our service");
});

// Root route
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <link rel="stylesheet" type="text/css" href="/styles.css">
      </head>
      <body>
        <div class="container">
          <h1>Welcome to Your Gmail Auto-Reply App</h1>
          <p>An app for auto-replying to your Gmail when you are on vacation.</p>
          <form action="/authenticate" method="get">
            <button type="submit">Authenticate with Gmail</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Route for redirection
app.get("/redirect", (req, res) => {
  res.send("Done!!!!!!!");
});

// Start the Express server
app.listen(port, () => {
  console.log(`Example is running in ${port}`);
});
