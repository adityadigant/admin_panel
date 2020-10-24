var linearProgress;

var parseRedirect = function parseRedirect(type) {
  var param = new URLSearchParams(document.location.search.substring(1));
  return param.get(type);
};

var login = function login(el) {
  if (!el) return;
  el.innerHTML = loginDom();
  linearProgress = new mdc.linearProgress.MDCLinearProgress(document.getElementById('card-progress'));

  if (appKeys.getMode() === 'dev') {
    firebase.auth().settings.appVerificationDisabledForTesting = true;
  }

  var numberField = new mdc.textField.MDCTextField(document.getElementById('phone-number-field'));
  var iti = phoneFieldInit(numberField, document.getElementById('country-dom'));
  numberField.focus();
  numberField.foundation.autoCompleteFocus();
  console.log(numberField);
  var verifyNumber = new mdc.ripple.MDCRipple(document.getElementById('verify-phone-number'));
  verifyNumber.root.addEventListener('click', function () {
    var error = iti.getValidationError();

    if (error !== 0) {
      var message = getMessageStringErrorCode(error);
      setHelperInvalid(numberField, message);
      return;
    }

    if (!iti.isValidNumber()) {
      setHelperInvalid(numberField, 'Invalid number. Please check again');
      return;
    }

    numberField.value = iti.getNumber();
    linearProgress.open();
    disabledLoginArea();
    numberField.helperTextContent = '';

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = handleRecaptcha('verify-phone-number');
    }

    window.recaptchaVerifier.render().then(function (widgetId) {
      window.recaptchaWidgetId = widgetId;
      return window.recaptchaVerifier.verify().then(function () {
        return firebase.auth().signInWithPhoneNumber(numberField.value, window.recaptchaVerifier);
      }).then(function (confirmResult) {
        enableLoginArea();
        return handleOtp(confirmResult, el);
      }).catch(function (error) {
        errorUI(error);
        sendErrorLog({
          message: error.message,
          stack: error.stack
        });
      });
    }).catch(function (recaptchError) {
      sendErrorLog({
        message: recaptchError.message,
        stack: recaptchError.stack
      });
    });
  });
};

var getMessageStringErrorCode = function getMessageStringErrorCode(code) {
  var message = '';

  switch (code) {
    case 1:
      message = 'Please enter a correct country code';
      break;

    case 2:
      message = 'Number is too short';
      break;

    case 3:
      message = 'Number is too long';
      break;

    case 4:
      message = 'Invalid Number';
      break;

    default:
      message = '';
      break;
  }

  return message;
};

var errorUI = function errorUI(error) {
  console.log(error);
  linearProgress.close();
  enableLoginArea();
};

var updateAuth = function updateAuth(el, auth) {
  if (!el) return;
  el.innerHTML = updateAuthDom(auth);
  linearProgress = new mdc.linearProgress.MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
  var nameField;

  if (!auth.displayName) {
    nameField = new mdc.textField.MDCTextField(document.getElementById('name-field'));
  }

  ;
  var emailField = new mdc.textField.MDCTextField(document.getElementById('email-field'));
  var emailValue = '';

  if (auth.email) {
    emailValue = auth.email;
  }

  emailField.value = emailValue;
  var updateBtn = new mdc.ripple.MDCRipple(document.getElementById('update-auth-btn'));

  if (auth.displayName && auth.email && !auth.emailVerified) {
    document.querySelector('.text-indicator p').textContent = 'Verify email address';
    updateBtn.root.querySelector('span').textContent = 'SEND VERIFICATION LINK';
  }

  updateBtn.root.addEventListener('click', function () {
    if (nameField && !nameField.value) {
      setHelperInvalid(nameField, 'Name cannot be empty');
      return;
    }

    if (!emailField.value) {
      setHelperInvalid(emailField, 'Email cannot be empty');
      return;
    }

    if (!isValidEmail(emailField.value)) {
      setHelperInvalid(emailField, 'Enter a correct email address');
      return;
    }

    ;
    linearProgress.open();
    disabledLoginArea();
    auth.updateProfile({
      displayName: nameField ? nameField.value.trim() : auth.displayName
    }).then(function () {
      if (auth.emailVerified && auth.email) {
        linearProgress.close();
        debugger;
        return window.location.reload();
      }

      ;
      var actionSettings = {
        url: "".concat(window.location.origin).concat(window.location.pathname, "?email=").concat(emailField.value),
        handleCodeInApp: false
      };

      if (!auth.email || emailField.value !== auth.email) {
        auth.updateEmail(emailField.value).then(function () {
          return auth.sendEmailVerification(actionSettings);
        }).then(updateLoginCardForEmailVerificaion).catch(function (error) {
          handleEmailError(error, emailField);
        });
        return;
      }

      if (!auth.emailVerified) {
        auth.sendEmailVerification(actionSettings).then(updateLoginCardForEmailVerificaion).catch(function (error) {
          handleEmailError(error, emailField);
        });
        return;
      }
    });
  });
};

