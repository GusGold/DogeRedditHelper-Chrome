/************
 Update Check
************/

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        chrome.tabs.create({
            url: chrome.extension.getURL("html/installation/install.html")
        });
    } else if (details.reason == "update"){
        chrome.tabs.create({
            url: chrome.extension.getURL("html/installation/update.html")
        });
    }
});

chrome.tabs.query({}, function(tabs){
    for(var i = 0; i < tabs.length; i++){
        var tab = tabs[i];
        if (tab.url.indexOf("reddit.com/r/dogemarket") !== -1 || (localStorage.privateAllowed === "true" && tab.url.indexOf("reddit.com/message") !== -1)){
            chrome.pageAction.show(tab.id);
        }
    }
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    if(tab.url.indexOf("reddit.com/r/dogemarket") !== -1 || (localStorage.privateAllowed === "true" && tab.url.indexOf("reddit.com/message") !== -1)){
        chrome.pageAction.show(tabId);
    }
});

var data = {
    "blacklist": {
        "populated": false,
        "src": "https://docs.google.com/spreadsheet/ccc",
        "entries": [],
        "regex": {
            "reddit": "",
            "wallet": "",
            "email": "",
            "skype": ""},
        "replacement": {
            "reddit": '$1<span class="ggdc-blacklist ggdc-info" data-ggdc-blacklist-reddit="$2">$2<span class="ggdc-popup">More info</span></span>$3',
            "wallet": '$1<span class="ggdc-blacklist ggdc-info" data-ggdc-blacklist-wallet="$2">$2<span class="ggdc-popup">More info</span></span>$3',
            "email": '$1<span class="ggdc-blacklist ggdc-info" data-ggdc-blacklist-email="$2">$2<span class="ggdc-popup">More info</span></span>$3',
            "skype": '$1<span class="ggdc-blacklist ggdc-info" data-ggdc-blacklist-skype="$2">$2<span class="ggdc-popup">More info</span></span>$3'}},
    "mods": {
        "populated": false,
        "src": "http://www.reddit.com/r/dogemarket/",
        "entries": [],
        "regex": "",
        "replacement": '$1<span class="ggdc-moderator ggdc-info" data-ggdc-moderator-reddit="$2">$2<span class="ggdc-popup">More info</span></span>$3'},
    "creators": {
        "entries": ["GusGold"],
        "regex": "",
        "replacement": '$1<span class="ggdc-creators ggdc-info" data-ggdc-creators-reddit="$2">$2<span class="ggdc-popup">More info</span></span>$3'}};

data.creators.regex = "(\\s|\/u\/|^)(" + data.creators.entries.join("|") + ")([^\\w]|$)";

//Thanks to http://stackoverflow.com/users/517408/dov-amir for the core of the ajax method
var ajax = {};

ajax.send = function(url, callback, method, data, sync) {
    var x = new XMLHttpRequest();
    x.open(method, url, sync);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            callback(x.responseText)
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), callback, 'GET', null, sync)
};

ajax.post = function(url, data, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, callback, 'POST', query.join('&'), sync)
};

