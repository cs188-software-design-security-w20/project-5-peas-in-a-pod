/*
Five Peas Flight Search
flight-search.js

Copyright (c) 2020 Derek Chu, Kevin Hsieh, Leo Liu, Quentin Truong.
All Rights Reserved.
*/
"use strict";

/**
 * Function to run when main page loads.
 */
addEventListener("load", () => {
  // Initialize the ItineraryTable.
  itable = new ItineraryTable(
      qs("#itinerary-name"),
      qs("#filters"),
      qs("#itinerary"),
      qs("#remove-flight"),
      _ => new FlightTable(qs("#tabs"),
                           qs("#columns"),
                           qs("#tables"),
                           qs("#book")),
      i => ftables[i].remove()
  );

  // If no itinerary is specified in the URL, then load a default one.
  if (!itable.loadFromURL()) {
    let date1 = new Date();
    date1.setDate(date1.getDate() + 14);
    let date2 = new Date();
    date2.setDate(date2.getDate() + 21);
    itable.loadFromItinerary(new Itinerary([
      {
        "max_stopovers": 2,
        "date_from": date1.toISOString().substring(0, 10)
      },
      {
        "max_stopovers": 2,
        "date_from": date2.toISOString().substring(0, 10)
      },
    ]));
  }

  // Initialize Materialize selects.
  M.FormSelect.init(qsa("select"), {});
});

/**
 * Function to run when search button is pressed.
 */
async function search() {
  // Update UI.
  qs("#add-flight").classList.add("disabled");
  qs("#remove-flight").classList.add("disabled");
  qs("#search").classList.add("disabled");
  qs("#spinner").classList.remove("hide");
  qsa(".results-message").forEach(el => el.classList.add("hide"));
  qsa(".no-results-message").forEach(el => el.classList.add("hide"));
  ftables.forEach(ft => ft.clearSelection());

  // Execute fetches.
  let [res, single] = await kiwiSearch(itable.get());

  if (res) {
    // Display message.
    qsa(".results-message").forEach(e => e.classList.remove("hide"));

    // Display results.
    console.log("Response:");
    console.log(res);
    FlightTable.displayResults(res, single);
  }
  else {
    FlightTable.displayResults([], true);
    qsa(".no-results-message").forEach(e => e.classList.remove("hide"));
  }

  // Update UI.
  qs("#add-flight").classList.remove("disabled");
  qs("#remove-flight").classList.remove("disabled");
  qs("#search").classList.remove("disabled");
  qs("#spinner").classList.add("hide");
}

/**
 * Function to run when share button is pressed.
 */
function share() {
  shareItinerary(qs("#itinerary-name").value, table.get(), qs("#share"),
                 qs("#share-link"));
}

/**
 * Function to collapse a shrinkable section.
 *
 * @param {Element} element Expanded element.
 * @param {function} func A function which changes the element's height.
 */
function collapseSection(element, func) {
  // Get the height of the element's inner content, regardless of its actual
  // size.
  const sectionHeight = element.scrollHeight;

  // Temporarily disable all CSS transitions.
  const elementTransition = element.style.transition;
  element.style.transition = "";

  // On the next frame (as soon as the previous style change has taken effect),
  // explicitly set the element's height to its current pixel height, so we
  // aren't transitioning out of "auto".
  requestAnimationFrame(() => {
    element.style.height = sectionHeight + "px";
    element.style.transition = elementTransition;

    // On the next frame (as soon as the previous style change has taken
    // effect), have the element transition to the smaller height.
    requestAnimationFrame(() => {
      func();
      element.style.height =
        element.querySelector("thead").scrollHeight +
        element.querySelector("tbody").scrollHeight + "px";
    });
  });

  // Mark the section as "currently collapsed".
  element.setAttribute("data-collapsed", "true");
}

/**
 * Function to expand a shrinkable element.
 *
 * @param {Element} element Collapsed element.
 */
function expandSection(element) {
  // Get the height of the element's inner content, regardless of its actual
  // size.
  const sectionHeight = element.scrollHeight;

  // Have the element transition to the height of its inner content.
  element.style.height = sectionHeight + "px";

  // When the next CSS transition finishes (which should be the one we just
  // triggered):
  element.addEventListener("transitionend", function func(e) {
    // Remove this event listener so it only gets triggered once.
    element.removeEventListener("transitionend", func);
    // Remove "height" from the element's inline styles, so it can return to
    // its initial value.
    element.style.height = null;
  });

  // Mark the section as "currently expanded".
  element.setAttribute("data-collapsed", "false")
}