var updateLoginCardForEmailVerificaion = function updateLoginCardForEmailVerificaion() {
  linearProgress.close();
  window.location.reload();
};

var loginDom = function loginDom() {
  return "\n    <div class='login-container mini' >\n    <div class='login-box mdc-card mdc-card--outlined' >\n        <div class='progress-container'>\n            <div role=\"progressbar\" class=\"mdc-linear-progress mdc-linear-progress--indeterminate mdc-linear-progress--closed\" id='card-progress'>\n                <div class=\"mdc-linear-progress__buffering-dots\"></div>\n                <div class=\"mdc-linear-progress__buffer\"></div>\n                <div class=\"mdc-linear-progress__bar mdc-linear-progress__primary-bar\">\n                <span class=\"mdc-linear-progress__bar-inner\"></span>\n                </div>\n                <div class=\"mdc-linear-progress__bar mdc-linear-progress__secondary-bar\">\n                <span class=\"mdc-linear-progress__bar-inner\"></span>\n                </div>\n            </div>\n        </div>\n        <div class='mdc-card__primary '>\n            <div id='login-header'></div>\n            <div class='meta'>\n                <div class='logo'>\n                    <img src='./img/icon.png' class='logo'>\n                </div>\n                <div class='text-indicator'>\n                    <p class='mdc-typography--headline6 text-center'>Log into Growthfile</p>\n                    \n                </div>\n            </div>\n\n            <div class='login-area'>\n            \n            <div class='input-container'>\n                <div class='phone-number-container'>\n                    ".concat(textFieldTelephone({
    id: 'phone-number-field',
    autocomplete: 'on'
  }), "\n                    <div class=\"mdc-text-field-helper-line\">\n                        <div class=\"mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg\"></div>\n                    </div>\n                    </div>\n                    <div class='pt-10' id='recaptcha-container'></div>\n                \n            </div>\n            \n                <div class='action-buttons'>\n                    <button class='mdc-button mdc-button--raised full-width' id='verify-phone-number'>\n                        <span class='mdc-button__label'>\n                            Log in \n                        </span>\n                    </button>\n                </div>\n                <div class='full-width text-center mt-20 account-create--section'>\n                    <span>Don't have an account ? \n                        <a href='./signup' class='ml-10 sign-up-link'>Sign up</a>\n                    </span>\n                </div>\n            </div>\n        \n        </div>\n        </div>\n        <div id='country-dom'></div>\n    </div>");
};

