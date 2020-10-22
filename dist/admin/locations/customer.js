var customerName = document.getElementById('name');
var primaryPhoneNumber = document.getElementById('primary-phonenumber');
var secondaryPhoneNumber = document.getElementById('secondary-phonenumber');
var address = document.getElementById('address');
var form = document.getElementById('manage-form');
var submitBtn = form.querySelector('.form-actionable .mdc-fab--action[type="submit"]');

var init = function init(office, officeId) {
  // check if we have activity id in url. 
  // if activity id is  found, then udpate the form else create
  var formId = getFormId();
  var requestParams = getFormRequestParams();
  var primaryPhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-primary'));
  var secondaryPhoneNumberMdc = new mdc.textField.MDCTextField(document.getElementById('phone-field-mdc-secondary'));
  var primaryIti = phoneFieldInit(primaryPhoneNumberMdc);
  var secondaryIti = phoneFieldInit(secondaryPhoneNumberMdc);

  if (formId) {
    document.getElementById('form-heading').innerHTML = 'Update ' + new URLSearchParams(window.location.search).get('name');
    getActivity(formId).then(function (activity) {
      if (activity) {
        updateCustomerFields(activity);
      }

      http('GET', "".concat(appKeys.getBaseUrl(), "/api/office/").concat(officeId, "/activity/").concat(formId, "/")).then(function (res) {
        putActivity(res).then(updateCustomerFields);
      });
    });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var primaryContactValidation = validatePhonNumber(primaryIti);

    if (!primaryContactValidation.isValid) {
      setHelperInvalid(primaryPhoneNumberMdc, primaryContactValidation.message);
      return;
    }

    var secondaryContactValidation = validatePhonNumber(secondaryIti);

    if (secondaryPhoneNumberMdc.value && !secondaryContactValidation.isValid) {
      setHelperInvalid(secondaryPhoneNumberMdc, secondaryContactValidation.message);
      return;
    }

    setHelperValid(primaryPhoneNumberMdc);
    setHelperValid(secondaryPhoneNumberMdc);
    submitBtn.classList.add('active');
    var activityBody = createActivityBody();
    activityBody.setOffice(office);
    activityBody.setActivityId(formId);
    activityBody.setTemplate('customer');
    activityBody.setVenue([{
      location: address.value,
      address: address.value,
      venueDescriptor: 'Customer Office',
      geopoint: {
        latitude: 0,
        longitude: 0
      }
    }]);
    console.log(primaryIti.getNumber().value);
    activityBody.setAttachment('Name', customerName.value, 'string');
    activityBody.setAttachment('First Contact', primaryIti.getNumber(), 'phoneNumber');
    activityBody.setAttachment('Second Contact', secondaryIti.getNumber(), 'phoneNumber');
    var requestBody = activityBody.get();
    http(requestParams.method, requestParams.url, requestBody).then(function (res) {
      var message = 'New Customer added';

      if (requestParams.method === 'PUT') {
        message = 'Customer updated';
        putActivity(requestBody).then(function () {
          handleFormButtonSubmitSuccess(submitBtn, message);
        });
        return;
      }

      handleFormButtonSubmitSuccess(submitBtn, message);
    }).catch(function (err) {
      if (err.message === "customer '".concat(requestBody.attachment.Name.value, "' already exists")) {
        setHelperInvalid(new mdc.textField.MDCTextField(document.getElementById('name-field-mdc')), err.message);
        handleFormButtonSubmit(submitBtn);
        return;
      }

      if (err.message === "No subscription found for the template: 'customer' with the office '".concat(office, "'")) {
        createSubscription(office, 'customer').then(function () {
          form.dispatchEvent(new Event('submit', {
            cancelable: true,
            bubbles: true
          }));
        });
        return;
      }

      handleFormButtonSubmit(submitBtn, err.message);
    });
  });
};

var updateCustomerFields = function updateCustomerFields(activity) {
  customerName.value = activity.attachment['Name'].value;
  primaryPhoneNumber.value = activity.attachment['First Contact'].value;
  secondaryPhoneNumber.value = activity.attachment['Second Contact'].value;
  address.value = activity.venue[0].address;
};