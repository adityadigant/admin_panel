window.addEventListener('load', function () {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      addLogoutBtn(); // flush stored errors that were logged before auth

      flushStoredErrors();
    }

    initAuthBox(user);
  });
});
var otpContainer = document.querySelector('.otp-container');
/**
 * initialize the auth box.
 * if user is logged out , then show the phonenumber field 
 * for user to perform auth , else remove the phonenumber field. 
 * @param {object} user // firebase auth object
 */

var initAuthBox = function initAuthBox(user) {
  var getStartedBtn = document.getElementById('get-started');
  var phoneNumberField = new mdc.textField.MDCTextField(document.getElementById('phone-number'));
  var iti = phoneFieldInit(phoneNumberField); // firebase.auth().settings.appVerificationDisabledForTesting = true;

  if (!user) {
    document.getElementById('auth-section').classList.remove('hidden'); //  for testing disable recaptcha
    // firebase.auth().settings.appVerificationDisabledForTesting = true

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = handleRecaptcha(getStartedBtn.id);
    }
  } else {
    document.getElementById('auth-secondary--text').textContent = 'Manage your business';
    isElevatedUser().then(function (elevated) {
      if (elevated && getStartedBtn) {
        getStartedBtn.textContent = 'MANAGE NOW';
        return;
      }

      document.getElementById('auth-section').classList.add('hidden');
    }); //user is logged in;
  } // initialize dialog


  var dialog = new mdc.dialog.MDCDialog(document.getElementById('otp-dialog')); //submit otp

  var submitOtpBtn = document.getElementById('submit-otp');
  submitOtpBtn.addEventListener('click', function () {
    handleOtpSumit(submitOtpBtn);
  }); //initialize event listeners on otp input fields;

  otpContainer.addEventListener('keydown', otpKeyDown);
  otpContainer.addEventListener('keyup', otpKeyUp);
  dialog.listen('MDCDialog:closed', function (ev) {
    submitOtpBtn.disabled = false;
    enableOtpContainer();
    getStartedBtn.disabled = false;
  });
  dialog.listen('MDCDialog:opened', function (ev) {
    submitOtpBtn.disabled = true;
    getStartedBtn.disabled = false;
    enableOtpContainer();
  });
  var resendSmsVerificationEl = document.getElementById('resend-sms-verification');
  var changePhoneNumberEl = document.getElementById("change-phone-number"); // resent sms verification

  resendSmsVerificationEl.addEventListener('click', function () {
    resetRecaptcha().then(function () {
      verifyUser(submitOtpBtn.dataset.number, function () {
        dialog.open();
      });
    });
  }); // close dialog, so user can change phone number.
  // remove all references to recaptcha. 

  changePhoneNumberEl.addEventListener('click', function () {
    resetRecaptcha().then(function () {
      dialog.close();
    });
  });
  getStartedBtn.addEventListener('click', function (ev) {
    if (user) {
      handleAuthRedirect();
      return;
    } // validate phone number


    if (!phoneNumberField.value) {
      setHelperInvalid(phoneNumberField, 'Enter your phone number');
      return;
    }

    var error = iti.getValidationError();

    if (error !== 0) {
      var message = getPhoneFieldErrorMessage(error);
      setHelperInvalid(phoneNumberField, message);
      return;
    }

    if (!iti.isValidNumber()) {
      setHelperInvalid(phoneNumberField, 'Invalid number. Please check again');
      return;
    }

    ;
    setHelperValid(phoneNumberField); //get formatted phone number in international format

    var formattedPhoneNumber = iti.getNumber();
    submitOtpBtn.dataset.number = formattedPhoneNumber;
    getStartedBtn.disabled = true;
    verifyUser(formattedPhoneNumber, function () {
      dialog.open();
    });
  });
};

var handleOtpSumit = function handleOtpSumit(submitOtpBtn) {
  var otpVerificationErrorEl = document.querySelector('.otp-verification-failed'); //reset error el

  otpVerificationErrorEl.innerHTML = ''; //disable block until otp verification resolves

  submitOtpBtn.disabled = true;
  disableOtpContainer(); // confirm otp

  window.confirmationResult.confirm(getOtp()).then(function (result) {
    // auth completed. onstatechange listener will fire
    if (result) {
      handleAuthAnalytics(result);
    }

    sendAcqusition().then(handleLoggedIn).catch(handleLoggedIn);
  }).catch(function (error) {
    console.log(error);
    submitOtpBtn.disabled = false;
    enableOtpContainer();

    if (error.code === 'auth/invalid-verification-code') {
      otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> You have entered wrong OTP.</span>';
      return;
    } //resend otp if it expires


    if (error.code === 'auth/code-expired') {
      otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> OTP has expired. <span class="mdc-theme--primary" id="resend-otp-verification-failed"> Send again</span></span>';
      document.getElementById('resend-otp-verification-failed').addEventListener('click', function () {
        resetRecaptcha().then(function () {
          disableOtpContainer();
          submitOtpBtn.disabled = true;
          otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> Sending new OTP </span>';
          verifyUser(submitOtpBtn.dataset.number, function () {
            enableOtpContainer();
            submitOtpBtn.disabled = false;
            otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> New OTP has been sent! </span>';
            setTimeout(function () {
              otpVerificationErrorEl.innerHTML = '';
            }, 2000);
          });
        });
      });
      return;
    }

    sendErrorLog({
      message: errorMessage,
      stack: error.stack
    });
  });
};
/**
 * Reset the recaptcha
 */


