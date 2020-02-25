"use strict";

const fire = require("firebase");
const firebase = require("firebase").initializeApp({
  apiKey: "AIzaSyC26YKW4qgCCQhJSN_7ZzXsm_n5d_wx2j0",
  authDomain: "five-peas-flight-search.firebase.com",
  databaseURL: "https://five-peas-flight-search.firebaseio.com",
  projectId: "five-peas-flight-search",
  storageBucket: "five-peas-flight-search.appspot.com",
  messagingSenderId: "773049605239",
  appId: "1:773049605239:web:7ebbf6c1727bf904983a72",
  measurementId: "G-V2T9DGETMT"
});
require("firebase/firestore");
let firestore = firebase.firestore();
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://five-peas-flight-search.firebaseio.com"
});
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const CLIENT_ID = 
  "773049605239-i20d5b73br9717fipmm8896s5cqpa4s0.apps.googleusercontent.com";

const authMap = {};

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.text());

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8080, () => {
    const port = server.address().port;
    console.log(`App listening on port ${port}`);
  });

  /**
   * Listener that deletes itinerary for user
   */
  app.post("/api/delete-itinerary", (req, res) => {
    let token = getAuthToken(req);
    let authenticated = isUserAuthenticated(token);
    let response = res.type("application/json");

    if (!authenticated) {
      response.sendStatus(401);
    }
    else {
      let status = true;
      response = res.status(200);

      let docIds;
      if (typeof req.body === "string") {
        docIds = JSON.parse(req.body);
      }
      else if (typeof req.body.docId === "string") {
        docIds = [req.body.docId];
      }

      if (typeof docIds === "undefined") {
        response.status(400);
        status = false;
        response.send({deleted: status});
      }
      else {
        let promiseArray = [];
        docIds.forEach(id => {
          promiseArray.push(firestore.collection("itineraries")
            .doc(id)
            .delete()
            .then(() => console.log(`${id} was successfully deleted.`))
            .catch(error => {
              console.error(error);
              response.status(400);
              status = false;
          }).then(() => {})); // resolves if error, so Promise.all still fires
        });
        Promise.all(promiseArray).then(() => {
          response.send({deleted: status});
        });
      }
    }
  });

  /**
   * Listener that redirects user to 404 page when trying to access
   * an unknown page
   */
  app.use(function(req, res) {
    res.sendStatus(404);
  });
}

/**
 * Checks that user's token is registered in our authMap and also checks to
 * see if token has expired
 */
function isUserAuthenticated(token) {
  let expireTime = new Date();
  expireTime.setTime(Date.parse(authMap[token]));

  return (typeof authMap[token] !== "undefined") && ((new Date()) < expireTime);
}

/**
 * Returns Auth token if there is one, otherwise returns nothing
 */
function getAuthToken(req) {
  if (typeof req.headers.cookie === "undefined") {
    return;
  }

  let cookies = req.headers.cookie.split(";");
  let authTokenString = "AuthToken";
  if (cookies.length > 1) {
    authTokenString = " " + authTokenString;
  }
  let find = cookies.find(cookie => {
    return cookie.startsWith(authTokenString);
  });

  if (typeof find !== "undefined") {
    return find.substring((authTokenString + "=").length);
  }
  else {
    return;
  }
}

/**
 * Gets the uid from the auth token specified
 * 
 * @param {string} idToken Auth token for user
 */
async function getUid(idToken) {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  return decodedToken.uid;
}

module.exports = app;
