var getUserList = function getUserList(props, onSuccess, onError) {
  var limit = props.query_limit_size;
  var start = props.start;
  var officeId = props.officeId;
  var count = 0;
  var records = [];
  var advanced = false;
  var tx = window.database.transaction("users");

  tx.objectStore("users").index('timestamp').openCursor(null, 'prev').onsuccess = function (event) {
    var cursor = event.target.result;
    if (!cursor) return;

    if (officeId !== cursor.value.officeId) {
      cursor.continue();
      return;
    }

    ;
    if (count >= limit) return;

    if (advanced == false && start) {
      advanced = true;
      cursor.advance(start);
    } else {
      count++;
      records.push(cursor.value);
      cursor.continue();
    }
  };

  tx.oncomplete = function () {
    if (records.length) {
      window.database.transaction("meta").objectStore("meta").get("meta").onsuccess = function (e) {
        onSuccess({
          users: records,
          totalCheckedinUsers: e.target.result.totalCheckedinUsers,
          totalSize: e.target.result.totalUsersSize,
          fresh: false
        });
      };
    }

    getUsersDetails("".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/user?limit=").concat(limit, "&start=").concat(start)).then(function (response) {
      onSuccess({
        users: response.results,
        totalCheckedinUsers: response.totalCheckedinUsers,
        totalSize: response.size,
        fresh: true
      });
    }).catch(console.error);
  };
};

var getUsersDetails = function getUsersDetails(url) {
  return new Promise(function (resolve, reject) {
    http('GET', url).then(function (response) {
      var tx = window.database.transaction(["users", "meta"], "readwrite");

      for (var index = 0; index < response.results.length; index++) {
        var result = response.results[index];
        result['search_key'] = result.displayName ? result.displayName.toLowerCase() : null;
        var usersStore = tx.objectStore("users");
        usersStore.put(result);
      }

      var metaStore = tx.objectStore("meta");

      metaStore.get("meta").onsuccess = function (e) {
        var metaData = e.target.result;
        metaData.totalUsersSize = response.size;
        metaData.totalCheckedinUsers = response.totalCheckedinUsers;
        metaStore.put(metaData);
      };

      tx.oncomplete = function () {
        resolve(response);
      };
    }).catch(reject);
  });
};

var userAdditionComponent = function userAdditionComponent(props) {
  var officeId = props.officeId,
      input = props.input;
  var anchor = input.parentNode.nextElementSibling;
  var menuEl = anchor.children[0];
  var menu = new mdc.menu.MDCMenu(menuEl);
  var chipSetEl = anchor.nextElementSibling;
  var chipSet;

  if (chipSetEl) {
    chipSet = new mdc.chips.MDCChipSet(chipSetEl);
  }

  initializeSearch(input, function (value) {
    if (!value) return;
    var query;

    if (Number(value)) {
      query = 'phoneNumber=' + encodeURIComponent(value);
    } else {
      query = 'employeeName=' + encodeURIComponent(value);
    }

    getUsersDetails("".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/user?").concat(query, "&limit=5")).then(function (res) {
      menu.list_.root.innerHTML = '';
      var filteredResults = res.results.filter(function (user) {
        return menu.list_.root.querySelector(".mdc-chip[data-number=\"".concat(user.phoneNumber, "\"]")) ? null : user;
      });
      filteredResults.forEach(function (user) {
        var li = userMenuLi(user);
        li.dataset.user = JSON.stringify(user);
        menu.list_.root.appendChild(li);
      });

      if (filteredResults.length > 0) {
        // open menu and trasition to increase container height;
        menu.open = true;
        anchor.style.height = filteredResults.length * 56 + 16 + 'px';
      }
    });
  }, 500);
  /** listens for menu selection event and sends a custom event to handle dataset
   * on search input and appends a chip to the chip set 
   */

  menu.listen('MDCMenu:selected', function (menuEv) {
    var user = JSON.parse(menuEv.detail.item.dataset.user);
    input.dispatchEvent(new CustomEvent('selected', {
      detail: {
        index: menuEv.detail.index,
        item: menuEv.detail.item,
        user: user
      }
    })); // menu.open = false;

    if (!chipSet) return;
    var chip = createUserChip(user);
    chipSetEl.appendChild(chip);
    chipSet.addChip(chip);
  }); //set heigh to auto when menu is closed

  menu.listen('MDCMenuSurface:closed', function (ev) {
    anchor.style.height = 'auto';
  });
  /** listens for chip removal event and sends a custom event to handle dataset
   *  on search input
   */

  if (!chipSet) return;
  chipSet.listen('MDCChip:trailingIconInteraction', function (ev) {
    var el = document.getElementById(ev.detail.chipId);
    input.dispatchEvent(new CustomEvent('removed', {
      detail: {
        user: {
          employeeName: el.dataset.name,
          phoneNumber: el.dataset.number
        }
      }
    }));
  });
};

