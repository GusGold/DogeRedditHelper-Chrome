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
    $.each(tabs, function(i, tab){
        if (tab.url.indexOf("reddit.com/r/dogemarket") !== -1 || (localStorage.privateAllowed === "true" && tab.url.indexOf("reddit.com/message") !== -1)){
            chrome.pageAction.show(tab.id);
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
    console.warn(JSON.stringify(changeInfo) + " - " + JSON.stringify(tab));
    if(tab.url.indexOf("reddit.com/r/dogemarket") !== -1 || (localStorage.privateAllowed === "true" && tab.url.indexOf("reddit.com/message") !== -1)){
        chrome.pageAction.show(tabId);
    }
});

var data = {
    "blacklist": {
        "populated": false,
        "src": "https://docs.google.com/spreadsheet/ccc?key=0AhWLG0SR75vodDA2SG1OcEJKUFhXQ3Z3aHo2blQ3SkE&output=csv",
        "entries": [],
        "regex": {
            "reddit": "",
            "wallet": "",
            "email": "",
            "skype": ""},
        "replacement": {
            "reddit": "$1" + 
                $("<span/>",{
                    "class": "ggdc-blacklist ggdc-info",
                    text: "$2",
                    "data-ggdc-blacklist-reddit": "$2"
                }).append($("<span/>", {
                    "class": "ggdc-popup",
                    "html": "More info"
                })).prop("outerHTML") + "$3",
            "wallet": "$1" + 
                $("<span/>",{
                    "class": "ggdc-blacklist ggdc-info",
                    text: "$2",
                    "data-ggdc-blacklist-wallet": "$2"
                }).append($("<span/>", {
                    "class": "ggdc-popup",
                    "html": "More info"
                })).prop("outerHTML") + "$3",
            "email": "$1" + 
                $("<span/>",{
                    "class": "ggdc-blacklist ggdc-info",
                    text: "$2",
                    "data-ggdc-blacklist-email": "$2"
                }).append($("<span/>", {
                    "class": "ggdc-popup",
                    "html": "More info"
                })).prop("outerHTML") + "$3",
            "skype": "$1" + 
                $("<span/>",{
                    "class": "ggdc-blacklist ggdc-info",
                    text: "$2",
                    "data-ggdc-blacklist-skype": "$2"
                }).append($("<span/>", {
                    "class": "ggdc-popup",
                    "html": "More info"
                })).prop("outerHTML") + "$3"}
        },
    "mods": {
        "populated": false,
        "src": "http://www.reddit.com/r/dogemarket/",
        "entries": [],
        "regex": "",
        "replacement": "$1" + 
            $("<span/>",{
                "class": "ggdc-moderator ggdc-info",
                text: "$2",
                "data-ggdc-moderator-reddit": "$2"
            }).append($("<span/>", {
                "class": "ggdc-popup",
                "html": "More info"
            })).prop("outerHTML") + "$3"
    },
    "creators": {
        "entries": ["GusGold"],
        "regex": "",
        "replacement": "$1" + 
            $("<span/>",{
                "class": "ggdc-creators ggdc-info",
                text: "$2",
                "data-ggdc-creator-reddit": "$2"
            }).append($("<span/>", {
                "class": "ggdc-popup",
                "html": "More info"
            })).prop("outerHTML") + "$3"
    }
};

data.creators.regex = "(\\s|\/u\/|^)(" + data.creators.entries.join("|") + ")([^\\w]|$)";

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

//Black List\\
$.ajax({
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

            data.blacklist.entries.push(
                new BlacklistEntry(
                    response[i][0].trim(),
                    wallet,
                    email,
                    skype,
                    (response[i][1].trim().toLowerCase() === "yes"),
                    response[i][6].trim()));

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
});

//Mods\\
$.ajax({
    url: data.mods.src,
    success: function (response_raw) {
        var response = $.parseHTML(response_raw);
        $("body").html(response);
        var results = $("body").find("div.side > .spacer > .sidecontentbox");
        for (var i = 0; i < results.length; i++) {
            $("body").html(results[i]);
            if ($("body").find(".title > h1").text() == "MODERATORS") {
                $("body").html(results[i]);
                var regexBuild = [];
                $("body .content > li > a").each(function(){
                    data.mods.entries.push($(this).text());
                    regexBuild.push($(this).text());
                });
                data.mods.populated = true;
                data.mods.regex = "(\\s|\/u\/|^)(" + regexBuild.join("|") + ")([^\\w]|$)";
                break;
            }
        }
    },
    error: function (jqXHR, textError, errorThrown) {
        console.warn("Mods: " + textError + " - " + errorThrown);
    }
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        if (request.get === "help"){
            chrome.tabs.create({
                url: chrome.extension.getURL("html/support/help.html")
            });
            sendResponse({
                success: "true"
            });
        }
        if (request.get === "settings"){
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