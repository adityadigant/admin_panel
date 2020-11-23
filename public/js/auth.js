window.addEventListener('load', () => {
    const searchParams = new URLSearchParams(window.location.search);
    const box = document.getElementById('home-login')
    box.classList.remove('hidden')
    if (!searchParams.has('signup')) {
        initializeLogIn(box)
        return
    }
    const authListener = firebase.auth().onAuthStateChanged(function (user) {
        if (!user) {
            authListener()
            return initAuthBox();
        }
        flushStoredErrors();
        sendAcqusition().then(handleLoggedIn).catch(err => {
            redirect('/admin/index.html')
        })
    });
})

const otpContainer = document.querySelector('.otp-container');


/**
 * initialize the auth box.
 * @param {object} user // firebase auth object
 */
const initAuthBox = () => {
    const getStartedBtn = document.getElementById('get-started');
    document.getElementById("login--login-box").addEventListener("click",()=>{
        history.pushState('signup',null,window.location.pathname)
        // redirect(`${window.location.pathname}index.html?signup=1`)
        window.location.reload();
    })
    const phoneNumberField = new mdc.textField.MDCTextField(document.getElementById('phone-number'));
    const iti = phoneFieldInit(phoneNumberField);
    // firebase.auth().settings.appVerificationDisabledForTesting = true;
    document.getElementById('auth-section').classList.remove('hidden');
    //  for testing disable recaptcha
    // firebase.auth().settings.appVerificationDisabledForTesting = true
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = handleRecaptcha(getStartedBtn.id);
    }
    // initialize dialog
    const dialog = new mdc.dialog.MDCDialog(document.getElementById('otp-dialog'));
    //submit otp
    const submitOtpBtn = document.getElementById('submit-otp');
    submitOtpBtn.addEventListener('click', function () {
        handleOtpSumit(submitOtpBtn)
    });

    //initialize event listeners on otp input fields;
    otpContainer.addEventListener('keydown', otpKeyDown)
    otpContainer.addEventListener('keyup', otpKeyUp);

    dialog.listen('MDCDialog:closed', ev => {
        submitOtpBtn.disabled = false;
        enableOtpContainer();
        getStartedBtn.disabled = false;
    });


    dialog.listen('MDCDialog:opened', ev => {
        submitOtpBtn.disabled = true;
        getStartedBtn.disabled = false;
        enableOtpContainer();
    });

    const resendSmsVerificationEl = document.getElementById('resend-sms-verification');
    const changePhoneNumberEl = document.getElementById("change-phone-number");

    // resent sms verification
    resendSmsVerificationEl.addEventListener('click', () => {
        resetRecaptcha().then(() => {
            verifyUser(submitOtpBtn.dataset.number, function () {
                dialog.open();
            });
        })
    })

    // close dialog, so user can change phone number.
    // remove all references to recaptcha. 
    changePhoneNumberEl.addEventListener('click', () => {
        resetRecaptcha().then(function () {
            dialog.close();
        })
    });

    getStartedBtn.addEventListener('click', (ev) => {

        // validate phone number
        if (!phoneNumberField.value) {
            setHelperInvalid(phoneNumberField, 'Enter your phone number');
            return
        }
        var error = iti.getValidationError();
        if (error !== 0) {
            const message = getPhoneFieldErrorMessage(error);
            setHelperInvalid(phoneNumberField, message);
            return
        }
        if (!iti.isValidNumber()) {
            setHelperInvalid(phoneNumberField, 'Invalid number. Please check again');
            return;
        };
        setHelperValid(phoneNumberField);

        //get formatted phone number in international format
        const formattedPhoneNumber = iti.getNumber()
        submitOtpBtn.dataset.number = formattedPhoneNumber;
        getStartedBtn.disabled = true;
        verifyUser(formattedPhoneNumber, function () {
            dialog.open();
        });
    });

}

const handleOtpSumit = (submitOtpBtn) => {
    const otpVerificationErrorEl = document.querySelector('.otp-verification-failed')
    //reset error el
    otpVerificationErrorEl.innerHTML = ''

    //disable block until otp verification resolves
    submitOtpBtn.disabled = true;
    disableOtpContainer();

    // confirm otp
    window
        .confirmationResult
        .confirm(getOtp()).then(function (result) {
            // auth completed. onstatechange listener will fire
            if (result) {
                handleAuthAnalytics(result);
            }
            debugger
            sendAcqusition().then(handleLoggedIn).catch(handleLoggedIn);
        })
        .catch(function (error) {
            console.log(error);
            submitOtpBtn.disabled = false;
            enableOtpContainer();

            if (error.code === 'auth/invalid-verification-code') {
                otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> You have entered wrong OTP.</span>';
                return
            }
            //resend otp if it expires
            if (error.code === 'auth/code-expired') {
                otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> OTP has expired. <span class="mdc-theme--primary" id="resend-otp-verification-failed"> Send again</span></span>';

                document.getElementById('resend-otp-verification-failed').addEventListener('click', () => {
                    resetRecaptcha().then(function () {
                        disableOtpContainer();
                        submitOtpBtn.disabled = true;
                        otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> Sending new OTP </span>';
                        verifyUser(submitOtpBtn.dataset.number, function () {
                            enableOtpContainer();
                            submitOtpBtn.disabled = false;
                            otpVerificationErrorEl.innerHTML = '<span class="inline-flex"><i class="material-icons mr-10">info</i> New OTP has been sent! </span>';
                            setTimeout(() => {
                                otpVerificationErrorEl.innerHTML = '';
                            }, 2000)
                        })
                    })
                })
                return;
            }
            sendErrorLog({
                message: errorMessage,
                stack: error.stack
            })
        })
}

