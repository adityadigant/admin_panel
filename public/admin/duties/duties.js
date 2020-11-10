const createDuty = document.getElementById("create-duty");
const editIcon = document.getElementById("edit-location")
const ul = document.getElementById("duties-list");
const formHeading = document.getElementById('form-heading');
const dutiesCardContainer = document.getElementById('duty-cards--container');

const init = (office, officeId) => {
    const search = new URLSearchParams(window.location.search);
    const canEdit = search.get("canEdit");
    const id = search.get("id");
    const dutyLocation = search.get("location");

    if (!id) {
        window.alert("No location found");
        return
    }

    formHeading.textContent = dutyLocation;

    if (canEdit === "true" && id) {
        editIcon.classList.remove("hidden");
        editIcon.href = './manageDuty.html?id=' + id + '&location=' + dutyLocation;
    }
    createDuty.href = './manageDuty.html?location=' + dutyLocation;

    window
        .database
        .transaction("locations")
        .objectStore("locations")
        .get(dutyLocation)
        .onsuccess = function (e) {
            const record = e.target.result;
            const duties = record.duties || [];
            const sorted = duties.sort((a, b) => b.timestamp - a.timestamp);

            sorted.forEach(duty => {
                dutiesCardContainer.appendChild(createDutyBox(duty, officeId,dutyLocation))
            });

            http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/location?location=${dutyLocation}`).then(res => {
                window
                    .database
                    .transaction("locations", 'readwrite')
                    .objectStore("locations").put(res.results[0]);
                const freshDuties = res.results[0].duties || []
                freshDuties.sort((a, b) => b.timestamp - a.timestamp).forEach(duty => {
                    if (document.getElementById(duty.id)) {
                        document.getElementById(duty.id).remove()
                    }
                    dutiesCardContainer.appendChild(createDutyBox(duty, officeId,dutyLocation))
                })
            })
        }
}


const createDutyBox = (duty, officeId,dutyLocation) => {

    const clone = document.getElementById('clone-node').cloneNode(true);
    clone.querySelector('.edit-duty').href = `./manageDuty?id=${duty.id}&location=${dutyLocation}`
    clone.querySelector('.duty-start').textContent = formatDutyTime(duty.startTime);
    clone.querySelector('.duty-end').textContent = formatDutyTime(duty.endTime)

    const supervisorNumber = duty.supervisor ? duty.supervisor.value : '';
    if (!supervisorNumber) {
        clone.querySelector('.supervisor-list').classList.add('hidden');
    }
    duty.assignees.forEach(assignee => {
        const chip = createUserChip(assignee,true);
        if (assignee.phoneNumber === supervisorNumber) {
            clone.querySelector('.supervisor-chipset').appendChild(chip)
        } else {
            clone.querySelector('.employee-chipset').appendChild(chip);
        }
    });
    const showMoreCont = clone.querySelector('.show-more-duty');
    let isOpen = false;
    clone.querySelector('.show-more').addEventListener('click', (ev) => {
        showMoreCont.classList.toggle('hidden');
        isOpen = !isOpen;


        if(isOpen)  {
            ev.currentTarget.textContent = 'Show less'
            getActivity(duty.id).then(activity => {
                if (activity) {
                    showDutyMetaDetails(clone, activity)
                }
    
                http('GET', `${appKeys.getBaseUrl()}/api/office/${officeId}/activity/${duty.id}`).then(res => {
                    putActivity(res).then((activity) => {
                        showDutyMetaDetails(clone, activity)
                    })
                })
            })
            return
        }

        ev.currentTarget.textContent = 'Show more'
      
    })
    clone.id = duty.id
    clone.classList.remove('hidden');
    return clone;
}

const showDutyMetaDetails = (clone, activity) => {
    const checkins = activity.checkins || [];

    const filtered = checkins.sort((a, b) => b.timestamp - a.timestamp).filter(checkin => checkin.attachment['Photo'].value)
    filtered.forEach(checkin => {
        clone.querySelector('.photos ul').appendChild(createImageLi(checkin.attachment['Photo'].value, checkin.timestamp))
    });

    const filteredProduct = activity.attachment['Products'].value.filter(product=> product.name);
    if(!filteredProduct.length) {
        clone.querySelector('.list.product-list').classList.add('hidden')
        return
    };

    filteredProduct.forEach(product => {
        if (clone.querySelector(`[data-name="${product.name}"]`)) {
            clone.querySelector(`[data-name="${product.name}"]`).remove();
        }
        clone.querySelector('.product-ul').appendChild(dutyProductLi(product))
    })

}

const dutyProductLi = (product) => {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })
    li.dataset.name = product.name
    li.innerHTML = `
        <span class="mdc-list-item__ripple"></span>
        <span class="mdc-list-item__text">
            <span class="mdc-list-item__primary-text">${product.name}</span>
            <span class="mdc-list-item__secondary-text">Quantity: ${product.quantity}</span>
        </span>
        <div class="mdc-list-item__meta">
            ${formatMoney(String(product.rate))}
        </div>`
    new mdc.ripple.MDCRipple(li)
    return li
}

const createImageLi = (url, time) => {
    const li = createElement('li', {
        className: 'mdc-image-list__item'
    });
    li.innerHTML = `<div class="mdc-image-list__image-aspect-container">
    <img class="mdc-image-list__image" src="${url}">
  </div>
  <div class="mdc-image-list__supporting">
    <span class="mdc-image-list__label">${moment(time).format('HH:mm')}</span>
  </div>`
}

const createDutyAssignee = (assignee) => {
    const li = createElement('li', {
        className: 'mdc-list-item'
    })

    const img = createElement('img', {
        src: assignee.photoURL || '../../person.png',
        className: 'mdc-list-item__graphic'
    })
    const span = createElement('span', {
        textContent: assignee.displayName
    })
    li.appendChild(img);
    li.appendChild(span);
    return li;
}