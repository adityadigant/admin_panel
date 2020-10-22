

function textField(attr) {
  return `<div class="mdc-text-field mdc-text-field--outlined ${attr.label ? '' :'mdc-text-field--no-label'} full-width ${attr.leadingIcon ? 'mdc-text-field--with-leading-icon' :''} ${attr.trailingIcon ? 'mdc-text-field--with-trailing-icon' :''} ${attr.disabled ? 'mdc-text-field--disabled' :''}" id='${attr.id}'>
  ${attr.leadingIcon ? `<i class="material-icons mdc-text-field__icon mdc-text-field__icon--leading" tabindex="0" role="button">${attr.leadingIcon}</i>`:''}
  ${attr.trailingIcon ? `<i class="material-icons mdc-text-field__icon mdc-text-field__icon--trailing" tabindex="0" role="button" >${attr.trailingIcon}</i>` :''}
  <input autocomplete=${attr.autocomplete ? attr.autocomplete : 'off'} type="${attr.type || 'text'}" class="mdc-text-field__input" value="${attr.value || ''}"  ${attr.required ? 'required':''}  ${attr.disabled ? 'disabled':''} ${attr.readonly ? 'readonly':''}>
  
  <div class="mdc-notched-outline">
    <div class="mdc-notched-outline__leading"></div>
    ${attr.label ? `<div class="mdc-notched-outline__notch">
    <label  class="mdc-floating-label">${attr.label}</label>
  </div>` :''}
    
    <div class="mdc-notched-outline__trailing"></div>
  </div>
</div>`
}


const textFieldTelephone = (attr) => {
  return `<div class="mdc-text-field mdc-text-field--outlined mdc-text-field--no-label pl-0 pr-0" id=${attr.id}>
    <input class="mdc-text-field__input" id="text-field-hero-input" type='tel' value="${attr.value || ''}" required autocomplete=${attr.autocomplete}>
    <div class="mdc-notched-outline">
      <div class="mdc-notched-outline__leading"></div>
      <div class="mdc-notched-outline__trailing"></div>
    </div>
  </div>`
}

const textFieldFilled = (attr) => {
  return `<div class="mdc-text-field mdc-text-field--filled" id=${attr.id}>
    <span class="mdc-text-field__ripple"></span>
    <input class="mdc-text-field__input" id="text-field-hero-input" value="${attr.value|| ''}" type=${attr.type} autocomplete>
    <label for="text-field-hero-input" class="mdc-floating-label">${attr.label}</label>
    <div class="mdc-line-ripple"></div>
  </div>`
}


const button = (label, id = '') => {
  const button = createElement('button', {
    className: 'mdc-button',
    id: id
  })
  const ripple = createElement('div',{
    className:'mdc-button__ripple'
  })
  const span = createElement('span', {
    className: 'mdc-button__label',
    textContent: label
  })
  button.appendChild(ripple)
  button.appendChild(span)
  new mdc.ripple.MDCRipple(button);
  return button;
}

const iconButton = (icon, id) => {
  const button = createElement('button', {
    className: 'mdc-icon-button material-icons',
    textContent: icon,
    id: id
  })
  // new mdc.ripple.MDCRipple(button);
  return button;
}

const iconButtonWithLabel = (icon, label, id) => {
  const button = createElement('button', {
    className: 'mdc-button mdc-button--icon',
    id: id
  })
  const iconEl = createElement('i', {
    className: 'material-icons',
    textContent: icon
  })
  const span = createElement('span', {
    className: 'mdc-button-label',
    textContent: label
  })
  button.appendChild(iconEl)
  button.appendChild(span);
  new mdc.ripple.MDCRipple(button);
  return button;
}

const getPhoneFieldErrorMessage = (code) => {
  let message = ''
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
          message = 'Invalid Number'
          break;

      default:
          message = ''
          break
  }
  return message;
}


const insertAfter = (newNode, referenceNode) => {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function actionButton(name, id = '') {
  const actionContainer = createElement('div', {
    className: 'action-button-container'
  })
  const submitContainer = createElement('div', {
    className: 'submit-button-cont'
  })
  const btn = button(name, id);
  btn.classList.add('mdc-button--raised', 'submit-btn');
  new mdc.ripple.MDCRipple(btn);
  submitContainer.appendChild(btn);
  actionContainer.appendChild(submitContainer);
  return actionContainer;

}