var resetRecaptcha = function resetRecaptcha() {
  return new Promise(function (resolve, reject) {
    window.recaptchaVerifier.render().then(function (widgetId) {
      if (widgetId) {
        grecaptcha.reset(widgetId);
      }

      window.confirmationResult = null;
      resolve(true);
    });
  });
};
/**
 * @returns {Number} full 6 digit otp
 */


var getOtp = function getOtp() {
  var otpContainer = document.querySelector('.otp-container');
  if (!otpContainer) return;
  var otp = '';
  otpContainer.querySelectorAll('input').forEach(function (el) {
    otp += el.value;
  });
  console.log(otp);
  return otp;
};
/**
 * enables otp container 
 */


var enableOtpContainer = function enableOtpContainer() {
  otpContainer.classList.remove('disabled');
  document.querySelector('.otp-loader').classList.add('hidden');
  otpContainer.querySelectorAll('input').forEach(function (el) {
    el.value = '';
  });
};
/**
 *  disabled otpContainer.
 */


var disableOtpContainer = function disableOtpContainer() {
  otpContainer.classList.add('disabled');
  document.querySelector('.otp-loader').classList.remove('hidden');
};
/**
 *  create the view for entering otp;
 *  @returns {DocumentFragment}
 */


var otpFlow = function otpFlow() {
  var frag = document.createDocumentFragment();
  var div = createElement('div', {
    className: 'otp-container'
  });
  /** 6 inputs fields because otp length is 6 digits */

  for (var i = 0; i < 6; i++) {
    var disabled = true;

    if (i == 0) {
      disabled = false;
    }

    var tf = textFieldOutlinedWithoutLabel({
      type: 'tel',
      required: true,
      disabled: disabled,
      maxLength: "1",
      size: "1",
      min: "0",
      max: "9",
      pattern: "[0-9]{1}"
    });
    div.appendChild(tf.root);
  }

  div.addEventListener('keydown', otpKeyDown);
  div.addEventListener('keyup', otpKeyUp);
  var resendCont = createElement('div', {
    className: 'resend-box text-center',
    textContent: "Didn't receive the code ?"
  });
  var resend = createElement('div', {
    className: 'mdc-theme--secondary',
    textContent: 'Send code again'
  });
  /**
   * resent otp code
   */

  resend.addEventListener('click', function (e) {});
  resendCont.appendChild(resend);
  frag.appendChild(div);
  frag.appendChild(resendCont);
  return frag;
};
/**
 *  Handles keyDown event for otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */


var otpKeyDown = function otpKeyDown(e) {
  var key = e.which;
  if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) return true;
  e.preventDefault();
  return false;
};
/**
 * Go to next otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */


var otpKeyUp = function otpKeyUp(e) {
  var key = e.which;
  var target = e.target; // get next parent sibling

  var parentSibling = target.parentElement.nextElementSibling; //if key is backspace , make parent sibling previous one

  if (key == 8) {
    parentSibling = target.parentElement.previousElementSibling;
  }

  console.log(parentSibling);

  if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) {
    // focus next element after sometime to handle fast typing
    setTimeout(function () {
      if (parentSibling) {
        parentSibling.classList.remove('mdc-text-field--disabled');
        parentSibling.querySelector('input').removeAttribute('disabled');
        parentSibling.querySelector('input').focus();
      }

      ;
      document.getElementById('submit-otp').disabled = !otpBoxesFilled();
    }, 300);
    return true;
  }

  e.preventDefault();
  return false;
};
/**
 * checks if all otp input fields are fileld with value
 * @returns {Boolean}
 */


var otpBoxesFilled = function otpBoxesFilled() {
  var container = document.querySelector('.otp-container');
  if (!container) return;
  var filled = true;
  container.querySelectorAll('input').forEach(function (el) {
    if (!el.value) {
      filled = false;
      return;
    }
  });
  return filled;
};
/**
 * verify user via recaptcha check.
 * after verification check, otp will be send to phoneNumber
 * @param {string} phoneNumber 
 * @param {string} buttonId // button id for recaptcha
 * @param {Function} callback // callback when recaptcha is verified
 */


var verifyUser = function verifyUser(phoneNumber, callback) {
  //Send a verification code to the user's phone
  firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier).then(function (confirmationResult) {
    console.log('recaptch solved');
    window.confirmationResult = confirmationResult;
    callback();
  }).catch(function (error) {
    console.log(error); //in case of error reset the recaptcha

    window.recaptchaVerifier.render().then(function (widgetId) {
      grecaptcha.reset(widgetId);
    });
  });
};