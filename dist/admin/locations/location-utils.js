var getLocationList = function getLocationList(props, onSuccess, onError) {
  var limit = props.query_limit_size;
  var start = props.start;
  var officeId = props.officeId;
  var count = 0;
  var records = [];
  var advanced = false;
  var tx = window.database.transaction("locations");

  tx.objectStore("locations").index('timestamp').openCursor(null, 'prev').onsuccess = function (event) {
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
          locations: records,
          totalActiveLocations: e.target.result.totalActiveLocations,
          totalSize: e.target.result.size,
          fresh: false
        });
      };
    }

    getLocationsDetails("".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/location?limit=").concat(limit, "&start=").concat(start)).then(function (response) {
      onSuccess({
        locations: response.results,
        totalActiveLocations: response.totalActiveLocations,
        totalSize: response.size,
        fresh: true
      });
    }).catch(onError);
  };
};

var getLocationsDetails = function getLocationsDetails(url) {
  return new Promise(function (resolve, reject) {
    http('GET', url).then(function (response) {
      var tx = window.database.transaction(["locations", "meta"], "readwrite");

      for (var index = 0; index < response.results.length; index++) {
        var result = response.results[index];

        if (result.location) {
          result['search_key'] = result.location ? result.location.toLowerCase() : null;
          var locationStore = tx.objectStore("locations");
          locationStore.put(result);
        }
      }

      var metaStore = tx.objectStore("meta");

      metaStore.get("meta").onsuccess = function (e) {
        var metaData = e.target.result;
        metaData.totalSize = response.size;
        metaData.totalActiveLocations = response.totalActiveLocations;
        metaStore.put(metaData);
      };

      tx.oncomplete = function () {
        resolve(response);
      };
    }).catch(reject);
  });
};

var locationAdditionComponent = function locationAdditionComponent(props) {
  var officeId = props.officeId,
      input = props.input;
  var anchor = input.parentNode.nextElementSibling;
  var menuEl = anchor.children[0];
  var menu = new mdc.menu.MDCMenu(menuEl);
  initializeSearch(input, function (value) {
    if (!value) return;
    getLocationsDetails("".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/location?location=").concat(encodeURIComponent(value), "&limit=5")).then(function (res) {
      menu.list_.root.innerHTML = '';
      var filteredResults = res.results.filter(function (result) {
        return menu.list_.root.querySelector(".mdc-chip[data-location=\"".concat(result.location, "\"]")) ? null : result;
      });
      filteredResults.forEach(function (result) {
        var li = locationMenuLi(result);
        li.dataset.location = result.location;
        menu.list_.root.appendChild(li);
      });

      if (filteredResults.length > 0) {
        menu.open = true;
        anchor.style.height = filteredResults.length * 48 + 16 + 'px';
      }
    });
  }, 500);
  /** listens for menu selection event and sends a custom event to handle dataset
   * on search input and appends a chip to the chip set 
   */

  menu.listen('MDCMenu:selected', function (menuEv) {
    var locationName = menuEv.detail.item.dataset.location;
    input.dispatchEvent(new CustomEvent('selected', {
      detail: {
        index: menuEv.detail.index,
        item: menuEv.detail.item,
        locationName: locationName
      }
    }));
  }); //set heigh to auto when menu is closed

  menu.listen('MDCMenuSurface:closed', function (ev) {
    anchor.style.height = 'auto';
  });
};

var locationMenuLi = function locationMenuLi(locationObject) {
  var li = createElement('li', {
    className: 'mdc-list-item',
    attrs: {
      role: 'menuitem'
    }
  });
  var span = createElement('span', {
    textContent: locationObject['location'],
    className: 'mdc-list-item__text'
  });
  li.appendChild(span);
  new mdc.ripple.MDCRipple(li);
  return li;
}; // const createLocationChip = (locationName) => {
//     const chip = createElement('div', {
//         className: 'mdc-chip',
//         attrs: {
//             role: 'row'
//         },
//     })
//     chip.dataset.location = locationName
//     chip.innerHTML = `<div class="mdc-chip__ripple"></div>
//     <span role="gridcell">
//       <span role="button" tabindex="0" class="mdc-chip__primary-action">
//         <span class="mdc-chip__text">${locationName}</span>
//       </span>
//     </span>
//     <span role="gridcell">
//       <i class="material-icons mdc-chip-trailing-action mdc-chip__icon mdc-chip__icon--trailing" tabindex="-1" role="button">cancel</i>
//     </span>
//     `
//     return chip;
// }


var updateLocationList = function updateLocationList(locations, start, fresh) {
  var freshCount = start;
  var ul = document.getElementById('locations-list');
  locations.forEach(function (location) {
    if (ul.querySelector("[data-id=\"".concat(location.id, "\"]"))) {
      ul.querySelector("[data-id=\"".concat(location.id, "\"]")).remove();
    }

    var li = createLocationLi(location);

    if (!fresh) {
      ul.appendChild(li);
    } else {
      ul.insertBefore(li, ul.children[freshCount]);
      freshCount++;
    }
  });

  if (!locations.length) {
    ul.appendChild(emptyCard('No locations found'));
  }
};

var createLocationLi = function createLocationLi(location) {
  var li = createElement('a', {
    className: 'mdc-list-item user-list',
    href: "/admin/duties/index.html?id=".concat(location.id, "&canEdit=").concat(location.canEdit, "&location=").concat(encodeURIComponent(location['location']))
  });
  li.dataset.id = location.id;
  li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n    <span class=\"mdc-list-item__text\">\n      <span class=\"mdc-list-item__primary-text\">".concat(location['location'], "</span>\n      <span class=\"mdc-list-item__secondary-text\">").concat(location['address'], "</span>\n    </span>\n    <span class='mdc-list-item__meta list-time'>").concat(formatCreatedTime(location.timestamp), "</span>");
  new mdc.ripple.MDCRipple(li);
  return li;
};