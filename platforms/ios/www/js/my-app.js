// Initialize app
var myApp = new Framework7({
    swipePanel: 'left'
});


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


// -------------------------------------------- MY FUNCTIONS --------------------------------------------
// database init
var idbAdapter = new LokiIndexedAdapter();
var datenightDB = new loki('datenightDB.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true, 
    autosaveInterval: 4000
});
// var cities = datenightDB.getCollection("cities");
function databaseInitialize() {
    var cities = datenightDB.getCollection("cities");
    if (cities === null) {
      cities = datenightDB.addCollection("cities");
    }
}


// dropdown
var dropdown = document.getElementById("dropdown_actual"),
    addCityBtn = document.getElementById("addCityBtn");

$$(document).on('deviceready', function() {
    databaseInitialize();
    initializeCities();
    initializeDates();
});
    

dropdown.onclick = function() {
    // var value = dropdown.options[dropdown.selectedIndex].value;
    initializeDates();
};

addCityBtn.onclick = function() {
    if (dropdown.length == 1 && dropdown.options[0].value == "placeholder") {
        dropdown.options[0] = null;
        dropdown.options.length = 0;
    }

    // get input
    myApp.modal({
        title: "Location Information",

        text:   "<div class='list-block'>" + 
                    "<ul>" +
                        "<!-- Text inputs -->" +
                        "<li>" + 
                            "<div class='item-content'>" +
                                "<div class='item-inner'>" + 
                                    "<div class='item-title label'>City</div>" + 
                                    "<div class='item-input'>" + 
                                        "<input id='city_input' type='text' placeholder='City'>" + 
                                    "</div>" + 
                                "</div>" + 
                            "</div>" + 
                        "</li>" + 
                        "<li>" + 
                            "<div class='item-content'>" + 
                                "<div class='item-inner'>" +
                                    "<div class='item-title label'>State</div>" +
                                    "<div class='item-input'>" + 
                                        "<input id='state_input' type='text' placeholder='ST'>" +
                                    "</div>" + 
                                "</div>" + 
                            "</div>" + 
                        "</li>" +
                    "</ul>" +
                "</div>",

        buttons: [
            { 
                text: "Ok",
                bold: true,
                onClick: function() {
                    var c = document.getElementById("city_input").value,
                        s = document.getElementById("state_input").value;

                    addCity(c, s);
                    console.log(c + ", " + s + " was added.");
                }
            }, 
            {
                text: "Cancel",
                bold: true,
            }
        ]
    })
}

function initializeCities() {
    databaseInitialize();
    var locations = datenightDB.getCollection("cities").find();
    if (locations.length != 0) {
        for (i = 0; i < locations.length; i++) {
            addCityToDropdown(locations[i].city, locations[i].state);
        }
    } else {
        if (dropdown.length == 0) {
            var placeholder = document.createElement("option");
            placeholder.value = "placeholder";
            placeholder.innerText = "Add a City, ST...";
        
            dropdown.appendChild(placeholder);
        }
    }
}

function addCity(c, st) {
    var locations = datenightDB.getCollection("cities");
    var previousID = 0;
    addCityToDropdown(c, st);

    for (i = 0; i < locations.find().length; i++) {
        previousID = locations.find()[i].id;
    }

    var doc = {
        _id: previousID + 1,
        city: c,
        state: st,
        dates: []
    };

    locations.insert(doc);
}

function addCityToDropdown(c, st) {
    var option = document.createElement("option");

    option.value = c.toLowerCase();
    option.innerText = c + ", " + st;

    dropdown.appendChild(option);
}

// button functions
var freeButton = document.getElementById("freeButton"),
    cheapButton = document.getElementById("cheapButton"),
    mediumButton = document.getElementById("mediumButton"),
    priceyButton = document.getElementById("priceyButton");

freeButton.onclick = function() { 
    // window.confirm("You pressed free.");
    swal('hello world');
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


// left panel
var addDateBtn = document.getElementById("addDateBtn");
addDateBtn.onclick = function() {
    myApp.prompt("Enter date...", "", function (value) {
        addDate(value);
    });
}

function initializeDates() {
    var city = datenightDB.getCollection("cities").find()[dropdown.selectedIndex];
    
    if (city.dates.length != 0) {
        for (i = 0; i < city.dates.length; i++) {
            addDateToList(city.dates[i]);
        }
    }
}

function addDate(name) {
    addDateToList(name);

    var city = datenightDB.getCollection("cities").find()[dropdown.selectedIndex];
    city.dates.push(name);

    var doc = {
        _id: city.id,
        city: city.city,
        state: city.state,
        dates: city.dates
    };

    datenightDB.getCollection("cities").remove(city);
    datenightDB.getCollection("cities").insert(doc);
}

function addDateToList(name) {
    var item = document.createElement("li");
    
    var label = document.createElement("label");
    label.className ="label-checkbox item-content";
    
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "dates";
    checkbox.value = name.toLowerCase();
    checkbox.checked = "checked";

    var item_media = document.createElement("div");
    item_media.className = "item-media";

    var icon = document.createElement("i");
    icon.className = "icon icon-form-checkbox";
    item_media.appendChild(icon);

    var item_inner = document.createElement("div");
    item_inner.className = "item-inner";

    var item_title = document.createElement("div");
    item_title.className = "item-title";
    item_title.innerText = name;
    item_inner.appendChild(item_title);

    label.appendChild(checkbox);
    label.appendChild(item_media);
    label.appendChild(item_inner);

    item.appendChild(label);

    var dd = document.getElementById("date_list");
    dd.appendChild(item);
}