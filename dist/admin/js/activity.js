var init = function init(office, officeId) {
  var activityId = new URLSearchParams(window.location.search).get('id');

  if (!activityId) {
    alert("Invalid url");
    return;
  }

  window.database.transaction("activity").objectStore("activity").get(activityId).onsuccess = function (e) {
    var activity = e.target.result;
    updateActivity();
  };

  http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(activityId, "/")).then(function (response) {
    console.log(response);
  });
};