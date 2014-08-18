var errors = [];

//Main data bank
var data = {
    "settings":{},
    "creators":{
        "entries": [],
        "regex": "",
        "replacement": ""},
    "mods": {
        "entries": [],
        "regex": "",
        "replacement": ""},
    "blacklist":{
        "entries": [],
        "regex": [],
        "replacement": []}
};

//Escapes string for use in RegEx
function escapeRegEx(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

//Escapes string for html input
function escapeQuotes(str){
    return str.replace(new RegExp("\"", "gi"), "&quot;")
}

//Fixes inline spacer height for bar
function fixSpacerHeight(){
    document.getElementById("ggdc-bar-spacer").style.height = document.getElementById("ggdc-bar").clientHeight + "px";
}

//Shows whatever is in errors[]
function showErrors(){
    if(errors.length){
        if(errors.length === 1){
            document.getElementById("ggdc-bar-content").innerHTML = "Dogemarket Helper " + errors[0] + ".";
        } else {
            document.getElementById("ggdc-bar-content").innerHTML = "Dogemarket Helper " + errors.join(" and ") + ".";
        }
        document.getElementById("ggdc-bar-content").setAttribute("class", "ggdc-bar-content-warning");
        document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
        document.querySelector("#ggdc-bar-content #ggdc-bar-content-retry").addEventListener("click", function(event){
            event.preventDefault();
            refreshBlacklist();
        });
        fixSpacerHeight();
        errors = [];
    }
}

//adds onClick event for popup elements
function addOnClick(elem){
    // var contents = document.getElementsByClassName("content");
    // for (contentsI = 0; contentsI < contents.length; contentsI++){
    //     var popups = contents[contentsI].getElementsByClassName("ggdc-popup");
    //     for (popupsI = 0; popupsI < popups.length; popupsI++){
    //         var popup = popups[popupsI];
    //         var parent = popup.parentNode;

    //         //popup hasn't been found/set previously

            var parent = elem;
            var popup = elem.getElementsByClassName("ggdc-popup")[0];

            if(parent.getAttribute("data-ggdc-found") !== "1"){

                parent.setAttribute("data-ggdc-found", "1");
                popup.addEventListener("click", function(event){
                    popup = event.target;
                    parent = popup.parentNode;
                    event.preventDefault();
                    var user_reddit;
                    var parClass = parent.getAttribute("class").split(" ");
                    //parClass has blacklist class
                    if(parClass.indexOf("ggdc-blacklist") !== -1){
                        var entry;
                        if(parent.getAttribute("data-ggdc-blacklist-reddit") !== undefined){
                            entry = grep(data.blacklist.entries, function(entry){ return(entry.reddit.toLowerCase() === parent.getAttribute("data-ggdc-blacklist-reddit").toLowerCase()); })[0];
                        } else if (parent.getAttribute("data-ggdc-blacklist-wallet") !== undefined){
                            entry = grep(data.blacklist.entries, function(entry){
                                for (i = 0; i < entry.wallet.length; i++){
                                    if(entry.wallet[i].trim() == parent.getAttribute("data-ggdc-blacklist-wallet").trim()){
                                        return true;
                                    }
                                }})[0];
                        } else if(parent.getAttribute("data-ggdc-blacklist-email") !== undefined){
                            entry = grep(data.blacklist.entries, function(entry){
                                for (i = 0; i < entry.email.length; i++){
                                    if(entry.email[i].toLowerCase() === parent.getAttribute("data-ggdc-blacklist-email").toLowerCase()){
                                        return true;
                                    }   
                                }})[0];
                        } else if(parent.getAttribute("data-ggdc-blacklist-skype") !== undefined){
                            entry = grep(data.blacklist.entries, function(entry){
                                for (i = 0; i < entry.skype.length; i++){
                                    if(entry.skype[i].toLowerCase() === parent.getAttribute("data-ggdc-blacklist-skype").toLowerCase()){
                                        return true;
                                    }   
                                }})[0];
                        }
                        console.dir(entry);
                        //Blacklist info table
                        document.getElementById("ggdc-bar-content").setAttribute("class", "ggdc-bar-content-warning");
                        document.getElementById("ggdc-bar-content").innerHTML = "User is on the blacklist! Take extreme care if trading. Details are listed below:<br><br>\
                            <table class=\"ggdc-bar-content-infotable\"><colgroup><col span=\"1\" style=\"width:200px\"><col span=\"1\" ></colgroup>\
                            <tr><td>Reddit Username</td><td>" + entry.reddit + "</td></tr>" + 
                            (entry.wallet[0] !== "" ? "<tr><td>Known Addresses</td><td>" + entry.wallet.join("<br>") + "</td></tr>" : "") +
                            (entry.email[0] !== "" ? "<tr><td>Email Addresses</td><td>" + entry.email.join("<br>") + "</td></tr>" : "") +
                            (entry.skype[0] !== "" ? "<tr><td>Skype</td><td>" + entry.skype.join("<br>") + "</td></tr>" : "") + 
                            (entry.reason[0] !== "" ? "<tr><td>Reason</td><td>" + entry.reason.join("<br>").replace(/((http|https):\/\/([\w-.]+)+(:\d+)?(\/([\w\/_\\-\\.]*(\?\S+)?)?)?)/gi, "<a href=\"$1\" target=\"_blank\">$1</a>") + "</td></tr>" : "") +
                            "</table>";
                        user_reddit = entry.reddit;
                    //parClass has moderator class
                    } else if (parClass.indexOf("ggdc-moderator") !== -1){
                        user_reddit = parent.childNodes[0].nodeValue;
                        document.getElementById("ggdc-bar-content").setAttribute("class", "ggdc-bar-content-moderator");
                        document.getElementById("ggdc-bar-content").innerHTML = "User is a current moderator of /r/DogeMarket";
                    //parClass has creators
                    } else if (parClass.indexOf("ggdc-creators") !== -1){
                        user_reddit = parent.childNodes[0].nodeValue;
                        document.getElementById("ggdc-bar-content").setAttribute("class", "ggdc-bar-content-creators");
                        document.getElementById("ggdc-bar-content").innerHTML = "User created the /r/DogeMarket Helper Extension for Chrome";
                    //parClass is a standard user
                    } else {
                        user_reddit = parent.childNodes[0].nodeValue;
                        document.getElementById("ggdc-bar-content").setAttribute("class", "");
                        document.getElementById("ggdc-bar-content").innerHTML = "There is no special information on this user, always trade with care.";
                    }

                    //Table for verification threads
                    document.getElementById("ggdc-bar-content").innerHTML += "<table class=\"ggdc-bar-content-details\">\
                        <colgroup><col span=\"1\" style=\"width:200px\"><col span=\"1\" ></colgroup>\
                        <tr><td>Verification Threads</td><td id=\"ggdc-bar-content-details-verification\">Loading...</td></tr>";
                    document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");

                    if(data.settings.alwaysShowBar === "false" && document.getElementById("ggdc-bar").getAttribute("class").split(" ").indexOf("ggdc-bar-open") === -1){
                        document.getElementById("ggdc-bar").style.display = "none";
                        document.getElementById("ggdc-bar-spacer").style.display = "none";
                    } else {
                        document.getElementById("ggdc-bar").style.display = null;
                        document.getElementById("ggdc-bar-spacer").style.display = null;
                    }
                    fixSpacerHeight();

                    //Get verification threads of user
                    chrome.runtime.sendMessage({
                        get: "user_verification",
                        user: user_reddit
                    }, function(response){
                        if(response.success){
                            if(response.threads.length > 0){
                                document.getElementById("ggdc-bar-content-details-verification").innerHTML = response.threads.join("<br>").replace(/((http|https):\/\/([\w-.]+)+(:\d+)?(\/([\w\/_\\-\\.]*(\?\S+)?)?)?)/gi, "<a href=\"$1\" target=\"_blank\">$1</a>");
                            } else {
                                document.getElementById("ggdc-bar-content-details-verification").innerHTML = "None found for user";
                            }
                        } else {
                            document.getElementById("ggdc-bar-content-details-verification").innerHTML = "Could not look up username. Server may be offline.";
                        }
                        fixSpacerHeight();
                    });
                });
            }
    //     }   
    // }
}

//Thanks to https://forum.jquery.com/user/kbwood.au for the core of this function
function highlightField(node, callback) {
    //recurisve node child finder
    function findNodeChildren(node, array){
        var found = node.getAttribute("data-ggdc-found") === "1";
        var children = node.childNodes
        for(var i = 0; i < children.length; i++){
            if(children[i].nodeType === 3 && !found){
                array.push(children[i]);
            } else if (children[i].nodeType === 1){
                findNodeChildren(children[i], array);
            }
        }
    }

    var nodes = [];

    findNodeChildren(node, nodes);

    for(var i = 0; i < nodes.length; i++){
        var content;

        //Creators
        content = nodes[i].nodeValue.replace(data.creators.regex, data.creators.replacement);

        //Mods
        content = content.replace(data.mods.regex, data.mods.replacement);

        //Blacklist
        for (var key in data.blacklist.regex){
            if(data.blacklist.regex.hasOwnProperty(key)){
                content = content.replace(data.blacklist.regex[key], data.blacklist.replacement[key]);
            }
        }

        //If changed, replace node
        if (content !== nodes[i].nodeValue) {
            /*var replacement = document.createTextNode(content);
            nodes[i].parentNode.replaceChild(replacement, nodes[i]);*/
            var replacement = document.createElement("span");
            replacement.innerHTML = content;
            nodes[i].parentNode.replaceChild(replacement, nodes[i]);

            addOnClick(replacement.parentNode);
        }
    }
    callback();
}

//jQuery Grep function (1.7.2)
function grep(elems, callback, inv) {
    var ret = [],
        retVal;
    inv = !!inv;

    // Go through the array, only saving the items
    // that pass the validator function
    for (var i = 0, length = elems.length; i < length; i++) {
        retVal = !!callback(elems[i], i);
        if (inv !== retVal) {
            ret.push(elems[i]);
        }
    }

    return ret;
}

function refreshBlacklist(){
    chrome.runtime.sendMessage({get: "refresh"}, function(response){});
}

/*****
 Main
*****/

chrome.runtime.sendMessage({get: "settings"}, function(response){

    data.settings = response.settings;

    if(response.allowedToRun){

        //Insert our bar with default content
        document.body.insertAdjacentHTML("afterbegin", '\
                <div id="ggdc-bar-spacer" style="display: none;">\
                </div>\
                <div id="ggdc-bar" style="display: none;">\
                    <div id="ggdc-bar-head">\
                        <span id="ggdc-bar-tips" class="ggdc-bar-tips">Tips?</span>\
                        <span id="ggdc-bar-help" class="ggdc-bar-help">Help&Support</span>\
                        <span id="ggdc-bar-toggle" class="ggdc-bar-toggle">Show/Hide</span>\
                        <span id="ggdc-bar-rescan" class="ggdc-bar-rescan"><abbr title="Useful if you loaded more content (like RES\'s \'Never Ending Reddit\')"">Rescan Page</abbr></span>\
                        <span class="ggdc-bar-head-title"><a href="http://www.reddit.com/r/dogemarket">/r/DogeMarket</a> Helper! By <a href="http://www.reddit.com/user/GusGold/">/u/GusGold</a>.</span>\
                    </div>\
                    <div id="ggdc-bar-content">\
                        There\'s nothing here! Hover over highlighted names below and click on "More info" for details about them.\
                    </div>\
                </div>');
        /*document.getElementsByTagName("body")[0].innerHTML = '\
                <div id="ggdc-bar-spacer" style="display: none;">\
                </div>\
                <div id="ggdc-bar" style="display: none;">\
                    <div id="ggdc-bar-head">\
                        <span id="ggdc-bar-tips" class="ggdc-bar-tips">Tips?</span>\
                        <span id="ggdc-bar-help" class="ggdc-bar-help">Help&Support</span>\
                        <span id="ggdc-bar-toggle" class="ggdc-bar-toggle">Show/Hide</span>\
                        <span id="ggdc-bar-rescan" class="ggdc-bar-rescan"><abbr title="Useful if you loaded more content (like RES\'s \'Never Ending Reddit\')"">Rescan Page</abbr></span>\
                        <span class="ggdc-bar-head-title"><a href="http://www.reddit.com/r/dogemarket">/r/DogeMarket</a> Helper! By <a href="http://www.reddit.com/user/GusGold/">/u/GusGold</a>.</span>\
                    </div>\
                    <div id="ggdc-bar-content">\
                        There\'s nothing here! Hover over highlighted names below and click on "More info" for details about them.\
                    </div>\
                </div>' + document.getElementsByTagName("body")[0].innerHTML;*/

        //Display if our window is too small
        window.onresize = function(){
            var message_tooSmall = "For /r/DogeMarket Helper to function properly, it prefers a browser width of at least 830 pixels. Please expand the window to solve this.<br>\
                    If this is not possible, /r/DogeMarket Helper will continue to function normally, but some graphical errors may occur.";

            if(window.innerWidth < 830){
                document.getElementById("ggdc-bar-content").setAttribute("class", "");
                document.getElementById("ggdc-bar-content").innerHTML = message_tooSmall;
                document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
            } else if(document.getElementById("ggdc-bar-content").innerHTML === message_tooSmall){
                document.getElementById("ggdc-bar-content").innerHTML = "";
                document.getElementById("ggdc-bar").setAttribute("class", "");
            }
            fixSpacerHeight();
        }

        //Opens and closes bar
        document.getElementById("ggdc-bar-toggle").addEventListener("click", function(event){
            document.getElementById("ggdc-bar").classList.toggle("ggdc-bar-open");
            if(data.settings.alwaysShowBar === "false" && document.getElementById("ggdc-bar").getAttribute("class").split(" ").indexOf("ggdc-bar-open") === -1){
                document.getElementById("ggdc-bar").style.display = "none";
                document.getElementById("ggdc-bar-spacer").style.display = "none";
            } else {
                document.getElementById("ggdc-bar").style.display = null;
                document.getElementById("ggdc-bar-spacer").style.display = null;
            }
            fixSpacerHeight();
        });

        //Shows Tip address
        document.getElementById("ggdc-bar-tips").addEventListener("click", function(event){
            document.getElementById("ggdc-bar-content").setAttribute("class", "");
            document.getElementById("ggdc-bar-content").innerHTML = "If you feel this extension has helped, please consider donating a few Doge to D5hUdmJCGVpLxZgVBwqvKY5UFr51bFRZ9y.<br>Thank you!";
            document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
            fixSpacerHeight();
        });

        //Shows the help page
        document.getElementById("ggdc-bar-help").addEventListener("click", function(event){
            chrome.runtime.sendMessage({get: "help"}, function(response) {
                console.warn(response);
            });
        });

        //Get Values from background.js
        if(data.settings.alwaysShowBar === "false" && document.getElementById("ggdc-bar").getAttribute("class").split(" ").indexOf("ggdc-bar-open") === -1){
            document.getElementById("ggdc-bar").style.display = "none";
            document.getElementById("ggdc-bar-spacer").style.display = "none";
        } else {
            document.getElementById("ggdc-bar").style.display = null;
            document.getElementById("ggdc-bar-spacer").style.display = null;
            fixSpacerHeight();
        }

        //nested for "syncronous/linear" execution
        //gets creator info from background.js
        chrome.runtime.sendMessage({get: "creators"}, function(response) {

            data.creators.entries = response.entries;
            data.creators.regex = new RegExp(response.regex, "gi");
            data.creators.replacement = response.replacement;

            //gets mod info from background.js
            chrome.runtime.sendMessage({get: "mods"}, function(response) {

                if(response.populated){
                    data.mods.entries = response.entries;
                    data.mods.regex = new RegExp(response.regex, "gi");
                    data.mods.replacement = response.replacement;
                } else {
                    errors.push(response.reason);
                }

                //gets blacklist info from background.js
                chrome.runtime.sendMessage({get: "blacklist"}, function(response) {
                    
                    if(response.populated){
                        data.blacklist.entries = response.entries;
                        for (var key in response.regex){
                            if(response.regex.hasOwnProperty(key)){
                                data.blacklist.regex[key] = new RegExp(response.regex[key], "gi");
                            }
                        }
                        data.blacklist.replacement = response.replacement;
                    } else {
                        errors.push(response.reason);
                    }

                    showErrors();

                    highlighter_js();
                    
                    //Lazy way to check if files included
                    try {
                        comments_js();
                    } catch (error) {
                        console.warn(error);
                    }
                    try {
                        messages_js();
                    } catch (error) {
                        console.warn(error);
                    }
                    
                    //Listener for page_action requests
                    chrome.extension.onMessage.addListener(function(request, sender, response){
                        if(request.from === "page_action"){
                            if(request.action === "show"){
                                //Show bar
                                if(request.context === "info"){
                                    document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                                    document.getElementById("ggdc-bar").style.display = null;
                                    document.getElementById("ggdc-bar-content").style.display = null;
                                    fixSpacerHeight();
                                //Show donations
                                } else if(request.context === "donation"){
                                    document.getElementById("ggdc-bar-content").setAttribute("class", "");
                                    document.getElementById("ggdc-bar-content").innerHTML = "If you feel this extension has helped, please consider donating a few Doge to D5hUdmJCGVpLxZgVBwqvKY5UFr51bFRZ9y.<br>Thank you!";
                                    document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                                    document.getElementById("ggdc-bar").style.display = null;
                                    document.getElementById("ggdc-bar-content").style.display = null;
                                    fixSpacerHeight();
                                }
                            } else if (request.action === "do"){
                                //perform rescan of page
                                if(request.context === "rescan"){
                                    highlightAuthors();
                                    try {
                                        highlightAuthors();
                                    } catch (error) {
                                        console.warn(error);
                                    }

                                    try {
                                        highlightComments();
                                    } catch (error) {
                                        console.warn(error);
                                    }

                                    try {
                                        highlightMessagest();
                                    } catch (error) {
                                        console.warn(error);
                                    }
                                }
                            }
                            response({message:"Received"});
                        }
                    });
                });
            });
        });
    }
});