//Escapes string for use in RegEx
function escapeRegEx(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

//Data for a blacklist entry
function BlacklistEntry(reddit, wallet, email, skype, deleted, reason) {
    this.reddit = reddit;
    this.wallet = wallet;
    this.email = email;
    this.skype = skype;
    this.deleted = deleted;
    this.reason = reason;
}

function foreach(arr, operation){
    for(var i = 0; i < arr.length; i++){
        operation(arr[i]);
    }
}

//jQuery Equivalent
function parseHTML(str){
    var temp = document.implementation.createHTMLDocument();
    temp.body.innerHTML = str;
    return temp.body.children;
}

function parseHTMLPage(str){
    var doc = document.implementation.createHTMLDocument();
    doc.documentElement.innerHTML = str;
    return doc;
}

//Black List\\
function getBlacklist(){
    ajax.get(data.blacklist.src, {key: "0AhWLG0SR75vodDA2SG1OcEJKUFhXQ3Z3aHo2blQ3SkE", output: "csv"}, function(response_raw) {
        var response = $.csv.toArrays(response_raw); //TODO
        var regexBuild = {
            "reddit": [],
            "wallet": [],
            "email": [],
            "skype": []};
        for (var i = 1; i < response.length; i++) {
            var wallet = [];

            foreach(response[i][3].split("\n"), function(val){
                wallet.push(val.trim());
            });

            var email = [];
            
            foreach(response[i][4].split("\n"), function(val){
                email.push(val.trim());
            });

            var skype = [];
            
            foreach(response[i][5].split("\n"), function(val){
                skype.push(val.trim());
            });

            var reason = [];

            foreach(response[i][6].split("\n"), function(val){
                reason.push(val.trim());
            });

            data.blacklist.entries.push(
                new BlacklistEntry(
                    response[i][0].trim(),
                    wallet,
                    email,
                    skype,
                    (response[i][1].trim().toLowerCase() === "yes"),
                    reason));

            if (response[i][0] !== "") {
                regexBuild.reddit.push(escapeRegEx(response[i][0].trim()));
            }
            foreach(wallet, function(val){
                if (val.length > 0){
                    regexBuild.wallet.push(escapeRegEx(val));
                }
            });
            foreach(email, function(val){
                if (val.length > 0){
                    regexBuild.email.push(escapeRegEx(val));
                }
            });
            foreach(skype, function(val){
                if (val.length > 0){
                    regexBuild.skype.push(escapeRegEx(val));
                }
            });
        }

        if (regexBuild.reddit.length > 0){
            data.blacklist.regex.reddit = "(\\s|\/u\/|^)(" + regexBuild.reddit.join("|") + ")([^\\w]|$)";
        }
        if (regexBuild.wallet.length > 0){
            data.blacklist.regex.wallet = "(\\s|^)(" + regexBuild.wallet.join("|") + ")([^\\w]|$)";
        }
        if (regexBuild.email.length > 0){
            data.blacklist.regex.email = "(\\s|^)(" + regexBuild.email.join("|") + ")([^\\w]|$)";
        }
        if (regexBuild.skype.length > 0){
            data.blacklist.regex.skype = "(\\s|^)(" + regexBuild.skype.join("|") + ")([^\\w]|$)";
        }

        data.blacklist.populated = true;
    });
    /*$.ajax({
        url: data.blacklist.src,
        success: function (response_raw) {
            var response = $.csv.toArrays(response_raw);
            var regexBuild = {
                "reddit": [],
                "wallet": [],
                "email": [],
                "skype": []};
            for (var i = 1; i < response.length; i++) {
                var wallet = [];
                
                $.each(response[i][3].split("\n"), function(){
                    wallet.push(this.trim());
                });

                var email = [];
                
                $.each(response[i][4].split("\n"), function(){
                    email.push(this.trim());
                });

                var skype = [];
                
                $.each(response[i][5].split("\n"), function(){
                    skype.push(this.trim());
                });

                var reason = [];

                $.each(response[i][6].split("\n"), function(){
                    reason.push(this.trim());
                });

                data.blacklist.entries.push(
                    new BlacklistEntry(
                        response[i][0].trim(),
                        wallet,
                        email,
                        skype,
                        (response[i][1].trim().toLowerCase() === "yes"),
                        reason));

                if (response[i][0] !== "") {
                    regexBuild.reddit.push(escapeRegEx(response[i][0].trim()));
                }
                $.each(wallet, function(){
                    if (this.length > 0){
                        regexBuild.wallet.push(escapeRegEx(this));
                    }
                });
                $.each(email, function(){
                    if (this.length > 0){
                        regexBuild.email.push(escapeRegEx(this));
                    }
                });
                $.each(skype, function(){
                    if (this.length > 0){
                        regexBuild.skype.push(escapeRegEx(this));
                    }
                });
            }

            if (regexBuild.reddit.length > 0){
                data.blacklist.regex.reddit = "(\\s|\/u\/|^)(" + regexBuild.reddit.join("|") + ")([^\\w]|$)";
            }
            if (regexBuild.wallet.length > 0){
                data.blacklist.regex.wallet = "(\\s|^)(" + regexBuild.wallet.join("|") + ")([^\\w]|$)";
            }
            if (regexBuild.email.length > 0){
                data.blacklist.regex.email = "(\\s|^)(" + regexBuild.email.join("|") + ")([^\\w]|$)";
            }
            if (regexBuild.skype.length > 0){
                data.blacklist.regex.skype = "(\\s|^)(" + regexBuild.skype.join("|") + ")([^\\w]|$)";
            }



            data.blacklist.populated = true;
        },
        error: function (jqXHR, textError, errorThrown) {
            console.warn("Blacklist: " + textError + " - " + errorThrown);
        }
    });*/
}

getBlacklist();

setInterval(
    function(){
        getBlacklist();
        console.log("Refreshing blacklist")
    }, 60*60*1000);

//Mods\\
ajax.get(data.mods.src, {}, function(response_raw){
    var response = parseHTMLPage(response_raw);
    var results = response.body.querySelectorAll("div.side > .spacer > .sidecontentbox");
    foreach(results, function(entry){
        if(entry.querySelector(".title > h1").innerText === "MODERATORS"){
            var mods = entry.querySelectorAll(".content > li > a");
            for(var i = 0; i < mods.length; i++){
                data.mods.entries.push(mods[i].innerText);
            }
            data.mods.regex = "(\\s|\/u\/|^)(" + data.mods.entries.join("|") + ")([^\\w]|$)";
            data.mods.populated = true;
        }
    })
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.get === "user_verification"){
            ajax.get("http://doge.gusgold.com/api/helper/verification.php", {u: request.user, f: "json"}, function(response){
                var threads = JSON.parse(response);
                if(threads.length > 0){
                    sendResponse({
                        success: true,
                        threads: threads
                    });
                } else {
                    sendResponse({
                        success: true,
                        threads: "None found for user"
                    });
                }
            });
            return true;
        } else if (request.get === "help"){
            chrome.tabs.create({
                url: chrome.extension.getURL("html/support/help.html")
            });
            sendResponse({
                success: "true"
            });
        } else if (request.get === "settings"){
            var allowedToRun = true;
            if(localStorage.privateAllowed === "false"){
                chrome.tabs.query({
                    currentWindow: true, 
                    active : true},
                function(tabs){
                    if(tabs[0].url.indexOf("reddit.com/message") !== -1){
                        allowedToRun = false;
                    }
                    sendResponse({
                        settings: localStorage,
                        allowedToRun: allowedToRun
                    });
                });
            } else {
                sendResponse({
                    settings: localStorage,
                    allowedToRun: allowedToRun
                });
            }
        } else if (request.get === "mods"){
            if(data.mods.populated){
                sendResponse({
                    populated: true,
                    entries: data.mods.entries,
                    regex: data.mods.regex,
                    replacement: data.mods.replacement
                });
            } else {
                sendResponse({
                    populated: false
                });
            }
        } else if(request.get === "blacklist"){
            if(data.blacklist.populated){
                sendResponse({
                    populated: true,
                    entries: data.blacklist.entries,
                    regex: data.blacklist.regex,
                    replacement: data.blacklist.replacement
                });
            } else {
                sendResponse({
                    populated: false
                });
            }
        } else if(request.get === "creators"){
            sendResponse({
                entries: data.creators.entries,
                regex: data.creators.regex,
                replacement: data.creators.replacement
            });
        }
    }
);