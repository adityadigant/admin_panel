import {
    MDCCheckbox
} from "@material/checkbox";
import {
    MDCTabBar
} from "@material/tab-bar";
import {
    MDCIconButtonToggle
} from "@material/icon-button";
import * as firebase from "firebase";
import { MDCTextField } from "@material/textfield";
import {phoneFieldInit} from './phoneNumber';

export const signUp = (auth) => {
    console.log(auth)
    document.body.innerHTML = signUpView();
    const menu = new MDCIconButtonToggle(document.getElementById('menu'))
    menu.listen('MDCIconButtonToggle:change', function (event) {
        if (event.detail.isOn) {
            document.getElementById('mobile-navigation-drawer').classList.remove("hidden")
            return;
        }
        document.getElementById('mobile-navigation-drawer').classList.add("hidden")

    })
    const navigationDrawer = new MDCTabBar(document.querySelector('#mobile-navigation-drawer .mdc-tab-bar'))
    navigationDrawer.listen('MDCTabBar:activated', function (e) {
        console.log(e);
        [].map.call(document.querySelectorAll('.tab-content-drawer'), function (el) {
            el.classList.add('hidden');
            document.getElementById('tab-content-drawer-' + e.detail.index).classList.remove(
                'hidden');
        })
    });
    navigationDrawer.activateTab(0);
    const inputs = {};
    [].map.call(document.querySelectorAll('.mdc-text-field'),function(el){
        const textField = new MDCTextField(el);
        inputs[el.id] = textField;
        if(el.querySelector('input').type === 'tel') {
            const phoneField = phoneFieldInit(textField)
        }
    })
    console.log(inputs)
    const checkbox = new MDCCheckbox(document.getElementById('admin-checkbox'))
    checkbox.listen('change', function (event) {
        if (checkbox.checked) {
            inputs['company-admin-1-name'].value = auth.displayName;
            inputs['company-admin-1-email'].value = auth.email;
            inputs['company-admin-1-phonenumber'].value = auth.phoneNumber;
        } else {
            inputs['company-admin-1-name'].value =  inputs['company-admin-1-email'].value = inputs['company-admin-1-phonenumber'].value = "";
           
        }
    })
    initAddressField(inputs['company-location'])
}


const initAddressField = (textField) => {

    const autocomplete = new google.maps.places.Autocomplete(textField.input_);
    console.log(autocomplete)
    google.maps.event.addListener(autocomplete, 'place_changed', function (event) {
        const place = autocomplete.getPlace();
        console.log(place)
        textField.root_.dataset.latitude = place.geometry.location.lat();
        textField.root_.dataset.longitude = place.geometry.location.lng();
        textField.root_.dataset.location = place.name;
        textField.root_.dataset.address = place.formatted_address;
    });
}




