/**
 * CONFIGURATION SETTINGS START
 */

// How many days worth of scheduling should be displayed on the sign. Should
// not be changed from 7 unless the HTML document is updated to display more
// than 7 days of scheduling
var DAYS_TO_SHOW = 7;

// The ID of the element in the HTML document where it will be indicated
// whether the Hotline is currently open or closed
var STATUS_TEXT_ELEMENT_ID = 'status';
var STATUS_IMAGE_ELEMENT_ID = 'status-image';

// The ID of the element in the HTML document where the most recent Tweet from
// the CAEN status feed should be printed
var CAEN_TWITTER_ELEMENT_ID = 'twitter';

// The IDs of the elements in the HTML document where the time strings for
// the schedule should be written. There should always be DAYS_TO_SHOW
// element IDs in this array
var SCHEDULE_HOURS_ELEMENT_IDS = ['sch-hours-1', 'sch-hours-2', 'sch-hours-3',
                                  'sch-hours-4', 'sch-hours-5', 'sch-hours-6',
                                  'sch-hours-7'];

// The IDs of the elements in the HTML document where the date strings for
// the schedule should be written. There should always be DAYS_TO_SHOW
// element IDs in this array
var SCHEDULE_DATE_ELEMENT_IDS = ['sch-date-1', 'sch-date-2', 'sch-date-3',
                                'sch-date-4', 'sch-date-5', 'sch-date-6',
                                'sch-date-7'];

// The ID of the elements in the HTML document where the date and time for
// the clock should be printed.
var CLOCK_TIME_ELEMENT_ID = 'time';
var CLOCK_DATE_ELEMENT_ID = 'date';

var STATUS_OPEN_IMAGE = 'Open_Status.png';
var STATUS_CLOSED_IMAGE = 'Closed_Status.png';
var STATUS_TEMP_CLOSED_IMAGE = 'Meeting_Status.png';
var STATUS_TEMP_CLOSED_TEXT = 'Returning at ';

// Our API key for the Google API. Obtained through the Google Developers Console
//var GAPI_KEY = 'AIzaSyCAMLoxWEwuUq2TaHhLxWlhaJvMIp9xqSQ';

//I(John) Made a New API key
var GAPI_KEY = 'AIzaSyDRhL309YJIL_c1IZyTXxF4pIBeKREvE7k';

// The Google Calendar ID for the calendar containing the Hotline hours
var HOURS_GCAL_ID
  = 'umich.edu_jeu14p2kdkgqqrclpp6nuhd8lk@group.calendar.google.com';

// URL of the RSS feed generated from the CAEN status update twitter
// (at twitter.com/umcaenstatus)
var CAEN_TWITTER_RSS_URL
  = 'http://twitrss.me/twitter_user_to_rss/?user=umcaenstatus';

// The name of all events in the Google calendar to indicate the hours when the
// Hotline is open
var HOTLINE_OPEN_EVENT_NAME = 'Open';
var HOTLINE_TEMP_CLOSED_EVENT_NAME = 'Meeting'

// What will appear in place of hours on a date on the schedule when the
// Hotline is closed
var SCHEDULE_CLOSED_MESSAGE = 'CLOSED';

// How often to update the Hotline schedule (in ms)
var SCHEDULE_UPDATE_INTERVAL = 45000;

// How often to update the clock on the signboard (in ms)
var CLOCK_UPDATE_INTERVAL = 1000;

// How often to update the CAEN status feed (in ms), which is fetched from
// an RSS feed generated from CAEN's status twitter account
var CAEN_STATUS_FEED_UPDATE_INTERVAL = 1000 * 60;

/**
 * CONFIGURATION SETTINGS END
 */

/**
 * Const global variables used to format date and time strings
 */
var MONTH_STRINGS = ['January', 'February', 'March', 'April', 'May',
  'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var DAY_STRINGS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
  'Friday', 'Saturday'];
var AM_PM_STRINGS = ['AM', 'PM'];

/**
 * Const global variables used to refer to DOM elements
 */
