window.addEventListener('load', function () {
  if (!window.commonDom) {
    window.commonDom = {};
  }

  loadPartial('/partials/footer.html').then(function (footer) {
    document.querySelector('footer').innerHTML = footer;
  });

  if (window.mdc) {
    window.mdc.autoInit();
  }

  if (document.querySelector('.mdc-linear-progress')) {
    commonDom.progressBar = new mdc.linearProgress.MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
  }

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      addLogoutBtn(); // flush stored errors that were logged before auth

      flushStoredErrors();
    }

    ;
  });
});
/**
 * fetches the partial html document. 
 * source iS the url of the document
 * @param {object} source 
 * 
 */

var loadPartial = function loadPartial(source) {
  if (window.location.pathname === '/join') return Promise.resolve('');
  return new Promise(function (resolve, reject) {
    //check if browser supports fetch
    if (window.fetch) {
      fetch(source).then(function (response) {
        return response.text();
      }).then(resolve).catch(reject);
      return;
    } // use  XMLHttpRequest() if fetch is not supported


    var request = new XMLHttpRequest();
    request.open('GET', source);

    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        resolve(request.responseText);
        return;
      }

      reject(request);
    };

    request.send();
  });
};