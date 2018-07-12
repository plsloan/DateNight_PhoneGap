// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});


// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('about', function (page) {
    // Do something here for "about" page

})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        myApp.alert('Here comes About page');
    }
})

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    myApp.alert('Here comes About page');
})


// -------------------------------------------- MY FUNCTIONS --------------------------------------------
// dropdown
var dropdown = document.getElementById("dropdown"),
    lynchburg = document.getElementById("lynchburg"), 
    williamston = document.getElementById("williamston"), 
    greenville = document.getElementById("greenville"), 
    newbern = document.getElementById("newbern");

dropdown.onclick = function() {
    var value = dropdown.options[dropdown.selectedIndex].value;
};

// button functions
var freeButton = document.getElementById("freeButton"),
    cheapButton = document.getElementById("cheapButton"),
    mediumButton = document.getElementById("mediumButton"),
    priceyButton = document.getElementById("priceyButton");

freeButton.onclick = function() { 
    window.confirm("You pressed free.");
};
cheapButton.onclick = function() { 
    window.confirm("You pressed cheap."); 
};
mediumButton.onclick = function() { 
    window.confirm("You pressed medium.");
};
priceyButton.onclick = function() { 
    window.confirm("You pressed pricey.");
};


// 