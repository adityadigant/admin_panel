const form = document.getElementById('manage-form');
const submitBtn = form.querySelector('.form-actionable .mdc-fab--action[type="submit"]')
const addMoreBtn = document.getElementById('add-more');

const init = (office, officeId) => {
    
    window.mdc.autoInit();

    const cardList = [];
    document.querySelectorAll('.user-add--card').forEach(card=>{

        cardList.appendChild(card);
    })



    addMoreBtn.addEventListener('click', (ev) => {
        const card = createUserCard()
        card.querySelector('.remove').addEventListener('click', () => {
            cardList.splice(cardList.indexOf(card), 1)
            card.remove();
        })
        cardList.push(card)
        form.appendChild(card);
    });



    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const arePhoneNumbersValid = cardList.some()
        if (!arePhoneNumbersValid) return

        submitBtn.classList.add('id-progress');

        const users = [];
        cardList.forEach(card => {
            validUsers.push({
                phoneNumber: card.querySelector('.phone-input'),
                displayName: card.querySelector('.name-input'),
                email: card.querySelector('.email-input'),
                isAdmin: card.querySelector('.admin-switch').MDCSwitch.value ? true : false
            })
        })

        http('POST', {
            office,
            users
        }).then(console.log).catch(err => {
            console.error(err)
            submitBtn.classList.remove('id-progress');
        })

    });
}

const checkPhoneNumberValid = (card,iti) => {
    const phoneField = card.querySelector('.phonenumber-field').MDCTextField;
    const iti = phoneFieldInit(phoneField);
    var error = iti.getValidationError();

    if (error !== 0) {
        const message = getPhoneFieldErrorMessage(error);
        setHelperInvalid(phoneField, message);
        return
    }
    if (!iti.isValidNumber()) {
        setHelperInvalid(phoneField, 'Invalid number. Please check again');
        return;
    };
    setHelperValid(phoneField);
    return true
}


const createUserCard = () => {
    const node = document.getElementById('user-card-cone').cloneNode(true);
    node.classList.remove('hidden');
    return node;
}