var phoneFieldInit = function phoneFieldInit(numberField, dropEl) {
  var input = numberField.input_;
  return intlTelInput(input, {
    initialCountry: "IN",
    formatOnDisplay: true,
    separateDialCode: true,
    dropdownContainer: dropEl || document.getElementById('country-dom')
  });
};

function textField(attr) {
  return "<div class=\"mdc-text-field mdc-text-field--outlined ".concat(attr.label ? '' : 'mdc-text-field--no-label', " full-width ").concat(attr.leadingIcon ? 'mdc-text-field--with-leading-icon' : '', " ").concat(attr.trailingIcon ? 'mdc-text-field--with-trailing-icon' : '', " ").concat(attr.disabled ? 'mdc-text-field--disabled' : '', "\" id='").concat(attr.id, "'>\n  ").concat(attr.leadingIcon ? "<i class=\"material-icons mdc-text-field__icon mdc-text-field__icon--leading\" tabindex=\"0\" role=\"button\">".concat(attr.leadingIcon, "</i>") : '', "\n  ").concat(attr.trailingIcon ? "<i class=\"material-icons mdc-text-field__icon mdc-text-field__icon--trailing\" tabindex=\"0\" role=\"button\" >".concat(attr.trailingIcon, "</i>") : '', "\n  <input autocomplete=").concat(attr.autocomplete ? attr.autocomplete : 'off', " type=\"").concat(attr.type || 'text', "\" class=\"mdc-text-field__input\" value=\"").concat(attr.value || '', "\"  ").concat(attr.required ? 'required' : '', "  ").concat(attr.disabled ? 'disabled' : '', " ").concat(attr.readonly ? 'readonly' : '', ">\n  \n  <div class=\"mdc-notched-outline\">\n    <div class=\"mdc-notched-outline__leading\"></div>\n    ").concat(attr.label ? "<div class=\"mdc-notched-outline__notch\">\n    <label  class=\"mdc-floating-label\">".concat(attr.label, "</label>\n  </div>") : '', "\n    \n    <div class=\"mdc-notched-outline__trailing\"></div>\n  </div>\n</div>");
}

var textFieldTelephone = function textFieldTelephone(attr) {
  return "<div class=\"mdc-text-field mdc-text-field--outlined mdc-text-field--no-label pl-0 pr-0\" id=".concat(attr.id, ">\n    <input class=\"mdc-text-field__input\" id=\"text-field-hero-input\" type='tel' value=\"").concat(attr.value || '', "\" required autocomplete=").concat(attr.autocomplete, ">\n    <div class=\"mdc-notched-outline\">\n      <div class=\"mdc-notched-outline__leading\"></div>\n      <div class=\"mdc-notched-outline__trailing\"></div>\n    </div>\n  </div>");
};

var textFieldFilled = function textFieldFilled(attr) {
  return "<div class=\"mdc-text-field mdc-text-field--filled\" id=".concat(attr.id, ">\n    <span class=\"mdc-text-field__ripple\"></span>\n    <input class=\"mdc-text-field__input\" id=\"text-field-hero-input\" value=\"").concat(attr.value || '', "\" type=").concat(attr.type, " autocomplete>\n    <label for=\"text-field-hero-input\" class=\"mdc-floating-label\">").concat(attr.label, "</label>\n    <div class=\"mdc-line-ripple\"></div>\n  </div>");
};

var button = function button(label) {
  var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var button = createElement('button', {
    className: 'mdc-button',
    id: id
  });
  var ripple = createElement('div', {
    className: 'mdc-button__ripple'
  });
  var span = createElement('span', {
    className: 'mdc-button__label',
    textContent: label
  });
  button.appendChild(ripple);
  button.appendChild(span);
  new mdc.ripple.MDCRipple(button);
  return button;
};

var iconButton = function iconButton(icon, id) {
  var button = createElement('button', {
    className: 'mdc-icon-button material-icons',
    textContent: icon,
    id: id
  }); // new mdc.ripple.MDCRipple(button);

  return button;
};

var iconButtonWithLabel = function iconButtonWithLabel(icon, label, id) {
  var button = createElement('button', {
    className: 'mdc-button mdc-button--icon',
    id: id
  });
  var iconEl = createElement('i', {
    className: 'material-icons',
    textContent: icon
  });
  var span = createElement('span', {
    className: 'mdc-button-label',
    textContent: label
  });
  button.appendChild(iconEl);
  button.appendChild(span);
  new mdc.ripple.MDCRipple(button);
  return button;
};

var getPhoneFieldErrorMessage = function getPhoneFieldErrorMessage(code) {
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
    case 5:
      message = 'Invalid Number';
      break;

    default:
      message = '';
      break;
  }

  return message;
};

var insertAfter = function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
};

function actionButton(name) {
  var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  var actionContainer = createElement('div', {
    className: 'action-button-container'
  });
  var submitContainer = createElement('div', {
    className: 'submit-button-cont'
  });
  var btn = button(name, id);
  btn.classList.add('mdc-button--raised', 'submit-btn');
  new mdc.ripple.MDCRipple(btn);
  submitContainer.appendChild(btn);
  actionContainer.appendChild(submitContainer);
  return actionContainer;
}