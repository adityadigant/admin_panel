var init = function init(office, officeId) {
  handleProfileDetails(officeId);
  getProductList({
    officeId: officeId,
    limit: 5
  }, function (products) {
    console.log(products);
    showProductList(products);
  });
};