var userMenuLi = function userMenuLi(user) {
  var li = createElement('li', {
    className: 'mdc-list-item',
    attrs: {
      role: 'menuitem'
    }
  });
  var img = createElement('img', {
    className: 'mdc-list-item__graphic',
    src: user.photoURL
  });
  var span = createElement('span', {
    textContent: user.employeeName || user.displayName || user.phoneNumber,
    className: 'mdc-list-item__text'
  });
  li.appendChild(img);
  li.appendChild(span);
  new mdc.ripple.MDCRipple(li);
  return li;
};

var createUserChip = function createUserChip(user, isNonEditable) {
  var chip = createElement('div', {
    className: 'mdc-chip',
    attrs: {
      role: 'row'
    }
  });
  chip.dataset.number = user.phoneNumber;
  chip.dataset.name = user.employeeName || user.displayName;
  chip.innerHTML = "<div class=\"mdc-chip__ripple\"></div>\n    <img class=\"mdc-chip__icon mdc-chip__icon--leading\" src=\"".concat(user.photoURL || '../../img/person.png', "\">\n    <span role=\"gridcell\">\n      <span role=\"button\" tabindex=\"0\" class=\"mdc-chip__primary-action\">\n        <span class=\"mdc-chip__text\">").concat(user.employeeName || user.displayName || user.phoneNumber, "</span>\n      </span>\n    </span>\n    ").concat(isNonEditable ? '' : "<span role=\"gridcell\">\n    <i class=\"material-icons mdc-chip-trailing-action mdc-chip__icon mdc-chip__icon--trailing\" tabindex=\"-1\" role=\"button\">cancel</i>\n  </span>", " \n   \n    ");
  return chip;
};

var updateUsersList = function updateUsersList(users, start, fresh) {
  var freshCount = start;
  var ul = document.getElementById('employees-list');
  users.forEach(function (user) {
    if (ul.querySelector("[data-number=\"".concat(user.phoneNumber, "\"]"))) {
      ul.querySelector("[data-number=\"".concat(user.phoneNumber, "\"]")).remove();
    }

    var li = createUserli(user);

    if (!fresh) {
      ul.appendChild(li);
    } else {
      ul.insertBefore(li, ul.children[freshCount]);
      freshCount++;
    }
  });
};

var createUserli = function createUserli(user) {
  var li = createElement('li', {
    className: 'mdc-list-item user-list'
  });
  var activeUser = isUserActive(user);
  li.dataset.number = user.phoneNumber;

  if (user.latestCheckIn.location) {
    li.classList.add('user-list--location');
  }

  if (!activeUser) {
    li.classList.add('user-list--cancelled');
  }

  li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n    <img class='mdc-list-item__graphic' src=\"".concat(user.photoURL || '../../img/person.png', "\">\n    <span class=\"mdc-list-item__text\">\n      <span class=\"mdc-list-item__primary-text\">").concat(user.employeeName || user.displayName || user.phoneNumber, "</span>\n      ").concat(user.latestCheckIn.location ? " <span class=\"mdc-list-item__secondary-text\">".concat(user.latestCheckIn.location, "</span>") : '', "\n      ").concat(!activeUser ? "<span class='status mdc-list-item__secondary-text'><span class='dot'></span>Removed</span>" : '', "\n    </span>\n    <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(user.latestCheckIn.timestamp), "</span>");
  new mdc.ripple.MDCRipple(li);
  /** temporary use case until query by employee id is possible */

  li.addEventListener('click', function (ev) {
    if (!activeUser) return;
    localStorage.setItem('selected_user', JSON.stringify(user));
    redirect("/admin/employees/checkins.html?employeeId=".concat(user.employeeId));
  });
  return li;
};