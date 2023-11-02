const { google } = require("googleapis");

// Function to create and return a Gmail client using the provided authentication
const login = (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  return gmail;
};

// Function to get a list of labels for the authenticated user
const getLabelsList = async (gmail) => {
  const response = await gmail.users.labels.list({
    userId: "me",
  });
  return response;
};

// Function to get unreplied messages in the user's Gmail inbox
const getUnrepliedMessages = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "-in:chats -from:me -has:userlabels",
  });
  return res.data.messages || [];
};

// Function to send a reply to a message
const sendReply = async (auth, message) => {
  const gmail = google.gmail({ version: "v1", auth });

  // Fetch message details
  const res = await gmail.users.messages.get({
    userId: "me",
    id: message.id,
    format: "metadata",
    metadataHeaders: ["Subject", "From"],
  });
  const subject = res.data.payload.headers.find(
    (header) => header.name === "Subject"
  ).value;
  const from = res.data.payload.headers.find(
    (header) => header.name === "From"
  ).value;
  const replyTo = from.match(/<(.*)>/)[1];

  // Create a reply message
  const replySubject = subject.startsWith("Re:") ? subject : `Re: ${subject}`;
  const replyBody = "Hi, I am on vacation. Can we catch up next week";

  // Encode the reply message
  const rawMessage = `From: me\r\nTo: ${replyTo}\r\nSubject: ${replySubject}\r\nIn-Reply-To: ${message.id}\r\nReferences: ${message.id}\r\n\r\n${replyBody}`;

  const encodedMessage = Buffer.from(rawMessage)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  // Send the reply
  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedMessage,
    },
  });
};

// Function to create a label in Gmail
const createlabel = async (auth, LABEL_NAME) => {
  const gmail = google.gmail({ version: "v1", auth });

  try {
    // Try to create the label
    const res = await gmail.users.labels.create({
      userId: "me",
      requestBody: {
        name: LABEL_NAME,
        labelListVisibility: "labelshow",
        messageListVisibility: "show",
      },
    });
    return res.data.id;
  } catch (err) {
    if (err.code === 409) {
      // Label already exists, get its ID
      const res = await gmail.users.labels.list({
        userId: "me",
      });
      const label = res.data.labels.find((label) => label.name === LABEL_NAME);
      return label.id;
    } else {
      // Handle other errors
      return err;
    }
  }
};

// Function to add a label to a message
const addLabel = async (auth, message, labelID) => {
  const gmail = google.gmail({ version: "v1", auth });
  await gmail.users.messages.modify({
    userId: "me",
    id: message.id,
    requestBody: {
      addLabelIds: [labelID],
      removeLabelIds: ["INBOX"],
    },
  });
};

module.exports = {
  login,
  getLabelsList,
  getUnrepliedMessages,
  sendReply,
  createlabel,
  addLabel,
};
