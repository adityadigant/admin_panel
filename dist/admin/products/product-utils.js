var getProductList = function getProductList(props, onSuccess, onError) {
  var officeId = props.officeId;
  var limit = props.limit;
  var loadOnce = props.loadOnce;

  window.database.transaction("types").objectStore("types").index("template").getAll("product", limit).onsuccess = function (e) {
    var products = e.target.result;
    products.forEach(function (product, index) {
      if (product.officeId !== officeId) {
        products.splice(index, 1);
      }
    });
    onSuccess(products);
    if (products.length && loadOnce) return;
    http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/type?template=product").concat(limit ? "&limit=".concat(limit, "&start=0") : '')).then(function (response) {
      var tx = window.database.transaction("types", "readwrite");
      var store = tx.objectStore("types");
      response.results.forEach(function (result) {
        result.template = 'product';
        result.search_key_name = result.name.toLowerCase();
        store.put(result);
      });

      tx.oncomplete = function () {
        onSuccess(response.results);
      };
    }).catch(onError);
  };
};

var showProductList = function showProductList(products) {
  var ul = document.getElementById('products-list');
  ul.innerHTML = '';

  if (!products.length) {
    ul.appendChild(emptyCard('No products found'));
    document.querySelector('.see-all--products').classList.add('hidden');
    return;
  }

  ;
  products.forEach(function (product) {
    var li = createProductLi(product);
    new mdc.ripple.MDCRipple(li);
    ul.appendChild(li);
    ul.appendChild(createElement('li', {
      className: 'mdc-list-divider'
    }));
    ul.appendChild(createElement('li', {
      className: 'mdc-list-divider'
    }));
  });
};

var createProductLi = function createProductLi(product) {
  var li = createElement("li", {
    className: 'mdc-list-item',
    id: product.id
  });

  if (product.brand) {
    li.classList.add('product-with--brand');
  }

  li.innerHTML = "<span class=\"mdc-list-item__ripple\"></span>\n    \n    <span class=\"mdc-list-item__text\">\n        <span class=\"mdc-list-item__primary-text\">".concat(product.name, "</span>\n        <span class=\"mdc-list-item__secondary-text\">").concat(product.brand, "</span>\n    </span>\n    <div class=\"mdc-list-item__meta\">\n        ").concat(product.value ? "<span class='product-value'>".concat(formatMoney(product.value), "</span>") : '', "\n        <a href='../products/manage?id=").concat(product.id, "&name=").concat(product.name, "' class=\"material-icons list-meta--icon\">").concat(product.canEdit ? 'edit' : 'keyboard_arrow_right', "</a>\n    </div>");
  return li;
};