/**
 * Reset the recaptcha
 */
const resetRecaptcha = () => {
    return new Promise((resolve, reject) => {
        window.recaptchaVerifier.render().then(function (widgetId) {
            if (widgetId) {
                grecaptcha.reset(widgetId);
            }
            window.confirmationResult = null;
            resolve(true)
        });
    })
}

/**
 * @returns {Number} full 6 digit otp
 */
const getOtp = () => {
    const otpContainer = document.querySelector('.otp-container');
    if (!otpContainer) return;
    let otp = '';
    otpContainer.querySelectorAll('input').forEach(el => {
        otp += el.value
    })
    console.log(otp);
    return otp;
}

/**
 * enables otp container 
 */
const enableOtpContainer = () => {
    otpContainer.classList.remove('disabled');
    document.querySelector('.otp-loader').classList.add('hidden');
    otpContainer.querySelectorAll('input').forEach(el => {
        el.value = '';
    })
}

/**
 *  disabled otpContainer.
 */
const disableOtpContainer = () => {
    otpContainer.classList.add('disabled');
    document.querySelector('.otp-loader').classList.remove('hidden');
}






/**
 *  create the view for entering otp;
 *  @returns {DocumentFragment}
 */
const otpFlow = () => {

    const frag = document.createDocumentFragment();
    const div = createElement('div', {
        className: 'otp-container'
    })

    /** 6 inputs fields because otp length is 6 digits */
    for (let i = 0; i < 6; i++) {
        let disabled = true;
        if (i == 0) {
            disabled = false
        }
        const tf = textFieldOutlinedWithoutLabel({
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

    div.addEventListener('keydown', otpKeyDown)
    div.addEventListener('keyup', otpKeyUp);

    const resendCont = createElement('div', {
        className: 'resend-box text-center',
        textContent: "Didn't receive the code ?"
    })
    const resend = createElement('div', {
        className: 'mdc-theme--secondary',
        textContent: 'Send code again'
    })
    /**
     * resent otp code
     */
    resend.addEventListener('click', (e) => {

    })
    resendCont.appendChild(resend);
    frag.appendChild(div)
    frag.appendChild(resendCont);
    return frag;
}

/**
 *  Handles keyDown event for otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */
const otpKeyDown = (e) => {
    const key = e.which;

    if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) return true
    e.preventDefault();
    return false;
}
/**
 * Go to next otp input. Allow only numeric characters ,
 *  enter & backspace
 * @param {Event} e 
 */
const otpKeyUp = (e) => {
    const key = e.which;
    const target = e.target;
    // get next parent sibling
    let parentSibling = target.parentElement.nextElementSibling;

    //if key is backspace , make parent sibling previous one
    if (key == 8) {
        parentSibling = target.parentElement.previousElementSibling;
    }
    console.log(parentSibling)
    if (/^[0-9]*$/.test(e.key) || key == 8 || key == 13) {
        // focus next element after sometime to handle fast typing
        setTimeout(() => {

            if (parentSibling) {
                parentSibling.classList.remove('mdc-text-field--disabled')
                parentSibling.querySelector('input').removeAttribute('disabled');
                parentSibling.querySelector('input').focus();
            };

            document.getElementById('submit-otp').disabled = !otpBoxesFilled()
        }, 300)

        return true
    }

    e.preventDefault();
    return false;
}

/**
 * checks if all otp input fields are fileld with value
 * @returns {Boolean}
 */
const otpBoxesFilled = () => {
    const container = document.querySelector('.otp-container');
    if (!container) return;
    let filled = true
    container.querySelectorAll('input').forEach(el => {
        if (!el.value) {
            filled = false;
            return
        }
    })
    return filled;
};



/**
 * verify user via recaptcha check.
 * after verification check, otp will be send to phoneNumber
 * @param {string} phoneNumber 
 * @param {string} buttonId // button id for recaptcha
 * @param {Function} callback // callback when recaptcha is verified
 */
const verifyUser = (phoneNumber, callback) => {

    //Send a verification code to the user's phone
    firebase
        .auth()
        .signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then(function (confirmationResult) {
            console.log('recaptch solved')
            window.confirmationResult = confirmationResult;
            callback();
        })
        .catch(function (error) {
            console.log(error);
            //in case of error reset the recaptcha
            window.recaptchaVerifier.render().then(function (widgetId) {
                grecaptcha.reset(widgetId);
            });
        })
}