var updateAuthDom = function updateAuthDom(auth) {
  return " <div class='login-container'>\n    <div class='login-box mdc-card'>\n    <div class='progress-container'>\n    <div role=\"progressbar\" class=\"mdc-linear-progress mdc-linear-progress--indeterminate mdc-linear-progress--closed\">\n    <div class=\"mdc-linear-progress__buffering-dots\"></div>\n    <div class=\"mdc-linear-progress__buffer\"></div>\n    <div class=\"mdc-linear-progress__bar mdc-linear-progress__primary-bar\">\n      <span class=\"mdc-linear-progress__bar-inner\"></span>\n    </div>\n    <div class=\"mdc-linear-progress__bar mdc-linear-progress__secondary-bar\">\n      <span class=\"mdc-linear-progress__bar-inner\"></span>\n    </div>\n  </div>\n    </div>\n    \n    <div class='mdc-card__primary'>\n        <div class='logo'>\n            <img src='".concat(window.location.origin, "/img/icon.png' class='logo'>\n\n        </div>\n        <div class='login-area'>\n        \n        <div class='text-indicator'>\n            <p class='mdc-typography--headline6 text-center mb-0'>Complete your profile</p>\n             <div class='pt-10 text-center'>\n             </div>\n             \n        </div>\n        <div class='input-container'>\n        ").concat(!auth.displayName ? "".concat(textField({
    label: 'Name',
    id: 'name-field',
    type: 'text',
    autocomplete: 'off'
  }), "\n        <div class=\"mdc-text-field-helper-line\">\n             <div class=\"mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg\"></div>\n        </div>") : '', "\n        \n          \n            <div class='pt-20'>\n                ").concat(textField({
    label: 'Email',
    id: 'email-field',
    type: 'email',
    autocomplete: 'off'
  }), "\n                <div class=\"mdc-text-field-helper-line\">\n                    <div class=\"mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg\"></div>\n            </div>\n                </div>\n           \n        </div>\n        <div class='action-buttons'>\n            <div class='actions'>\n                <button class='mdc-button mdc-button--raised' id='update-auth-btn'>\n                    <span class='mdc-button__label'>\n                        UPDATE\n                    </span>\n                </button>\n            </div>\n        </div>\n        </div>\n      \n    </div>\n    </div>\n    </div>");
};

var isValidEmail = function isValidEmail(emailString) {
  return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(emailString);
};

var disabledLoginArea = function disabledLoginArea() {
  document.querySelector('.login-area').classList.add('disabled');
};

var enableLoginArea = function enableLoginArea() {
  document.querySelector('.login-area').classList.remove('disabled');
};

var handleOtp = function handleOtp(confirmResult, el) {
  linearProgress.close();
  el.querySelector('.text-indicator p').textContent = 'OTP has been sent.';
  var backBtn = iconButtonWithLabel('arrow_back', 'Back');
  backBtn.addEventListener('click', function () {
    window.location.reload();
  });
  document.getElementById('login-header').appendChild(backBtn);
  el.querySelector('.input-container').innerHTML = "".concat(textFieldFilled({
    id: 'otp-number-field',
    value: '',
    type: 'number',
    label: 'ENTER OTP'
  }), "\n    <div class=\"mdc-text-field-helper-line\">\n        <div class=\"mdc-text-field-helper-text mdc-text-field-helper-text--validation-msg\"></div>\n    </div>\n    ");
  var otpField = new mdc.textField.MDCTextField(document.getElementById('otp-number-field'));
  var verifyOtpBtn = button('SUBMIT');
  verifyOtpBtn.classList.add('full-width', 'mdc-button--raised');
  verifyOtpBtn.addEventListener('click', function () {
    if (!otpField.value) {
      setHelperInvalid(otpField, 'Invalid OTP');
      return;
    }

    linearProgress.open();
    confirmResult.confirm(otpField.value).then(handleAuthAnalytics).catch(function (error) {
      console.log(error);
      linearProgress.close();
      sendErrorLog({
        message: error.message,
        stack: error.stack
      });

      if (error.code === 'auth/invalid-verification-code') {
        setHelperInvalid(otpField, 'Wrong OTP');
        return;
      }
    });
  });
  document.querySelector('.action-buttons').innerHTML = '';
  document.querySelector('.action-buttons').appendChild(verifyOtpBtn);
};

var handleEmailError = function handleEmailError(error, emailField) {
  linearProgress.close();
  enableLoginArea();
  console.log(error);

  if (error.code === 'auth/requires-recent-login') {
    errorUI(error);
    linearProgress.open();
    setTimeout(signOut, 2000);
    return;
  }

  ;
  setHelperInvalid(emailField, getEmailErrorMessage(error));
  errorUI(error);
};