var STATUS_TEXT_ELEMENT = document.getElementById(STATUS_TEXT_ELEMENT_ID);
var STATUS_IMAGE_ELEMENT = document.getElementById(STATUS_IMAGE_ELEMENT_ID);
var CLOCK_TIME_ELEMENT = document.getElementById(CLOCK_TIME_ELEMENT_ID);
var CLOCK_DATE_ELEMENT = document.getElementById(CLOCK_DATE_ELEMENT_ID);
var CAEN_TWITTER_ELEMENT = document.getElementById(CAEN_TWITTER_ELEMENT_ID);
var SCHEDULE_HOURS_ELEMENTS = [];
var SCHEDULE_DATE_ELEMENTS = [];
for (var i = 0; i < SCHEDULE_HOURS_ELEMENT_IDS.length; ++i) {
  SCHEDULE_HOURS_ELEMENTS[i]
    = document.getElementById(SCHEDULE_HOURS_ELEMENT_IDS[i]);
}
for (var i = 0; i < SCHEDULE_DATE_ELEMENT_IDS.length; ++i) {
  SCHEDULE_DATE_ELEMENTS[i]
    = document.getElementById(SCHEDULE_DATE_ELEMENT_IDS[i]);
}

/**
 * Error messages
 */
var CAEN_TWITTER_ERROR_MESSAGE = 'Error retrieving the CAEN status feed.';

/**
 * Helper function to return a string corresponding to the JavaScript Date
 * object d in the form '<day>, <month> <date>, <year>'
 */
function formatDateString(d) {
  var day = d.getDay();
  var month = d.getMonth();
  var date = d.getDate();
  var year = d.getFullYear();
  return DAY_STRINGS[day] + ', ' + MONTH_STRINGS[month] + ' ' + date;
}

/**
 * Helper function to return a string corresponding to the JavaScript Date
 * object d in the form '<hrs>:<mins> [A.M.|P.M.]'
 */
function formatTimeString(d) {
  var hrs = d.getHours();
  var mins = d.getMinutes();
  var amPm = 0;
  if (hrs >= 12) {
    hrs -= 12;
    amPm = 1;
  }
  if (hrs === 0) hrs = 12;

  var str = hrs + ':';
  if (mins < 10) str += '0';
  str += mins + ' ' + AM_PM_STRINGS[amPm];
  return str;
}

/**
 * Draws the clock with the current time to the HTML document
 * and set a timer to update the clock at the interval set by
 * CLOCK_UPDATE_INTERVAL.
 */
function initClock() {

  // Draw the initial clock
  updateClock();

  // Set the timer for updating
  window.setInterval(updateClock, CLOCK_UPDATE_INTERVAL);

}

/**
 * Updates the signboard clock in the HTML document to the current time
 */
function updateClock() {
  var d = new Date();
  if (CLOCK_TIME_ELEMENT)
    CLOCK_TIME_ELEMENT.innerHTML = formatTimeString(d);
  if (CLOCK_DATE_ELEMENT)
    CLOCK_DATE_ELEMENT.innerHTML = formatDateString(d);
}

/**
 * Initializes the Google client API by registering our API key and loads the
 * Google Calendar API. Afterwards, calls the function to initialize schedule
 * drawing and updating.
 */

 /*
 What I have tried so far...
 https://developers.google.com/api-client-library/javascript/reference/referencedocs#gapiloadlibraries-callbackorconfig
 https://developers.google.com/calendar/quickstart/js
*/
function initApi() {
  gapi.load('client:auth2', initClient)
}

// John : I made this function
function initClient(){
  var CLIENT_ID = "429990460332-k9j5nc0lhpp1uhnpj8ek31s7autsqm2b.apps.googleusercontent.com";
  var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
  var DISCOV = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

  gapi.client.init({
    apiKey: GAPI_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOV,
    scope: SCOPES
  });

  gapi.client.load('calendar', 'v3', initSchedule);

}

/**
 * Draws the CAEN Hotline schedule for the next 7 days to the HTML document
 * by making a request to the Google Calendar API. Also sets a timer to
 * update the schedule at the frequency set by SCHEDULE_UPDATE_INTERVAL.
 */
