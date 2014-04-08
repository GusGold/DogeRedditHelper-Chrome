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
    $("#ggdc-bar-spacer").height($("#ggdc-bar").height() + 10);
}

//Shows whatever is in errors[]
function showErrors(){
    if(errors.length){
        if(errors.length === 1){
            $("#ggdc-bar-content").html("Unable to get all necessary data. Dogemarket Helper " + errors[0] + ". <br/> Please reload the page. If this continues to show, an error has occured while trying to get this information. Please restart the extension to fix.");
        } else {
            $("#ggdc-bar-content").html("Unable to get all necessary data. Dogemarket Helper " + errors.join(" and ") + ". <br/> Please reload the page. If this continues to show, an error has occured while trying to get this information. Please restart the extension to fix.");
        }
        $("#ggdc-bar-content").attr("class", "ggdc-bar-content-warning");
        $("#ggdc-bar").toggleClass("ggdc-bar-open");
        fixSpacerHeight();
        errors = [];
    }
}

function addOnClick(){
    $(".content").find(".ggdc-popup").each(function(){
        if($(this).parent().attr("data-ggdc-found") !== "1"){
            $(this).parent().attr("data-ggdc-found", "1");
            $(this).click(function(event){
                event.preventDefault();
                var user_reddit;
                var parent = $(this).parent()
                var parClass = parent.attr("class").split(" ");
                if(~$.inArray("ggdc-blacklist", parClass)){
                    var entry;
                    if ($(parent).attr("data-ggdc-blacklist-reddit") !== undefined) {
                        entry = $.grep(data.blacklist.entries, function(entry){
                            return(entry.reddit.toLowerCase() === $(parent).attr("data-ggdc-blacklist-reddit").toLowerCase());
                        })[0];  
                    } else if ($(parent).attr("data-ggdc-blacklist-wallet") !== undefined) {
                        entry = $.grep(data.blacklist.entries, function(entry){
                            var result;
                            $.each(entry.wallet, function(i, val){
                                if(val.trim() == $(parent).attr("data-ggdc-blacklist-wallet").trim()){
                                    result = true;
                                }   
                            });
                            return result;
                        })[0];
                    } else if ($(parent).attr("data-ggdc-blacklist-email") !== undefined) {
                        entry = $.grep(data.blacklist.entries, function(entry){
                            var result;
                            $.each(entry.email, function(i, val){
                                if(val.toLowerCase() === $(parent).attr("data-ggdc-blacklist-email").toLowerCase()){
                                    result = true;
                                }   
                            });
                            return result;
                        })[0];
                    } else if ($(parent).attr("data-ggdc-blacklist-skype") !== undefined) {
                        entry = $.grep(data.blacklist.entries, function(entry){
                            var result;
                            $.each(entry.skype, function(i, val){
                                if(val.toLowerCase() === $(parent).attr("data-ggdc-blacklist-skype").toLowerCase()){
                                    result = true;
                                }   
                            });
                            return result;
                        })[0];
                    }
                    $("#ggdc-bar-content").attr("class", "ggdc-bar-content-warning");
                    $("#ggdc-bar-content").html("User is on the blacklist! Take extreme care if trading. Details are listed below:<br><br>\
                        <table class=\"ggdc-bar-content-infotable\"><colgroup><col span=\"1\" style=\"width:200px\"><col span=\"1\" ></colgroup>\
                        <tr><td>Reddit Username</td><td>" + entry.reddit + "</td></tr>\
                        <tr><td>Known Addresses</td><td>" + entry.wallet.join("<br>") + "</td></tr>\
                        <tr><td>Email Addresses</td><td>" + entry.email.join("<br>") + "</td></tr>\
                        <tr><td>Skype</td><td>" + entry.skype.join("<br>") + "</td></tr>\
                        <tr><td>Reason</td><td>" + entry.reason.join("<br>").replace(/((http|https):\/\/([\w-.]+)+(:\d+)?(\/([\w\/_\\-\\.]*(\?\S+)?)?)?)/gi, "<a href=\"$1\" target=\"_blank\">$1</a>") + "</td></tr></table>");
                    user_reddit = entry.reddit;
                } else if (~$.inArray("ggdc-moderator", parClass)){
                    var mod = $(parent).attr("data-ggdc-moderator-reddit");
                    $("#ggdc-bar-content").attr("class", "ggdc-bar-content-moderator");
                    $("#ggdc-bar-content").html("User is a current moderator of /r/DogeMarket");
                    user_reddit = mod;
                } else if (~$.inArray("ggdc-creators", parClass)){
                    var creator = $(parent).attr("data-ggdc-creator-reddit");
                    $("#ggdc-bar-content").attr("class", "ggdc-bar-content-creators");
                    $("#ggdc-bar-content").html("User created the /r/DogeMarket Helper Extension for Chrome");
                    user_reddit = creator;
                } else {
                    var user = $(parent).attr("data-ggdc-user-reddit");
                    $("#ggdc-bar-content").attr("class", "");
                    $("#ggdc-bar-content").html("There is no special information on this user, always trade with care.");
                    user_reddit = user;
                }
                $("#ggdc-bar-content").append("<table class=\"ggdc-bar-content-details\">\
                    <colgroup><col span=\"1\" style=\"width:200px\"><col span=\"1\" ></colgroup>\
                    <tr><td>Verification Threads</td><td id=\"ggdc-bar-content-details-verification\">Loading...</td></tr>")
                $("#ggdc-bar").attr("class", "ggdc-bar-open");
                if(data.settings.alwaysShowBar === "false" && !$("#ggdc-bar").hasClass("ggdc-bar-open")){
                    $("#ggdc-bar").hide();
                    $("#ggdc-bar-spacer").hide();
                } else {
                    $("#ggdc-bar").show();
                    $("#ggdc-bar-spacer").show();
                }
                fixSpacerHeight();
                chrome.runtime.sendMessage({
                    get: "user_verification",
                    user: user_reddit
                }, function(response){
                    if(response.success){
                        $("#ggdc-bar-content-details-verification").html(response.threads);
                    } else {
                        $("#ggdc-bar-content-details-verification").html("Could not look up username. Server may be offline.");
                    }
                    fixSpacerHeight();
                });
            });
        }
    });
}

