/************
 Update Check
************/

// chrome.runtime.onInstalled.addListener(function(details){
//     if(details.reason == "install"){
//         chrome.tabs.create({
//             url: chrome.extension.getURL("html/installation/install.html")
//         });
//     } else if (details.reason == "update"){
//         chrome.tabs.create({
//             url: chrome.extension.getURL("html/installation/update.html")
//         });
//     }
// });

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

var intervals = {
    blacklist: null,
    mods: null};

var data = {
    "blacklist": {
        "populated": -1,
        "src": "http://doge.gusgold.com/api/helper/blacklist.php",
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
        "populated": -1,
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

ajax.send = function(url, data, retries, callback, sync, method) {
    var x = new XMLHttpRequest();
    x.open(method, url, sync);
    x.onreadystatechange = function() {
        if (x.readyState == 4) {
            if(x.status === 200){
                callback(x.responseText);
            } else if (retries !== 0){
                setTimeout(function(){
                    ajax.send(url, data, retries - 1, callback, sync, method);
                }, 3 * 1000);
            } else {
                callback(false);
            }
        }
    };
    if (method == 'POST') {
        x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.send(data)
};

ajax.get = function(url, data, retries, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url + '?' + query.join('&'), null, retries, callback, sync, 'GET');
};

ajax.post = function(url, data, retries, callback, sync) {
    var query = [];
    for (var key in data) {
        query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    ajax.send(url, query.join('&'), retries, callback, sync, 'POST');
};

//Thanks to http://stackoverflow.com/users/2378102/murplyx for this function
function Timer(callback, delay) {
    var id, started, remaining = delay, running

    this.start = function() {
        running = true;
        started = new Date();
        id = setTimeout(callback, remaining);
    }

    this.pause = function() {
        running = false;
        clearTimeout(id);
        remaining -= new Date() - started;
    }

    this.getTimeLeft = function() {
        if (running) {
            this.pause();
            this.start();
        }

        return remaining;
    }

    this.getStateRunning = function() {
        return running;
    }

    this.start()
}

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
    intervals.blacklist = new Timer(
            function(){
                getBlacklist();
                console.log("Refreshing blacklist");
            }, 60*60*1000);
    ajax.get(data.blacklist.src, {}, 3, function(response_raw) {
        if(response_raw !== false){
            var response = JSON.parse(response_raw);
            
            var regexBuild = {
                "reddit": [],
                "wallet": [],
                "email": [],
                "skype": []};
            for (var i = 1; i < response.length; i++) {
                var wallet = [];
                if(typeof response[i]["a"] !== "undefined"){
                    foreach(response[i]["a"].split("\n"), function(val){
                        wallet.push(val.trim());
                    });
                }

                var email = [];
                if(typeof response[i]["e"] !== "undefined"){
                    foreach(response[i]["e"].split("\n"), function(val){
                        email.push(val.trim());
                    });
                }

                var skype = [];
                if(typeof response[i]["s"] !== "undefined"){
                    foreach(response[i]["s"].split("\n"), function(val){
                        skype.push(val.trim());
                    });
                }

                var reason = [];
                if(typeof response[i]["r"] !== "undefined"){
                    foreach(response[i]["r"].split("\n"), function(val){
                        reason.push(val.trim());
                    });
                }

                data.blacklist.entries.push(
                    new BlacklistEntry(
                        (typeof response[i]["u"] !== "undefined" ? response[i]["u"].trim() : ""),
                        wallet,
                        email,
                        skype,
                        (typeof response[i]["d"] !== "undefined" && response[i]["d"].trim().toLowerCase() === "yes"),
                        reason));

                if (typeof response[i]["u"] !== "undefined" && response[i]["u"] !== "") {
                    regexBuild.reddit.push(escapeRegEx(response[i]["u"].trim()));
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

            data.blacklist.populated = 1;
        } else {
            if (data.blacklist.populated === 1){
                data.blacklist.populated = 2;
            } else {
                data.blacklist.populated = 0;
            }
        }
    });
}

getBlacklist();

//Mods\\
function getMods(){
    intervals.mods = new Timer(
            function(){
                getMods();
                console.log("Refreshing blacklist");
            }, 60*60*1000);

    ajax.get(data.mods.src, {}, 3, function(response_raw){
        if (response_raw !== false){
            var response = parseHTMLPage(response_raw);
            var results = response.body.querySelectorAll("div.side > .spacer > .sidecontentbox");
            foreach(results, function(entry){
                if(entry.querySelector(".title > h1").innerText === "MODERATORS"){
                    var mods = entry.querySelectorAll(".content > li > a");
                    for(var i = 0; i < mods.length; i++){
                        data.mods.entries.push(mods[i].innerText);
                    }
                    data.mods.regex = "(\\s|\/u\/|^)(" + data.mods.entries.join("|") + ")([^\\w]|$)";
                    data.mods.populated = 1;
                }
            })
        } else {
            if (data.mods.populated === 1){
                data.mods.populated = 2;
            } else {
                data.mods.populated = 0;
            }
        }
    });
};

getMods();

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.get === "user_verification"){
            ajax.get("http://doge.gusgold.com/api/helper/verification.php", {u: request.user, f: "json"}, 3, function(response){
                var threads = JSON.parse(response);
                if(threads.length > 0){
                    sendResponse({
                        success: true,
                        threads: threads
                    });
                } else {
                    sendResponse({
                        success: true,
                        threads: []
                    });
                }
            });
            return true;
        } else if (request.get === "refresh"){
            getBlacklist();
            getMods();
            sendResponse({
                success: "true"
            });
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
            if(data.mods.populated > 0){
                sendResponse({
                    populated: true,
                    entries: data.mods.entries,
                    regex: data.mods.regex,
                    replacement: data.mods.replacement
                });
            } else if(data.mods.populated === -1){
                sendResponse({
                    populated: false,
                    reason: "is still trying to get the list of mods"
                });
            } else {
                sendResponse({
                    populated: false,
                    reason: "couldn't get list of moderators (retrying in " + Math.ceil(intervals.mods.getTimeLeft() / (60 * 1000)) + " minute" + (Math.ceil(intervals.mods.getTimeLeft() / (60 *1000)) === 1 ? "" : "s") + ")"
                });
            }
        } else if(request.get === "blacklist"){
            if(data.blacklist.populated === 1){
                sendResponse({
                    populated: true,
                    entries: data.blacklist.entries,
                    regex: data.blacklist.regex,
                    replacement: data.blacklist.replacement
                });
            } else if (data.blacklist.populated === 2){
                sendResponse({
                    populated: false,
                    reason: "couldn't get updated blacklist information. The information is still okay, but it is not the latest. It will automatically retry in " + Math.ceil(intervals.blacklist.getTimeLeft() / (60 * 1000)) + " minute" + (Math.ceil(intervals.blacklist.getTimeLeft() / (60 *1000)) === 1 ? "" : "s")
                })
            } else if (data.blacklist.populated === 0){
                sendResponse({
                    populated: false,
                    reason: "couldn't get the blacklist information. It will automatically retry in " + Math.ceil(intervals.blacklist.getTimeLeft() / (60 * 1000)) + " minute" + (Math.ceil(intervals.blacklist.getTimeLeft() / (60 *1000)) === 1 ? "" : "s") + " or you can <a href='#' id='ggdc-bar-content-retry'>click here</a> to retry instantly"
                });
            } else {
                sendResponse({
                    populated: false,
                    reason: "is still trying to get the blacklist information. Try refreshing in a few seconds"
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