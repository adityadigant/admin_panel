var createDuty = document.getElementById("create-duty");
var editIcon = document.getElementById("edit-location");
var ul = document.getElementById("duties-list");
var formHeading = document.getElementById('form-heading');
var dutiesCardContainer = document.getElementById('duty-cards--container');

var init = function init(office, officeId) {
  var search = new URLSearchParams(window.location.search);
  var canEdit = search.get("canEdit");
  var id = search.get("id");
  var dutyLocation = search.get("location");

  if (!id) {
    window.alert("No location found");
    return;
  }

  formHeading.textContent = dutyLocation;

  if (canEdit === "true" && id) {
    editIcon.classList.remove("hidden");
    editIcon.href = './manageDuty.html?id=' + id + '&location=' + dutyLocation;
  }

  createDuty.href = './manageDuty.html?location=' + dutyLocation;

  window.database.transaction("locations").objectStore("locations").get(dutyLocation).onsuccess = function (e) {
    var record = e.target.result;
    var duties = record.duties || [];
    var sorted = duties.sort(function (a, b) {
      return b.timestamp - a.timestamp;
    });
    sorted.forEach(function (duty) {
      dutiesCardContainer.appendChild(createDutyBox(duty, officeId, dutyLocation));
    });
    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/location?location=").concat(dutyLocation)).then(function (res) {
      window.database.transaction("locations", 'readwrite').objectStore("locations").put(res.results[0]);
      var freshDuties = res.results[0].duties || [];
      freshDuties.sort(function (a, b) {
        return b.timestamp - a.timestamp;
      }).forEach(function (duty) {
        if (document.getElementById(duty.id)) {
          document.getElementById(duty.id).remove();
        }

        dutiesCardContainer.appendChild(createDutyBox(duty, officeId, dutyLocation));
      });
    });
  };
};

var createDutyBox = function createDutyBox(duty, officeId, dutyLocation) {
  var clone = document.getElementById('clone-node').cloneNode(true);
  clone.querySelector('.edit-duty').href = "./manageDuty.html?id=".concat(duty.id, "&location=").concat(dutyLocation);
  clone.querySelector('.duty-start').textContent = formatDutyTime(duty.startTime);
  clone.querySelector('.duty-end').textContent = formatDutyTime(duty.endTime);
  var supervisorNumber = duty.supervisor ? duty.supervisor.value : '';

  if (!supervisorNumber) {
    clone.querySelector('.supervisor-list').classList.add('hidden');
  }

  duty.assignees.forEach(function (assignee) {
    var chip = createUserChip(assignee, true);

    if (assignee.phoneNumber === supervisorNumber) {
      clone.querySelector('.supervisor-chipset').appendChild(chip);
    } else {
      clone.querySelector('.employee-chipset').appendChild(chip);
    }
  });
  var showMoreCont = clone.querySelector('.show-more-duty');
  var isOpen = false;
  clone.querySelector('.show-more').addEventListener('click', function (ev) {
    showMoreCont.classList.toggle('hidden');
    isOpen = !isOpen;

    if (isOpen) {
      ev.currentTarget.textContent = 'Show less';
      getActivity(duty.id).then(function (activity) {
        if (activity) {
          showDutyMetaDetails(clone, activity);
        }

        http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(duty.id)).then(function (res) {
          putActivity(res).then(function (activity) {
            showDutyMetaDetails(clone, activity);
          });
        });
      });
      return;
    }

    ev.currentTarget.textContent = 'Show more';
  });
  clone.id = duty.id;
  clone.classList.remove('hidden');
  return clone;
};

var showDutyMetaDetails = function showDutyMetaDetails(clone, activity) {
  var checkins = activity.checkins || [];
  var filtered = checkins.sort(function (a, b) {
    return b.timestamp - a.timestamp;
  }).filter(function (checkin) {
    return checkin.attachment['Photo'].value;
  });
  filtered.forEach(function (checkin) {
    clone.querySelector('.photos ul').appendChild(createImageLi(checkin.attachment['Photo'].value, checkin.timestamp));
  });
  var filteredProduct = activity.attachment['Products'].value.filter(function (product) {
    return product.name;
  });

  if (!filteredProduct.length) {
    clone.querySelector('.list.product-list').classList.add('hidden');
    return;
  }

  ;
  filteredProduct.forEach(function (product) {
    if (clone.querySelector("[data-name=\"".concat(product.name, "\"]"))) {
      clone.querySelector("[data-name=\"".concat(product.name, "\"]")).remove();
    }

    clone.querySelector('.product-ul').appendChild(dutyProductLi(product));
  });
};

var dutyProductLi = function dutyProductLi(product) {
  var li = createElement('li', {
    className: 'mdc-list-item'
  });
  li.dataset.name = product.name;
  li.innerHTML = "\n        <span class=\"mdc-list-item__ripple\"></span>\n        <span class=\"mdc-list-item__text\">\n            <span class=\"mdc-list-item__primary-text\">".concat(product.name, "</span>\n            <span class=\"mdc-list-item__secondary-text\">Quantity: ").concat(product.quantity, "</span>\n        </span>\n        <div class=\"mdc-list-item__meta\">\n            ").concat(formatMoney(String(product.rate)), "\n        </div>");
  new mdc.ripple.MDCRipple(li);
  return li;
};

var createImageLi = function createImageLi(url, time) {
  var li = createElement('li', {
    className: 'mdc-image-list__item'
  });
  li.innerHTML = "<div class=\"mdc-image-list__image-aspect-container\">\n    <img class=\"mdc-image-list__image\" src=\"".concat(url, "\">\n  </div>\n  <div class=\"mdc-image-list__supporting\">\n    <span class=\"mdc-image-list__label\">").concat(moment(time).format('HH:mm'), "</span>\n  </div>");
};

var createDutyAssignee = function createDutyAssignee(assignee) {
  var li = createElement('li', {
    className: 'mdc-list-item'
  });
  var img = createElement('img', {
    src: assignee.photoURL || '../../person.png',
    className: 'mdc-list-item__graphic'
  });
  var span = createElement('span', {
    textContent: assignee.displayName
  });
  li.appendChild(img);
  li.appendChild(span);
  return li;
};