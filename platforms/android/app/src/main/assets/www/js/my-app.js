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

var categories = ["Free", "Cheap", "Medium", "Pricey"];


// -------------------------------------------- MY Code --------------------------------------------

// Initialize
var idbAdapter = new LokiIndexedAdapter();
var datenightDB = new loki('datenightDB.db', {
    autoload: true,
    autoloadCallback : databaseInitialize,
    autosave: true, 
    autosaveInterval: 4000
});


function databaseInitialize() {
    cities = datenightDB.getCollection("cities");
    if (cities === null) {
      cities = datenightDB.addCollection("cities");
    }
}

$$(document).on('deviceready', function() {
    databaseInitialize();
    initializeCities();
    initializeDates();
});

var cities = datenightDB.getCollection("cities");

// dropdown
var dropdown = document.getElementById("dropdown_actual"),
    addCityBtn = document.getElementById("addCityBtn");
    deleteCityBtn = document.getElementById("deleteCityBtn");


dropdown.onchange = function() {
    if (dropdown.options.length != 0) {
        setCurrentCity(dropdown.options[dropdown.selectedIndex].text);

        initializeCities();
        initializeDates();
    }
};

addCityBtn.onclick = function() {
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
                text: "Cancel",
                bold: false,
            }, 
            { 
                text: "Ok",
                bold: true,
                onClick: function() {
                    var c = document.getElementById("city_input").value,
                        s = document.getElementById("state_input").value;

                    if (c == "") {
                        myApp.alert("City name cannot be empty...", "");
                        if (dropdown.length == 0) {
                            addCityToDropdown("City", "ST");
                        }                    
                    } else if (s.length != 2) {
                        myApp.alert("Must use two letter state appreviation...", "");
                        if (dropdown.length == 0) {
                            addCityToDropdown("City", "ST");
                        }
                    }
                    else {
                        if (dropdown.options[0].value == "placeholder") {
                            dropdown[0] = null;
                        }
                        c = c[0].toUpperCase() + c.substring(1, c.length);
                        s = s.toUpperCase();
                        addCity(c, s);
                        console.log(c + ", " + s + " was added.");
                    }
                }
            }
        ]
    })

    initializeDates();
};

deleteCityBtn.onclick = function() {
    var city_name = dropdown.options[dropdown.selectedIndex].text.split(", ")[0];
    var city = datenightDB.getCollection("cities").find({city: city_name})[0];
    
    datenightDB.getCollection("cities").remove(city);
    dropdown.options[dropdown.selectedIndex] = null;

    initializeCities();
    initializeDates();
};

