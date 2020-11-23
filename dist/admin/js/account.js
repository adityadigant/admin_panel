var init = function init(office, officeId) {
  var form = document.getElementById('manage-form');
  var auth = firebase.auth().currentUser;
  var nameField = new mdc.textField.MDCTextField(document.getElementById('account-name'));
  var emailField = new mdc.textField.MDCTextField(document.getElementById('account-email'));
  var imageField = document.querySelector('.account-photo');
  var imageUpload = document.getElementById('image-upload');
  var submitBtn = form.querySelector('.form-actionable .mdc-fab--action[type="submit"]');
  var base64Image = auth.photoURL;
  nameField.value = auth.displayName;
  emailField.value = auth.email;

  if (auth.photoURL) {
    imageField.style.backgroundImage = "url(\"".concat(auth.photoURL, "\")");
  }

  ;
  imageUpload.addEventListener('change', function (ev) {
    getImageBase64(ev).then(function (base64) {
      base64Image = base64;
      imageField.style.backgroundImage = "url(\"".concat(base64, "\")");
    });
  });
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    submitBtn.classList.add('active');
    var imageProm;

    if (auth.photoURL !== base64Image) {
      imageProm = http('POST', "".concat(appKeys.getBaseUrl(), "/api/services/images"), {
        imageBase64: base64Image
      });
    } else {
      imageProm = Promise.resolve();
    }

    imageProm.then(function () {
      return handleAuthUpdate({
        displayName: nameField.value,
        email: emailField.value
      });
    }).then(function () {
      auth.reload();
      handleFormButtonSubmitSuccess(submitBtn, 'Account updated');
    }).catch(function (err) {
      submitBtn.classList.remove('active');
      var message = getEmailErrorMessage(err);

      if (message) {
        setHelperInvalid(emailField, message);
        return;
      }

      handleFormButtonSubmit(submitBtn, message);
    });
  });
};