function initSchedule() {

  // Draw the initial schedule
  updateSchedule();

  // Set the timer for updating
  window.setInterval(updateSchedule, SCHEDULE_UPDATE_INTERVAL);

}

/**
 * Updates the CAEN Hotline schedule for the next 7 days in the HTML document
 * by making a request to the Google Calendar API and formatting and
 * displaying the results. Also updates the open/closed status indicator.
 */
function updateSchedule() {

  // Calculate timeMin, a JavaScript Date object representing the minimum
  // END time of events which will be retrieved from the Google Calendar.
  // This is 12:00:00 A.M. on the current day.
  var timeMin = new Date();
  timeMin.setHours(0);
  timeMin.setMinutes(0);
  timeMin.setSeconds(0);

  // Calculate timeMax, a JavaScript Date object representing the maximum
  // START time of events which will be retrieved from the Google Calendar.
  // This is 11:59:59 P.M. on the DAYS_TO_SHOWth day.
  var timeMax = new Date(timeMin);
  timeMax.setDate(timeMax.getDate() + DAYS_TO_SHOW - 1);
  timeMax.setHours(23);
  timeMax.setMinutes(59);
  timeMax.setSeconds(59);

  // JavaScript object used to make the Google Calendar API request.
  // Each parameter is explained below.
  var request = gapi.client.calendar.events.list({

    // The Google Calendar ID of the Hotline hours calendar
    'calendarId': HOURS_GCAL_ID,

    // Lower bound on event END times to retrieve
    'timeMin': timeMin.toISOString(),

    // Upper bound on event START times to retrieve
    'timeMax': timeMax.toISOString(),

    // Whether or not to show deleted events
    'showDeleted': false,

    // If true, splits recurring events into single event instances instead
    // of returning them as a single event object
    'singleEvents': true,

    // How the events will be ordered in the resulting array
    'orderBy': 'startTime',

  });


  // Run the API request and perform the callback function below
  request.execute(function(resp) {

    // The dates that will be displayed in the Hotline schedule.
    // The string dateStrings[i] will be drawn to SCHEDULE_DATE_ELEMENTS[i].
    var dateStrings = [];

    // The hours that will be displayed in the Hotline schedule.
    // The string hoursStrings[i] will be drawn to SCHEDULE_HOURS_ELEMENTS[i].
    var hoursStrings = [];

    // JavaScript object that will be used as a hash table to match each event
    // to the index in dateStrings and hoursStrings corresponding to the
    // date the event occurs on
    var dateStringHash = {};

    // Initialize dateStrings, hoursStrings, and dateStringHash.
    for (var i = 0, d = timeMin; i < DAYS_TO_SHOW; ++i) {

      // Format the current date stored in d and add it to the dateStrings
      // array. After this loop, dateStrings will consist of strings giving
      // the dates of the next DAYS_TO_SHOW days
      dateStrings.push(formatDateString(d));

      // Create a mapping from the current date stored in d to the index
      // stored in i, so that the events given in the Google API response
      // can be easily mapped to the correct indices
      dateStringHash[d.toDateString()] = i;

      // Increment d to the next day
      d.setDate(d.getDate() + 1);

      // The hours for each day are initialized to closed and replaced as hours
      // for each day are found
      hoursStrings.push(SCHEDULE_CLOSED_MESSAGE);

    }

    // Loop through each event given in the API response and add a string
    // representing the hours indicated by each event to hoursStrings.
    // Also check whether the current time lies within any of the current
    // events (i.e. the Hotline is currently open)
    var events = resp.items;
    var hotlineOpen = false;
    var tempClosedEnd;
    var currentTime = new Date();
    for (var e = 0; e < events.length; ++e) {

      // A JavaScript Date object representing the current event's start time
      var start = new Date(Date.parse(events[e].start.dateTime));

      // A JavaScript Date object representing the current event's end time
      var end = new Date(Date.parse(events[e].end.dateTime));

      // If the event indicates that the Hotline is open at this time
      if (events[e].summary === HOTLINE_OPEN_EVENT_NAME) {

        // Update hotlineOpen
        if (currentTime >= start && currentTime < end) {
          hotlineOpen = true;
        }

        // The index in hoursStrings corresponding to this event's date
        var i = dateStringHash[start.toDateString()];

        // If this event's date is still listed as closed, overwrite the string
        if (hoursStrings[i] === SCHEDULE_CLOSED_MESSAGE) {
          hoursStrings[i] = formatTimeString(start) + ' - '
                            + formatTimeString(end);
        }

        // If there is already one or more set(s) of hours for this day, add the
        // new event's hours onto the end of the string
        else {
          hoursStrings[i] += ', ' + formatTimeString(start) + ' - '
                            + formatTimeString(end);
        }

      }

      // If the event indicates that the Hotline is temporarily closed at
      // this time
      else if (events[e].summary == HOTLINE_TEMP_CLOSED_EVENT_NAME) {

        // Update tempClosed
        if (currentTime >= start && currentTime < end) {
          tempClosedEnd = end;
        }
      }
    }

    // Draw the strings to the HTML document
    for (var i = 0; i < DAYS_TO_SHOW; ++i) {
      if (SCHEDULE_HOURS_ELEMENTS[i]) {
        SCHEDULE_HOURS_ELEMENTS[i].innerHTML = hoursStrings[i];
      }
      if (SCHEDULE_DATE_ELEMENTS[i]) {
        SCHEDULE_DATE_ELEMENTS[i].innerHTML = dateStrings[i];
      }
    }

    // Update the status indicator open/closed image
    if (tempClosedEnd) {
      if (STATUS_IMAGE_ELEMENT)
        STATUS_IMAGE_ELEMENT.src = STATUS_TEMP_CLOSED_IMAGE;
      if (STATUS_TEXT_ELEMENT)
        STATUS_TEXT_ELEMENT.innerHTML =
          STATUS_TEMP_CLOSED_TEXT + formatTimeString(tempClosedEnd);
    }
    else if (hotlineOpen) {
      if (STATUS_IMAGE_ELEMENT)
        STATUS_IMAGE_ELEMENT.src = STATUS_OPEN_IMAGE;
      if (STATUS_TEXT_ELEMENT)
        STATUS_TEXT_ELEMENT.innerHTML = '';
    }
    else {
      if (STATUS_IMAGE_ELEMENT)
        STATUS_IMAGE_ELEMENT.src = STATUS_CLOSED_IMAGE;
      if (STATUS_TEXT_ELEMENT)
        STATUS_TEXT_ELEMENT.innerHTML = '';
    }

  });

}