function initializeCities() {
    var current_city = cities.find({current: "true"})[0];
    var other_cities = cities.chain().find({current: "false"}).simplesort("city").data();

    // set cities
    databaseInitialize();

    // clear dropdown
    while (dropdown.options[0] != null) {
        dropdown.options[dropdown.options.length - 1] = null;
    }

    // add cities
    if (current_city.length != 0) {
        // add current item first
        addCityToDropdown(current_city.city, current_city.state);

        if (other_cities.length != 0) {
            // add other cities by alphabetical order
            for (var i = 0; i < other_cities.length; i++) {
                addCityToDropdown(other_cities[i].city, other_cities[i].state);
            }
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
    var previousID = 0;

    for (i = 0; i < cities.find().length; i++) {
        previousID = cities.find()[i]._id;
    }

    var doc = {
        _id: previousID + 1,
        city: c,
        state: st,
        dates: [],
        current: "false"
    };

    cities.insert(doc);
    addCityToDropdown(c, st);
}

function addCityToDropdown(c, st) {
    var option = document.createElement("option");

    option.value = c.toLowerCase();
    option.innerText = c + ", " + st;

    dropdown.appendChild(option);

    if (datenightDB.getCollection("cities").find().length != 0) {
        addDateBtn.style.visibility = 'visible';
    }
}

function setCurrentCity(c) {  
    // get city name
    var city_name = c.split(", ")[0];

    // set all currents to false
    var current_city = cities.find({current: "true"});
    for (var i = 0; i < current_city.length; i++) {
        current_city[i].current = "false";
    }
    cities.update(current_city);

    // set new current city
    var new_current = cities.find({city: city_name});
    new_current[0].current = "true";
    cities.update(new_current);
}

// button functions
var freeButton = document.getElementById("freeButton"),
    cheapButton = document.getElementById("cheapButton"),
    mediumButton = document.getElementById("mediumButton"),
    priceyButton = document.getElementById("priceyButton");

freeButton.onclick = function() { 
    // get free dates
    var freeDates = getCheckedDates("free");

    // pick random from dates
    var index = Math.floor((Math.random() * freeDates.length));

    // output random free date
    if (freeDates.length != 0) {
        myApp.alert("Your date is... " + freeDates[index], "");
    } else {
        myApp.alert("No dates available.", "");
    }
};
cheapButton.onclick = function() { 
    var cheapDates = getCheckedDates("cheap");
    var index = Math.floor((Math.random() * cheapDates.length));
    
    if (cheapDates.length != 0) {
        myApp.alert("Your date is... " + cheapDates[index], "");
    } else {
        myApp.alert("No dates available.", "");
}
};
mediumButton.onclick = function() { 
    var mediumDates = getCheckedDates("medium");
    var index = Math.floor((Math.random() * mediumDates.length));
    
    if (mediumDates.length != 0) {
        myApp.alert("Your date is... " + mediumDates[index], "");
    } else {
        myApp.alert("No dates available.", "");
    }
};
priceyButton.onclick = function() { 
    var priceyDates = getCheckedDates("pricey");
    var index = Math.floor((Math.random() * priceyDates.length));
    
    if (priceyDates.length != 0) {
        myApp.alert("Your date is... " + priceyDates[index], "");
    } else {
        myApp.alert("No dates available.", "");
    }
};

function getCheckedDates(category) {   
    var dates = [];

    if (category == "free") {
        var freeDates = document.getElementById("freeDates");   
        var items = freeDates.children;
        
        for (var i = 0; i < items.length; i++) {
            var check_value = items[i].children[0].children[0].checked;
            var date_name = items[i].children[0].children[2].children[0].innerText;
            if (check_value) {
                dates.push(date_name);
            }
        }

        return dates;

    } else if (category == "cheap") {
        var cheapDates = document.getElementById("cheapDates");
        var items = cheapDates.children;
        
        for (var i = 0; i < items.length; i++) {
            var check_value = items[i].children[0].children[0].checked;
            var date_name = items[i].children[0].children[2].children[0].innerText;
            if (check_value) {
                dates.push(date_name);
            }
        }

        return dates;

    } else if (category == "medium") {
        var mediumDates = document.getElementById("mediumDates");    
        var items = mediumDates.children;
        
        for (var i = 0; i < items.length; i++) {
            var check_value = items[i].children[0].children[0].checked;
            var date_name = items[i].children[0].children[2].children[0].innerText;
            if (check_value) {
                dates.push(date_name);
            }
        }

        return dates;

    } else if (category == "pricey") {
        var priceyDates = document.getElementById("priceyDates");
        var items = priceyDates.children;
        
        for (var i = 0; i < items.length; i++) {
            var check_value = items[i].children[0].children[0].checked;
            var date_name = items[i].children[0].children[2].children[0].innerText;
            if (check_value) {
                dates.push(date_name);
            }
        }

        return dates;

    } else {
        console.log("Invalid category...");
    }
}


// left panel
var addDateBtn = document.getElementById("addDateBtn");

addDateBtn.onclick = function() {
    myApp.modal({
        title: "Date Information",

        text:   "<div class='list-block'>" + 
                    "<ul>" +
                        "<!-- Text inputs -->" +
                        "<li>" + 
                            "<div class='item-content'>" +
                                "<div class='item-inner'>" + 
                                    "<div class='item-title label'>Name</div>" + 
                                    "<div class='item-input'>" + 
                                        "<input id='date_input' type='text' placeholder='Date Name'>" + 
                                    "</div>" + 
                                "</div>" + 
                            "</div>" + 
                        "</li>" + 
                        "<li>" + 
                            "<div class='item-content'>" + 
                                "<div class='item-inner'>" +
                                    "<div class='item-title label'>Category</div>" +
                                    "<div class='item-input'>" + 
                                        "<input id='category_input' type='text' placeholder='Category Name'>" +
                                    "</div>" + 
                                "</div>" + 
                            "</div>" + 
                        "</li>" +
                    "</ul>" +
                "</div>",

        buttons: [
            { 
                text: "Cancel",
                bold: false,
            },                
            
            {
                text: "Ok",
                bold: true,
                onClick: function() {
                    var n = document.getElementById("date_input").value,
                        c = document.getElementById("category_input").value;

                    if (categories.includes(c)) {
                        console.log(n + " was added to " + c + "...");
                        addDate({
                            name: n,
                            category: c
                        });
                    } else {
                        myApp.alert("Invalid category...", "");
                    }
                }
            }
        ]
    });
}

function initializeDates() {
    if (datenightDB.getCollection("cities").find().length == 0) {
        addDateBtn.style.visibility = 'hidden';
    }

    var freeDates = document.getElementById("freeDates");
    var cheapDates = document.getElementById("cheapDates");
    var mediumDates = document.getElementById("mediumDates");
    var priceyDates = document.getElementById("priceyDates");

    // clear accordion
    while (freeDates.firstChild) {
        freeDates.removeChild(freeDates.firstChild);
    } while (cheapDates.firstChild) {
        cheapDates.removeChild(cheapDates.firstChild);
    } while (mediumDates.firstChild) {
        mediumDates.removeChild(mediumDates.firstChild);
    } while (priceyDates.firstChild) {
        priceyDates.removeChild(priceyDates.firstChild);
    }


    var city_name = dropdown.options[dropdown.selectedIndex].text.split(", ")[0];
    var city = datenightDB.getCollection("cities").find({city: city_name})[0];
    
    if (city != null && city.dates.length != 0) {
        for (i = 0; i < city.dates.length; i++) {
            addDateToList(city.dates[i]);
        }
    }
}

function addDate(doc) {
    addDateToList(doc);

    var city_name = dropdown.options[dropdown.selectedIndex].text.split(", ")[0];
    var city = datenightDB.getCollection("cities").find({city: city_name})[0];
    city.dates.push(doc);

    var new_doc = {
        _id: city._id,
        city: city.city,
        state: city.state,
        dates: city.dates,
        current: "false"
    };

    datenightDB.getCollection("cities").remove(city);
    datenightDB.getCollection("cities").insert(new_doc);
    initializeDates();
}

function addDateToList(doc) {
    var freeDates = document.getElementById("freeDates");
    var cheapDates = document.getElementById("cheapDates");
    var mediumDates = document.getElementById("mediumDates");
    var priceyDates = document.getElementById("priceyDates");
    var item = document.createElement("li");

    var label = document.createElement("label");
    label.className ="label-checkbox item-content";
    
    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "dates";
    checkbox.value = doc.name.toLowerCase();
    checkbox.checked = "checked";

    var item_media = document.createElement("div");
    item_media.className = "item-media";

    var icon_check = document.createElement("i");
    icon_check.className = "icon icon-form-checkbox";
    item_media.appendChild(icon_check);

    var item_inner = document.createElement("div");
    item_inner.className = "item-inner";

    var item_title = document.createElement("div");
    item_title.className = "item-title";
    item_title.innerText = doc.name;
    item_inner.appendChild(item_title);

    var delete_button = document.createElement("a");
    delete_button.className = "button";
    delete_button.innerHTML = "<i class='f7-icons color-red'>trash</i>";
    delete_button.onclick = function() {
        var n = delete_button.parentElement.children[2].children[0].innerText;
        myApp.confirm("Would you like to delete this date?", "", 
            function() {   // on ok
                var city_name = dropdown.options[dropdown.selectedIndex].text.split(", ")[0];
                var city = datenightDB.getCollection("cities").find({ city: { "$regex": [city_name, "i"] }})[0];
                var index;
                var date_name = delete_button.parentElement.children[2].children[0].innerText;
            
                var new_city = {
                    _id: city._id,
                    city: city.city, 
                    state: city.state,
                    dates: city.dates,
                    current: "false"
                };
                
                for (var i=0; i < new_city.dates.length; i++) {
                    if (date_name.toLowerCase() == new_city.dates[i].name.toLowerCase()) {
                        index = i;
                    }
                }

                console.log("Deleting " + city.dates[index].name + "...");
                var date_category = city.dates[index].category;
                var items;
                new_city.dates.splice(index, 1);
                cities.remove(city);
                cities.insert(new_city);

                if (date_category.toLowerCase() == "free") {
                    items = freeDates.children;
                    for (var i = 0 ; i < freeDates.childElementCount; i++) {
                        var item_name = items[i].children[0].children[2].children[0].innerText;
                        
                        if (item_name == date_name) {
                            freeDates.removeChild(freeDates.children[i]);
                        }
                    }
                } else if (date_category.toLowerCase() == "cheap") {
                    items = cheapDates.children;
                    for (var i = 0 ; i < cheapDates.childElementCount; i++) {
                        var item_name = items[i].children[0].children[2].children[0].innerText;
                        
                        if (item_name == date_name) {
                            cheapDates.removeChild(cheapDates.children[i]);
                        }
                    }
                } else if (date_category.toLowerCase() == "medium") {
                    items = mediumDates.children;
                    for (var i = 0 ; i < mediumDates.childElementCount; i++) {
                        var item_name = items[i].children[0].children[2].children[0].innerText;
                        
                        if (item_name == date_name) {
                            mediumDates.removeChild(mediumDates.children[i]);
                        }
                    }
                } else if (date_category.toLowerCase() == "pricey") {
                    items = priceyDates.children;
                    for (var i = 0 ; i < priceyDates.childElementCount; i++) {
                        var item_name = items[i].children[0].children[2].children[0].innerText;
                        
                        if (item_name == date_name) {
                            priceyDates.removeChild(priceyDates.children[i]);
                        }
                    }
                }
            }, 
            
            function() {    // on cancel
                console.log("Canceled date deletion...");
            });
    };

    label.appendChild(checkbox);
    label.appendChild(item_media);
    label.appendChild(item_inner);
    label.appendChild(delete_button);

    item.appendChild(label);

    if (doc.category.toLowerCase() == "free") {
        freeDates.appendChild(item);
    } else if (doc.category.toLowerCase() == "cheap") {
        cheapDates.appendChild(item);
    } else if(doc.category.toLowerCase() == "medium") {
        mediumDates.appendChild(item);
    } else if(doc.category.toLowerCase() == "pricey") {
        priceyDates.appendChild(item);
    }
}