//Thanks to https://forum.jquery.com/user/kbwood.au for the core of this function
function highlightField(node) {
    var found = $(node).attr("data-ggdc-found") === "1";
    $(node).contents().each(function() {
        if (this.nodeType === 3) { // Text
            if (!found){
                //Mods
                var content = this.nodeValue.replace(new RegExp(data.mods.regex, "gi"), data.mods.replacement);

                //Creators
                content = content.replace(new RegExp(data.creators.regex, "gi"), data.creators.replacement);

                //Blacklist

                for (var key in data.blacklist.regex){
                    if(data.blacklist.regex.hasOwnProperty(key)){
                        content = content.replace(new RegExp(data.blacklist.regex[key], "gi"), data.blacklist.replacement[key]);
                    }
                }
                if (content !== this.nodeValue) {
                    $(this).replaceWith(content);
                }
            }
        }
        else if (this.nodeType === 1) { // Element
            highlightField(this);
        }
    });
}

/*****
 Main
*****/


chrome.runtime.sendMessage({get: "settings"}, function(response){

    data.settings = response.settings;

    if(response.allowedToRun){

        //Insert our bar with default content
        $("body").prepend('\
            <div id="ggdc-bar-spacer" style="display: none;">\
            </div>\
            <div id="ggdc-bar" style="display: none;">\
                <div id="ggdc-bar-head">\
                    <span class="ggdc-bar-tips">Tips?</span>\
                    <span class="ggdc-bar-help">Help&Support</span>\
                    <span class="ggdc-bar-toggle">Show/Hide</span>\
                    <span class="ggdc-bar-rescan"><abbr title="Useful if you loaded more content (like RES\'s \'Never Ending Reddit\')"">Rescan Page</abbr></span>\
                    <span class="ggdc-bar-head-title"><a href="http://www.reddit.com/r/dogemarket">/r/DogeMarket</a> Helper! By <a href="http://www.reddit.com/user/GusGold/">/u/GusGold</a>.</span>\
                </div>\
                <div id="ggdc-bar-content">\
                    There\'s nothing here! Hover over highlighted names below and click on "More info" for details about them.\
                </div>\
            </div>');

        fixSpacerHeight();

        //Display if our window is too small
        $(window).resize(function(){
            var message_tooSmall = "For /r/DogeMarket Helper to function properly, it prefers a browser width of at least 830 pixels. Please expand the window to solve this.<br>\
                    If this is not possible, /r/DogeMarket Helper will continue to function normally, but some graphical errors may occur.";

            if($(window).width() < 830){
                $("#ggdc-bar-content").attr("class", "");
                $("#ggdc-bar-content").html(message_tooSmall);
                $("#ggdc-bar").attr("class", "ggdc-bar-open");
            } else if($("#ggdc-bar-content").html() == message_tooSmall){
                $("#ggdc-bar-content").html("");
                $("#ggdc-bar").attr("class", "");
            }
            fixSpacerHeight();
        });

        //Opens and closes bar
        $(".ggdc-bar-toggle").click(function(e){
            $("#ggdc-bar").toggleClass("ggdc-bar-open");
            if(data.settings.alwaysShowBar === "false" && !$("#ggdc-bar").hasClass("ggdc-bar-open")){
                $("#ggdc-bar").hide();
                $("#ggdc-bar-spacer").hide();
            } else {
                $("#ggdc-bar").show();
                $("#ggdc-bar-spacer").show();
            }
            fixSpacerHeight();
        });

        //Shows Tip address
        $(".ggdc-bar-tips").click(function(e){
            $("#ggdc-bar-content").attr("class", "");
            $("#ggdc-bar-content").html("If you feel this extension has helped, please consider donating a few Doge to D5hUdmJCGVpLxZgVBwqvKY5UFr51bFRZ9y.<br>Thank you!");
            $("#ggdc-bar").attr("class", "ggdc-bar-open");
            fixSpacerHeight();
        });

        //Shows the help page
        $(".ggdc-bar-help").click(function(e){
            chrome.runtime.sendMessage({get: "help"}, function(response) {
                console.warn(response);
            });
        });

        //Get Values from background.js
        if(data.settings.alwaysShowBar === "false" && !$("#ggdc-bar").hasClass("ggdc-bar-open")){
            $("#ggdc-bar").hide();
            $("#ggdc-bar-spacer").hide();
        } else {
            $("#ggdc-bar").show();
            $("#ggdc-bar-spacer").show();
        }

        chrome.runtime.sendMessage({get: "creators"}, function(response) {

            data.creators.entries = response.entries;
            data.creators.regex = response.regex;
            data.creators.replacement = response.replacement;

            chrome.runtime.sendMessage({get: "mods"}, function(response) {

                if(response.populated){
                    data.mods.entries = response.entries;
                    data.mods.regex = response.regex;
                    data.mods.replacement = response.replacement;
                } else {
                    errors.push("could not get list of moderators");
                }

                chrome.runtime.sendMessage({get: "blacklist"}, function(response) {
                    
                    if(response.populated){
                        data.blacklist.entries = response.entries;
                        data.blacklist.regex = response.regex;
                        data.blacklist.replacement = response.replacement;
                    } else {
                        errors.push("could not get blacklist information");
                    }

                    showErrors();

                    highlighter_js();
                    
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
                    
                    chrome.extension.onMessage.addListener(function(request, sender, response){
                        if(request.from === "page_action"){
                            if(request.action === "show"){
                                if(request.context === "info"){
                                    $("#ggdc-bar").attr("class", "ggdc-bar-open");
                                    $("#ggdc-bar").show();
                                    $("#ggdc-bar-spacer").show();
                                    fixSpacerHeight();
                                } else if(request.context === "donation"){
                                    $("#ggdc-bar-content").attr("class", "");
                                    $("#ggdc-bar-content").html("If you feel this extension has helped, please consider donating a few Doge to D5hUdmJCGVpLxZgVBwqvKY5UFr51bFRZ9y.<br>Thank you!");
                                    $("#ggdc-bar").attr("class", "ggdc-bar-open");
                                    $("#ggdc-bar").show();
                                    $("#ggdc-bar-spacer").show();
                                    fixSpacerHeight();
                                }
                            } else if (request.action === "do"){
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