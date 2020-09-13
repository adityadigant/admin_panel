/** callback is used because activity returned by this function needs to update dom 2 times */
var getCompanyDetails = function getCompanyDetails(officeId, onSuccess, onError) {
  getActivity(officeId).then(function (record) {
    if (record) {
      onSuccess(record);
    }

    ;
    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(officeId, "/")).then(function (officeActivity) {
      putActivity(officeActivity).then(onSuccess);
    }).catch(onError);
  });
};

var getActivity = function getActivity(activityId) {
  return new Promise(function (resolve, reject) {
    var tx = window.database.transaction("activities");
    var store = tx.objectStore("activities");

    store.get(activityId).onsuccess = function (e) {
      return resolve(e.target.result);
    };
  });
};

var putActivity = function putActivity(activity) {
  return new Promise(function (resolve, reject) {
    var tx = window.database.transaction("activities", "readwrite");
    var store = tx.objectStore("activities");

    store.put(activity).onsuccess = function () {
      return resolve(activity);
    };
  });
};

var handleProfileDetails = function handleProfileDetails(officeId) {
  getCompanyDetails(officeId, updateCompanyProfile, console.error);
};

var updateCompanyProfile = function updateCompanyProfile(activity) {
  var companyLogo = document.getElementById('company-logo');
  var companyName = document.getElementById('company-name');
  var companyAddress = document.getElementById('company-address');
  var companyDescription = document.getElementById('company-description');
  var companyCategory = document.getElementById('company-category');

  if (activity.attachment['Company Logo'].value) {
    companyLogo.src = activity.attachment['Company Logo'].value;
  }

  companyName.textContent = activity.attachment['Name'].value;
  companyAddress.textContent = activity.attachment['Registered Office Address'].value;
  companyDescription.textContent = activity.attachment['Description'].value;
  companyCategory.textContent = activity.attachment['Category'] ? activity.attachment['Category'].value : '';
};
/**
 * format string to INR 
 * @param {string} money 
 * @returns {string} 
 */


var formatMoney = function formatMoney(money) {
  var number = Number(money.split(',').join(''));
  return number.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR'
  });
};

var emptyCard = function emptyCard(text) {
  var div = createElement('div', {
    className: 'mdc-card mdc-card--outlined  empty-card'
  });
  div.innerHTML = "<span class='text-cont'>\n    <i class='material-icons'>info</i>\n    ".concat(text, "\n    </span>");
  return div;
};

var openProfileBox = function openProfileBox(event) {
  event.stopPropagation();
  document.querySelector('.user-profile--logo').classList.add('focused');
  var el = document.querySelector('.profile-box');

  if (el.classList.contains('hidden')) {
    el.classList.remove('hidden');
  } else {
    closeProfileBox();
  }

  ;
  var name = firebase.auth().currentUser.displayName;
  var email = firebase.auth().currentUser.email;
  var photo = firebase.auth().currentUser.photoURL;

  if (photo) {
    document.getElementById('auth-image').src = photo;
  }

  document.getElementById('auth-name').textContent = name;
  document.getElementById('auth-email').textContent = email;
};

var closeProfileBox = function closeProfileBox() {
  var el = document.querySelector('.profile-box');
  document.querySelector('.user-profile--logo').classList.remove('focused');
  el.classList.add('hidden');
};

var handleFormButtonSubmit = function handleFormButtonSubmit(button, text) {
  button.classList.remove('active');

  if (text) {
    showSnacksApiResponse(text);
  }
};

var getFormId = function getFormId() {
  var search = new URLSearchParams(window.location.search);
  return search.get('id');
};

var getFormRequestParams = function getFormRequestParams() {
  var id = getFormId();
  return {
    method: id ? 'PUT' : 'POST',
    url: id ? "".concat(appKeys.getBaseUrl(), "/api/activities/update") : "".concat(appKeys.getBaseUrl(), "/api/activities/create")
  };
};
/** Debouncing utils */


var timerId = null;

var debounce = function debounce(func, delay, value) {
  clearTimeout(timerId);
  timerId = setTimeout(function () {
    func(value);
  }, delay);
};

var initializeSearch = function initializeSearch(input, callback, delay) {
  input.addEventListener('input', function (ev) {
    var value = ev.currentTarget.value.trim().toLowerCase();
    debounce(callback, delay, value);
  });
};

var validatePhonNumber = function validatePhonNumber(iti) {
  var error = iti.getValidationError();
  var result = {
    message: '',
    isValid: false
  };

  if (error !== 0) {
    result.message = getPhoneFieldErrorMessage(error);
    return result;
  }

  if (!iti.isValidNumber()) {
    result.message = 'Invalid number. Please check again';
    return result;
  }

  ;
  result.isValid = true;
  return result;
};

var createSubscription = function createSubscription(office, subscriptionName) {
  var requestBody = {
    attachment: {
      'Phone Number': {
        type: 'phoneNumber',
        value: firebase.auth().currentUser.phoneNumber
      },
      'Template': {
        type: 'string',
        value: subscriptionName
      }
    },
    office: office,
    share: [],
    venue: [],
    schedule: [],
    geopoint: {
      latitude: 0,
      longitude: 0
    },
    template: 'subscription'
  };
  return http('POST', "".concat(appKeys.getBaseUrl(), "/api/activities/create"), requestBody);
};

var formatCreatedTime = function formatCreatedTime(timestamp) {
  if (!timestamp) return '';
  return moment(timestamp).calendar(null, {
    sameDay: 'hh:mm A',
    lastDay: '[Yesterday]',
    nextDay: '[Tomorrow]',
    nextWeek: 'dddd',
    lastWeek: 'DD/MM/YY',
    sameElse: 'DD/MM/YY'
  });
};

var formatDutyTime = function formatDutyTime(timestamp) {
  return moment(timestamp).calendar(null, {
    sameDay: 'hh:mm A',
    lastDay: '[Yesterday] hh:mm A',
    nextDay: '[Tomorrow] hh:mm A',
    nextWeek: 'dddd',
    lastWeek: 'DD/MM/YY',
    sameElse: 'DD/MM/YY'
  });
};

var createActivityBody = function createActivityBody() {
  var object = {
    attachment: {},
    venue: [],
    schedule: [],
    office: '',
    activityId: '',
    template: '',
    share: [],
    geopoint: {
      latitude: 0,
      longitude: 0
    }
  };
  return {
    setAttachment: function setAttachment(name, value, type) {
      object.attachment[name] = {
        value: value,
        type: type
      };
    },
    setVenue: function setVenue(venue) {
      object.venue = venue;
    },
    setSchedule: function setSchedule(schedule) {
      object.schedule = schedule;
    },
    setOffice: function setOffice(office) {
      object.office = office;
    },
    setTemplate: function setTemplate(template) {
      object.template = template;
    },
    setActivityId: function setActivityId(activityId) {
      object.activityId = activityId;
    },
    setShare: function setShare(share) {
      object.share = share;
    },
    get: function get() {
      return object;
    }
  };
};

var toggleFabList = function toggleFabList(parentButton) {
  parentButton.querySelector('.mdc-fab__icon').classList.toggle('is-active');
  document.getElementById('drawer-scrim').classList.toggle('block');
  document.querySelectorAll('.fabs .fab').forEach(function (el) {
    el.classList.toggle('is-visible');
  });
};