/**
 * TODO: Document this
 */
function initCaenStatusFeed() {
  updateCaenStatusFeed();
  window.setInterval(updateCaenStatusFeed, CAEN_STATUS_FEED_UPDATE_INTERVAL);
}

/**
 * TODO: Document this
 */
function updateCaenStatusFeed() {
  $.get(CAEN_TWITTER_RSS_URL, function(result) {
    if (CAEN_TWITTER_ELEMENT) {
      if (!result.error) {
        var entries = $(result).find('item');
        if (entries[0]) {
          var entry = $(entries[0]);
          var title = entry.find('title').text();
          var pubDate = entry.find('pubDate').text();
          var pubDateMoment;
          if (pubDate) {
            pubDateMoment = moment(pubDate);
          }
          if (title && pubDateMoment && pubDateMoment.isValid()) {
            CAEN_TWITTER_ELEMENT.innerHTML =
              pubDateMoment.format('MMM Do, YYYY, h:mm A') + ': ' + title;
          }
          else {
            CAEN_TWITTER_ELEMENT.innerHTML = CAEN_TWITTER_ERROR_MESSAGE;
          }
        }
        else {
          CAEN_TWITTER_ELEMENT.innerHTML = CAEN_TWITTER_ERROR_MESSAGE;
        }
      }
      else {
        CAEN_TWITTER_ELEMENT.innerHTML = CAEN_TWITTER_ERROR_MESSAGE;
      }
    }
  });
}
