/*
Five Peas Flight Search
auth.js

Copyright (c) 2020 Derek Chu, Kevin Hsieh, Leo Liu, Quentin Truong.
All Rights Reserved.
*/

/**
 * Function to run when Google Sign-in library loads.
 */
function gapi_init() {
  gapi.load("auth2", () => {
    gapi.auth2.init({
      client_id: "773049605239-i20d5b73br9717fipmm8896s5cqpa4s0",
      scope: "profile email"
    });
    gapi.signin2.render("sign-in", {
      "theme": "dark",
      "onsuccess": signup
    });
  });
}

/**
 * Registers a Google User with the backend.
 * 
 * @param {GoogleUser} user Information about the signed-in user.
 */
function signup(user) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/sign-up");
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.onload = auth;
  xhr.send("idtoken=" + user.getAuthResponse().id_token);
}

/**
 * Checks if the user is authenticated and updates the UI accordingly.
 */
function auth() {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/auth");
  xhr.onload = _ => {
    let body = JSON.parse(xhr.responseText)[0];
    if (xhr.readyState === xhr.DONE && xhr.status === 200 &&
        body.authenticated) {
      qs("#sign-in").classList.add("hide");
      qs("#saved-itineraries").classList.remove("hide");
      qs("#sign-out").classList.remove("hide");
      qs("#save").classList.remove("disabled");
      qs("#greeting").classList.remove("hide");
      qs("#greeting").innerHTML = body.name;
    }
  }
  xhr.send();
}

/**
 * Signs the user out.
 */
function signout() {
  // Google sign-out.
  gapi.auth2.getAuthInstance().signOut();
  // Erase cookies.
  for (const cookie of document.cookie.split(";")) {
    document.cookie = cookie.split("=")[0]
                    + " =; expires = Thu, 01 Jan 1970 00:00:00 UTC";
  }
  // Firebase sign-out.
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/sign-out");
  xhr.onload = _ => location.reload();
  xhr.send();
}
