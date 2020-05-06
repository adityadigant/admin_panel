function createOfficeInit() {

    if(commonDom.progressBar) {
        commonDom.progressBar.open()
      }
    const auth = firebase.auth().currentUser;
    const authProps = {
        displayName: auth.displayName,
        phoneNumber: auth.phoneNumber,
        email: auth.email
    }

    const template = {
        'template': 'office',
        'firstContact': authProps,
        'name': '',
        'registeredOfficeAddress': '',
        'canEdit': true
    }
    history.replaceState(null,'Office','/office')
    document.getElementById('home-login').innerHTML = `

    <div id='office-form'></div>
    `;

    addView(document.getElementById('office-form'), template, authProps);

}

function handleAuthUpdate(authProps) {

    return new Promise(function (resolve, reject) {
        const auth = firebase.auth().currentUser;
        commonDom.progressBar.open();
        const nameProm = auth.displayName ? Promise.resolve() : auth.updateProfile({
            displayName: authProps.displayName
        })
        nameProm
            .then(function () {
                if (auth.email) return Promise.resolve()
                return firebase.auth().currentUser.updateEmail(authProps.email)
            }).then(function () {
                if (auth.emailVerified) return Promise.resolve()
                return firebase.auth().currentUser.sendEmailVerification()
            })
            .then(function () {
                resolve()
            })
            .catch(function (authError) {
                authError.type = 'auth'
                if (authError.code === 'auth/requires-recent-login') return resolve()
                reject(authError)
            })
    })
}






function sendOfficeData(requestBody) {

    linearProgress = commonDom.progressBar;
    linearProgress.open()
    const officeBody = requestBody.office
    handleAuthUpdate(requestBody.auth).then(function () {
            return getLocation()
        }).then(function (geopoint) {
            officeBody.geopoint = geopoint;
            return http('POST', `${appKeys.getBaseUrl()}/api/services/office`, officeBody)
        })
        .then(function () {
            localStorage.setItem('created_office', officeBody.name)

            fbq('trackCustom', 'Office Created')
            analyticsApp.logEvent('office_created', {
                location: officeBody.registeredOfficeAddress
            });
            
            firebase.auth().currentUser.getIdToken(true).then(function(){
                redirect(`/app`);
            }).catch(function(error){
                redirect(`/app`);
            })
        })
        .catch(function (error) {
            linearProgress.close()
            if (error.type === 'geolocation') return handleLocationError(error);
            if (error.type === 'auth') return getEmailErrorMessage(error);
            toggleForm(error.message)
        })
}


function sendSubscriptionData(formData) {
    getLocation().then(function (geopoint) {
        formData.geopoint = geopoint
        http('POST', `${appKeys.getBaseUrl()}/api/services/subscription`, formData).then(function (response) {
            window.location.reload(true)
        }).catch(console.error)
    }).catch(handleLocationError);
}