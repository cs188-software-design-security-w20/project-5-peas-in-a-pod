/*
Five Peas Flight Search
itinerary.js

Copyright (c) 2020 Derek Chu, Kevin Hsieh, Leo Liu, Quentin Truong.
All Rights Reserved.
*/

"use strict";

class Itinerary {
  /**
   * Constructs an Itinerary from a matrix representation.
   * 
   * @param {!Array<Object<string, *>>|string} raw Matrix representation of 
   *     itinerary with rows indexed by flight index and columns indexed by
   *     field name. The representation may be in base64-encoded form.
   */
  constructor(raw) {
    if (typeof raw === "string") {
      raw = Itinerary._decoded(raw);
    }
    this._raw = filterEntries(raw, ([k, v]) =>
        k in Itinerary.DEFAULTS && v !== Itinerary.DEFAULTS[k]);
  }

  /**
   * Retrieves a value from the itinerary.
   * 
   * @param {number} index Flight index.
   * @param {string} field Field name.
   * @return {any} Field value.
   */
  get(index, field) {
    return field in this._raw[index]
         ? this._raw[index][field]
         : Itinerary.DEFAULTS[field];
  }

  /**
   * Returns the Itinerary's matrix representation.
   * 
   * @return {!Array<Object<string, *>>} Matrix representation as Object.
   */
  raw() {
    return this._raw;
  }

  /**
   * Encodes the Itinerary's matrix representation in base64 with minified keys.
   * 
   * @return {string} Matrix representation in base64.
   */
  encoded() {
    const keys = createKeys(Itinerary.FIELDS.length);
    let minified = mapEntries(this._raw, ([k, v]) =>
        [keys[Itinerary.FIELDS.indexOf(k)], v]);
    return btoa(JSON.stringify(minified));
  }

  /**
   * Decodes a base64-encoded matrix representation into Object form.
   *
   * @param {string} str Matrix representation in base64.
   * @return {Array<Object<string, *>>} Matrix representation in Object form.
   */
  static _decoded(str) {
    const keys = createKeys(Itinerary.FIELDS.length);
    let minified = JSON.parse(atob(str));
    return mapEntries(minified, ([k, v]) =>
        [Itinerary.FIELDS[keys.indexOf(k)], v]);
  }
}

// -----------------------------------------------------------------------------
// STATIC FIELDS
// -----------------------------------------------------------------------------

/**
 * Dictionary mapping supported field names to their default values on Kiwi.
 * Non-default values should be explicitly specified in requests to Kiwi.
 */
Itinerary.DEFAULTS = {
  "fly_from": "",
  "fly_to": "",
  "date_from": "",
  "date_to": "",
  "select_airlines": "",
  "select_airlines_exclude": false,
  "adult_hold_bag": 0,
  "adult_hand_bag": 0,
  "selected_cabins": "M",
  "mix_with_cabins": "",
  "price_from": "",
  "price_to": "",
  "select_stop_airport": "",
  "select_stop_airport_exclude": false,
  "max_stopovers": "",
  "stopover_from": "",
  "stopover_to": "",
  "conn_on_diff_airport": true,
  "fly_days": "0,1,2,3,4,5,6",
  "dtime_from": "",
  "dtime_to": "",
  "atime_from": "",
  "atime_to": "",
  "max_fly_duration": "",
};

/**
 * List of supported fields.
 */
Itinerary.FIELDS = Object.keys(Itinerary.DEFAULTS);

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/**
 * Generates an array of lexicographically increasing strings.
 * 
 * @param {number} length The number of strings to be generated.
 * @return {Array<string>} Array of lexicographically increasing strings:
 *   ["a", "b", ..., "A", "B", ..., "aa", "ab", ...]
 */
function createKeys(length) {
  // Represent a string as a reversed sequence of indices into an alphabet.
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let sequence = [];

  let keys = [];
  for (let i = 0; i < length; i++) {
    // Increment the string.
    for (let j = 0; j <= sequence.length; j++) {
      // Increment the jth character and if it doesn't carry, then break.
      if (j < sequence.length) {
        sequence[j] = (sequence[j] + 1) % alphabet.length;
        if (sequence[j] !== 0) {
          break;
        }
      }
      // If there's nothing left to increment, then push a new character.
      else {
        sequence.push(0);
        break;
      }
    }
    // Convert sequence into an actual string and add it to keys.
    keys.push(sequence.map(i => alphabet[i]).reverse().join(""));
  }
  return keys;
}

/**
 * Calls map on each entry of objects in an array.
 *
 * @param {!Array<Object>} arr An array of Objects.
 * @param {function} f Mapping function.
 * @return {!Array<Object>} Result.
 */
function mapEntries(arr, f) {
  return arr.map(obj => Object.fromEntries(Object.entries(obj).map(f)));
}

/**
 * Calls filter on each entry of objects in an array.
 *
 * @param {!Array<Object>} arr An array of Objects.
 * @param {function} f Filtering function.
 * @return {!Array<Object>} Result.
 */
function filterEntries(arr, f) {
  return arr.map(obj => Object.fromEntries(Object.entries(obj).filter(f)));
}