const signUpView = () => {
    return ` <header class="mdc-top-app-bar" data-mdc-auto-init="MDCTopAppBar">
    <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">

            <a class="mdc-top-app-bar__action-item mdc-icon-button icon-expand" aria-label="logo"
                href="javascript:window.location = window.location.origin">
                <img src="../../img/icon.png" id="header-logo">
            </a>
            <span class="mdc-top-app-bar__title">
                <strong>GROWTH</strong>FILE
            </span>
            <div class="growthfile-resources header-actionable">

                <button class="mdc-button mdc-top-app-bar__action-item" id='products-btn'>
                    Our products
                </button>
                <button class="mdc-button mdc-top-app-bar__action-item" id='company-btn'>
                    Our company
                </button>
            </div>
        </section>
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" role="toolbar">


            <a class="mdc-top-app-bar__action-item mdc-button" aria-label="log-in" data-mdc-auto-init="MDCRipple"
                href="./index.html"> Log in
            </a>
            <a class="mdc-top-app-bar__action-item mdc-button mdc-theme--secondary-bg mdc-theme--primary"
                aria-label="log-in" data-mdc-auto-init="MDCRipple" href="./index.html"> Sign up
            </a>

            <div class="header-actionable">

                <button id="menu"
                    class="mdc-icon-button mdc-top-app-bar__action-item mdc-icon-button hamburger-menu"
                    aria-label="menu" aria-hidden="true" aria-pressed="false">
                    <i class="material-icons mdc-icon-button__icon mdc-icon-button__icon--on">clear</i>
                    <i class="material-icons mdc-icon-button__icon">menu</i>
                </button>

            </div>

        </section>
    </div>
    <div class="mobile-growthfile-resources resources hidden mdc-layout-grid" id='mobile-navigation-drawer'>
        
        <div class="mdc-tab-bar" role="tablist" data-mdc-auto-init="MDCTabBar">
            <div class="mdc-tab-scroller">
                <div class="mdc-tab-scroller__scroll-area">
                    <div class="mdc-tab-scroller__scroll-content">
                        <button class="mdc-tab mdc-tab--active" role="tab" aria-selected="true" tabindex="0">
                            <span class="mdc-tab__content">

                                <span class="mdc-tab__text-label">Our Products</span>
                            </span>
                            <span class="mdc-tab-indicator mdc-tab-indicator--active">
                                <span
                                    class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                            </span>
                            <span class="mdc-tab__ripple"></span>
                        </button>

                        <button class="mdc-tab" role="tab" aria-selected="false" tabindex="-1">
                            <span class="mdc-tab__content">
                                <span class="mdc-tab__text-label">Our Company</span>
                            </span>
                            <span class="mdc-tab-indicator">
                                <span
                                    class="mdc-tab-indicator__content mdc-tab-indicator__content--underline"></span>
                            </span>
                            <span class="mdc-tab__ripple"></span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="tab-content-drawer-0" class="tab-content-drawer">
            <ul class="mdc-list">
                <a class="mdc-list-item mdc-typography--headline5" href="./learn-more-payroll.html">
                    Payroll
                    <span class="mdc-list-item__meta material-icons"> arrow_right</span>
                </a>
                <a class="mdc-list-item mdc-typography--headline5" href="./learn-more-reim.html">
                    Reimbursements
                    <span class="mdc-list-item__meta material-icons">arrow_right</span>
                </a>
            </ul>
        </div>
        <div id="tab-content-drawer-1" class="hidden tab-content-drawer">
            <ul class="mdc-list">
                <a class="mdc-list-item mdc-typography--headline5" href="./placeholder.html">
                    About us
                    <span class="mdc-list-item__meta material-icons"> arrow_right</span>
                </a>
                <a class="mdc-list-item mdc-typography--headline5" href="./placeholder.html">
                    How Growthfile works
                    <span class="mdc-list-item__meta material-icons">arrow_right</span>
                </a>
                <a class="mdc-list-item mdc-typography--headline5" href="https://angel.co/company/growthfile/jobs" target="_blank">

                    Careers
                    <span class="mdc-list-item__meta material-icons">arrow_right</span>
                </a>
            </ul>
        </div>
    </div>
    <div class="desktop-growthfile-resources resources hidden">
        <div class="mdc-layout-grid">
            <div  id='desktop-navigation-drawer-company' class="hidden">
                <div class="close-desktop-navigation">
                    <i class="material-icons">clear</i>
                </div>
                
                    <ul class="mdc-list">
                            <a class="mdc-list-item mdc-typography--headline5" href="./placeholder.html">
                                About us
                                <span class="mdc-list-item__meta material-icons"> arrow_right</span>
                            </a>
                            <a class="mdc-list-item mdc-typography--headline5" href="./placeholder.html">
                                How Growthfile works
                                <span class="mdc-list-item__meta material-icons">arrow_right</span>
                            </a>
                            <a class="mdc-list-item mdc-typography--headline5" href="https://angel.co/company/growthfile/jobs" target="_blank">
                                Careers
                                <span class="mdc-list-item__meta material-icons">arrow_right</span>
                            </a>
                        </ul>
            </div>  
            <div id='desktop-navigation-drawer-products' class="hidden">
                    <div class="close-desktop-navigation">
                        <i class="material-icons">clear</i>
                    </div>
                    <ul class="mdc-list">
                            <a class="mdc-list-item mdc-typography--headline5" href="./learn-more-payroll.html">
                                Payroll
                                <span class="mdc-list-item__meta material-icons"> arrow_right</span>
                            </a>
                            <a class="mdc-list-item mdc-typography--headline5" href="./learn-more-reim.html">
                                Reimbursements
                                <span class="mdc-list-item__meta material-icons">arrow_right</span>
                            </a>
                        </ul>
            </div>  
        </div>
    </div>
</header>
<div class="container mdc-top-app-bar--fixed-adjust">
    <div class="mdc-layout-grid">
        <div class="mdc-layout-grid__inner area">

            <div
                class="mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">

                <h1 class="mdc-typography--headline4 mt-0">
                    We manage it all, so you are free
                </h1>
                <div class="mt-10">
                    <p class="mdc-typography--body1">Payments verified with location and approved by your managers,
                        you can check any time without having to manage it everyday.</p>
                </div>
            </div>
            <div
                class="mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">
                <div class="">
                    <form class="sign-up-form">

                        <div class="info-container">
                            <div class="mdc-layout-grid__inner">
                       
                                <div
                                    class="input-block mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">
                                    <div class="mdc-text-field mdc-text-field--outlined" id="company-name">
                                        <input class="mdc-text-field__input"  required>
                                        <div class="mdc-notched-outline">
                                            <div class="mdc-notched-outline__leading"></div>
                                            <div class="mdc-notched-outline__notch">
                                                <label for="company-name" class="mdc-floating-label">Company
                                                    Name</label>
                                            </div>
                                            <div class="mdc-notched-outline__trailing"></div>
                                        </div>
                                    </div>
                                    <div class="mt-20">
                                        <div class="mdc-text-field mdc-text-field--outlined" id="company-address">
                                            <input class="mdc-text-field__input" required>
                                            <div class="mdc-notched-outline">
                                                <div class="mdc-notched-outline__leading"></div>
                                                <div class="mdc-notched-outline__notch">
                                                    <label for="company-address" class="mdc-floating-label">Company
                                                        address</label>
                                                </div>
                                                <div class="mdc-notched-outline__trailing"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-20">
                                    <div class="mdc-text-field mdc-text-field--outlined" id="company-location">
                                        <input class="mdc-text-field__input" required>
                                        <div class="mdc-notched-outline">
                                            <div class="mdc-notched-outline__leading"></div>
                                            <div class="mdc-notched-outline__notch">
                                                <label for="company-location" class="mdc-floating-label">Choose Location
                                                    </label>
                                            </div>
                                            <div class="mdc-notched-outline__trailing"></div>
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div
                                    class="mdc-typography--subtitle2  mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">
                                    Company administrator 1
                                </div>

                                
                              
                                <div class="input-block mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell" >
                                        <div class=" mdc-text-field mdc-text-field--outlined" id="company-admin-1-name">
                                    <input class="mdc-text-field__input" required>
                                    <div class="mdc-notched-outline">
                                        <div class="mdc-notched-outline__leading"></div>
                                        <div class="mdc-notched-outline__notch">
                                            <label for="company-admin-1-name" class="mdc-floating-label">Name
                                            </label>
                                        </div>
                                        <div class="mdc-notched-outline__trailing"></div>
                                    </div>
                                </div>

                            </div>
                            <div class="input-block mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell" >
                                    <div>
                                <div class="mdc-text-field mdc-text-field--outlined" id="company-admin-1-email">
                                    <input class="mdc-text-field__input"  required
                                        type="email">
                                    <div class="mdc-notched-outline">
                                        <div class="mdc-notched-outline__leading"></div>
                                        <div class="mdc-notched-outline__notch">
                                            <label for="company-admin-1-email"
                                                class="mdc-floating-label">email</label>
                                        </div>
                                        <div class="mdc-notched-outline__trailing"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="input-block mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">
                            <div>
                                <div class="mdc-text-field mdc-text-field--outlined" id="company-admin-1-phonenumber">
                                    <input class="mdc-text-field__input"  required
                                        type="tel">
                                    <div class="mdc-notched-outline">
                                        <div class="mdc-notched-outline__leading"></div>
                                        <div class="mdc-notched-outline__notch">
                                           
                                        </div>
                                        <div class="mdc-notched-outline__trailing"></div>
                                    </div>
                                </div>

                            </div>
                            <div
                                    class="mdc-form-field mt-10 mdc-form-field">
                                    <div class="mdc-checkbox" id='admin-checkbox'>
                                        <input type="checkbox" class="mdc-checkbox__native-control"
                                            id="checkbox-1" />
                                        <div class="mdc-checkbox__background">
                                            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                                                <path class="mdc-checkbox__checkmark-path" fill="none"
                                                    d="M1.73,12.91 8.1,19.28 22.79,4.59" />
                                            </svg>
                                            <div class="mdc-checkbox__mixedmark"></div>
                                        </div>
                                    </div>
                                    <label for="checkbox-1">Set me up as company administrator</label>
                                </div> 
                        </div>

                        

                        <div
                            class="mdc-typography--subtitle2   mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">
                            Company administrator 2</div>
                        <div class="input-block mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell">
                            <div class="" style="border: top 1px solid #ccc;">
                                <div class="mdc-text-field mdc-text-field--outlined" id="company-admin-2-name">
                                    <input class="mdc-text-field__input"  required>
                                    <div class="mdc-notched-outline">
                                        <div class="mdc-notched-outline__leading"></div>
                                        <div class="mdc-notched-outline__notch">
                                            <label for="ompany-admin-2-name" class="mdc-floating-label">Name</label>
                                        </div>
                                        <div class="mdc-notched-outline__trailing"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="input-block mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell">
                            <div class="" style="border: top 1px solid #ccc;" >
                                <div class="mdc-text-field mdc-text-field--outlined" id="company-admin-2-email">
                                    <input class="mdc-text-field__input" required
                                        type="email">
                                    <div class="mdc-notched-outline">
                                        <div class="mdc-notched-outline__leading"></div>
                                        <div class="mdc-notched-outline__notch">
                                            <label for="company-admin-2-email"
                                                class="mdc-floating-label">Email</label>
                                        </div>
                                        <div class="mdc-notched-outline__trailing"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            class="input-block mdc-layout-grid__cell--span-12-desktop mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-8-tablet">
                            <div class="" style="border: top 1px solid #ccc;">
                                <div class="mdc-text-field mdc-text-field--outlined" id="company-admin-2-phonenumber">
                                    <input class="mdc-text-field__input" required
                                        type="tel">
                                    <div class="mdc-notched-outline">
                                        <div class="mdc-notched-outline__leading"></div>
                                        <div class="mdc-notched-outline__notch">
                                          
                                        </div>
                                        <div class="mdc-notched-outline__trailing"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                </div>


            </div>
            <div class="mt-10 mdc-typography--caption">
                <p>

                    By proceeding, I agree to Growthfiles <a href="https://growthfile.com/terms-and-conditions"
                        target="_blank">Terms of
                        Use</a> and acknowledge that I have read the
                    <a href="https://growthfile.com/privacy-policy" target="_blank">Privacy Policy</a>.

                </p>
                <p>
                    I also agree that Growthfile or its representatives may contact me by email, phone, or SMS
                    (including by automated means) at the email address or number I provide, including
                    for marketing purposes.
                </p>
            </div>
            <div class="mt-20 submit-cont">
                <input type="submit" class="mdc-button mdc-button--raised form-submit-input" value="Sign up">
                <div class="login-link">
                    <span class="mdc-typography--caption">Already have an account?
                        <a href="./index.html">Sign in</a></span>
                </div>
            </div>
            </form>
        </div>
       
    </div>
</div>
</div>


<div class="about-container area content-container">

<div class="image-section">
    <div class="mdc-layout-grid__inner">

        <div
            class="mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell mdc-layout-grid__cell--span-8-tablet">
            <h1 class="mdc-typography--headline4 mt-0">Why pay using Growthfile</h1>
            <p class="mdc-typography--body1">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut fringilla vehicula orci a
                finibus.
                Phasellus sit amet leo quis quam vestibulum varius ultricies vel nulla.
            </p>
        </div>
        <div
            class="mdc-layout-grid__cell--span-6-desktop mdc-layout-grid__cell mdc-layout-grid__cell--span-8-tablet">
            <img src="https://www.uber-assets.com/image/upload/q_auto:eco,c_fill,w_940,h_627/v1558736931/assets/e5/fb1f43-f1bf-4dd2-b62d-6015c758d2ee/original/Safety_ilo.svg"
                class="full-width why-growthfile-image">
        </div>
    </div>

</div>

<div class="mdc-layout-grid__inner mt-20">

    <div class="mdc-layout-grid__cell ">
        <div class="meta-card">
            <div class="icon-container">
                <i class="material-icons">policy
                </i>
            </div>
            <div class="heading-container mt-10">
                <span class='mdc-typography--subtitle1'>
                    Ensure policy adherance
                </span>
            </div>
            <div class="mt-10">
                <p class="mdc-typography--body1">
                    You decide the rules and we ensure it is followed
                </p>
            </div>
        </div>
    </div>

    <div class="mdc-layout-grid__cell">
        <div class="meta-card">
            <div class="icon-container">
                <i class="material-icons">attach_money
                </i>
            </div>
            <div class="heading-container mt-10">
                <span class='mdc-typography--subtitle1'>
                    Save time & money

                </span>
            </div>
            <div class="mt-10">
                <p class="mdc-typography--body1">
                    We manage everything and you can check anytime, without wasting your time
                </p>
            </div>
        </div>
    </div>


    <div class="mdc-layout-grid__cell">
        <div class="meta-card">
            <div class="icon-container">
                <i class="material-icons">contact_support
                </i>
            </div>
            <div class="heading-container mt-10">
                <span class='mdc-typography--subtitle1'>
                    Get support anytime
                </span>
            </div>
            <div class="mt-10">
                <p class="mdc-typography--body1">
                    If there is anything you need, email us anytime on <a
                        href="mailto:help@growthfile.com">help@growthfile.com</a>
                </p>
            </div>
        </div>
    </div>
</div>

</div>

</div>
<footer class="mdc-theme--primary-bg mdc-theme--on-primary static-form">
    <div class="mdc-layout-grid">
        <div class="mdc-layout-grid__inner footer-primary-content">
            <div
                class="mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-3-desktop">

                <div class="inline-content">
                    <img src="../../img/icon.png" class="icon">
                    <span class="mdc-top-app-bar__title">
                        <strong>GROWTH</strong>FILE
                    </span>
                </div>
                <p>
                    <a href="mailto:help@growthfile.com" class="mdc-theme--on-primary">Contact us</a>
                </p>
                <p>
                    <a href="" class="no-underline mdc-theme--on-primary" target="_blank">Privacy</a>
                </p>
                <p>
                    <a href="" class="no-underline mdc-theme--on-primary" target="_blank">Terms</a>
                </p>
            </div>
            <div
                class="mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-2-tablet mdc-layout-grid__cell--span-3-desktop">
                <p class="mdc-typography--headline6 mt-0">About us</p>
                <p>
                    <a href="#" class="mdc-theme--on-primary no-underline">Our company</a>
                </p>
                <p>
                    <a href="https://angel.co/company/growthfile/jobs" class="no-underline mdc-theme--on-primary"
                        target="_blank">Careers</a>

                </p>
            </div>
            <div
                class="mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-3-desktop">
                <p class="mdc-typography--headline6 mt-0">Our Products</p>
                <p>
                    <a href="#" class="mdc-theme--on-primary no-underline">Payroll</a>
                </p>
                <p>
                    <a href="#" class="mdc-theme--on-primary no-underline">Reimbursements</a>
                </p>
            </div>
            <div
                class="mdc-layout-grid__cell--span-4-phone mdc-layout-grid__cell--span-3-tablet mdc-layout-grid__cell--span-3-desktop">
                <p class="mdc-typography--subtitle1 mt-0">
                    Copyright © 2019 Growthfile Analytics Pvt.
                </p>

                <div class="mdc-layout-grid__inner">
                    <div
                        class="mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-2-tablet mdc-layout-grid__cell--span-1-phone  social-media-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                d="M417.2 64H96.8C79.3 64 64 76.6 64 93.9V415c0 17.4 15.3 32.9 32.8 32.9h320.3c17.6 0 30.8-15.6 30.8-32.9V93.9C448 76.6 434.7 64 417.2 64zM183 384h-55V213h55v171zm-25.6-197h-.4c-17.6 0-29-13.1-29-29.5 0-16.7 11.7-29.5 29.7-29.5s29 12.7 29.4 29.5c0 16.4-11.4 29.5-29.7 29.5zM384 384h-55v-93.5c0-22.4-8-37.7-27.9-37.7-15.2 0-24.2 10.3-28.2 20.3-1.5 3.6-1.9 8.5-1.9 13.5V384h-55V213h55v23.8c8-11.4 20.5-27.8 49.6-27.8 36.1 0 63.4 23.8 63.4 75.1V384z">
                            </path>
                        </svg>
                    </div>
                    <div
                        class="mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-2-tablet mdc-layout-grid__cell--span-1-phone social-media-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                d="M492 109.5c-17.4 7.7-36 12.9-55.6 15.3 20-12 35.4-31 42.6-53.6-18.7 11.1-39.4 19.2-61.5 23.5C399.8 75.8 374.6 64 346.8 64c-53.5 0-96.8 43.4-96.8 96.9 0 7.6.8 15 2.5 22.1-80.5-4-151.9-42.6-199.6-101.3-8.3 14.3-13.1 31-13.1 48.7 0 33.6 17.2 63.3 43.2 80.7-16-.4-31-4.8-44-12.1v1.2c0 47 33.4 86.1 77.7 95-8.1 2.2-16.7 3.4-25.5 3.4-6.2 0-12.3-.6-18.2-1.8 12.3 38.5 48.1 66.5 90.5 67.3-33.1 26-74.9 41.5-120.3 41.5-7.8 0-15.5-.5-23.1-1.4C62.8 432 113.7 448 168.3 448 346.6 448 444 300.3 444 172.2c0-4.2-.1-8.4-.3-12.5C462.6 146 479 129 492 109.5z">
                            </path>
                        </svg>
                    </div>
                    <div
                        class="mdc-layout-grid__cell--span-2-desktop mdc-layout-grid__cell--span-2-tablet mdc-layout-grid__cell--span-1-phone social-media-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                            <path
                                d="M508.6 148.8c0-45-33.1-81.2-74-81.2C379.2 65 322.7 64 265 64h-18c-57.6 0-114.2 1-169.6 3.6C36.6 67.6 3.5 104 3.5 149 1 184.6-.1 220.2 0 255.8c-.1 35.6 1 71.2 3.4 106.9 0 45 33.1 81.5 73.9 81.5 58.2 2.7 117.9 3.9 178.6 3.8 60.8.2 120.3-1 178.6-3.8 40.9 0 74-36.5 74-81.5 2.4-35.7 3.5-71.3 3.4-107 .2-35.6-.9-71.2-3.3-106.9zM207 353.9V157.4l145 98.2-145 98.3z">
                            </path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </div>
</footer>`
}