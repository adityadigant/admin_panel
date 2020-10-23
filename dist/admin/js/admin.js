var init = function init(office, officeId) {
  console.log('home page');
  handleProfileDetails(officeId);
  getUserList({
    officeId: officeId,
    start: 0,
    query_limit_size: 5
  }, updateUsersSection);
  getLocationList({
    officeId: officeId,
    start: 0,
    query_limit_size: 5
  }, updateLocationsSection);
};

var updateUsersSection = function updateUsersSection(response) {
  var activeCont = document.getElementById('employees-active-container');

  if (response.totalCheckedinUsers !== undefined && response.totalSize !== undefined) {
    activeCont.innerHTML = "".concat(response.totalCheckedinUsers, "/").concat(response.totalSize, " ");
  }

  var ul = document.getElementById('employees-list');
  ul.innerHTML = '';
  response.users.forEach(function (user) {
    ul.appendChild(createUserli(user));
  });
};

var updateLocationsSection = function updateLocationsSection(response) {
  var activeCont = document.getElementById('locations-active-container');
  var ul = document.getElementById('locations-list');

  if (response.totalActiveLocations !== undefined && response.totalSize !== undefined) {
    activeCont.innerHTML = "".concat(response.totalActiveLocations, "/").concat(response.totalSize, " ");
  }

  ul.innerHTML = '';
  response.locations.forEach(function (location) {
    ul.appendChild(createLocationLi(location));
  });
};