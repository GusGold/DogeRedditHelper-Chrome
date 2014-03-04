/******
 Setup
******/

var errors = [];

//Main data bank
var data = {
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
            $("#ggdc-bar-content").html("Unable to get all necessary data. Dogemarket Helper " + errors[0] + ". <br/> Please reload the page.");
        } else {
            $("#ggdc-bar-content").html("Unable to get all necessary data. Dogemarket Helper " + errors.join(" and ") + ". <br/> Please reload the page.");
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
	                    <tr><td>Reason</td><td>" + entry.reason.replace(/((http|https):\/\/([\w-.]+)+(:\d+)?(\/([\w\/_\\-\\.]*(\?\S+)?)?)?)/, "<a href=\"$1\" target=\"_blank\">$1</a>") + "</td></tr></table>");
	            } else if (~$.inArray("ggdc-moderator", parClass)){
	            	var mod = $(parent).attr("data-ggdc-moderator-reddit");
	                $("#ggdc-bar-content").attr("class", "ggdc-bar-content-moderator");
	                $("#ggdc-bar-content").html("User is a current moderator of /r/DogeMarket");
	            } else if (~$.inArray("ggdc-creators", parClass)){
	            	var creator = $(parent).attr("data-ggdc-creator-reddit");
	                $("#ggdc-bar-content").attr("class", "ggdc-bar-content-creators");
	                $("#ggdc-bar-content").html("User created the /r/DogeMarket Helper Extension for Chrome");
	            } else {
	            	var user = $(parent).attr("data-ggdc-user-reddit");
	                $("#ggdc-bar-content").attr("class", "");
	                $("#ggdc-bar-content").html("There is no information on this user, always trade with care.");
	            }
	            $("#ggdc-bar").attr("class", "ggdc-bar-open");
	            fixSpacerHeight();
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

//Insert our bar with default content
$("body").prepend('\
    <div id="ggdc-bar-spacer">\
    </div>\
    <div id="ggdc-bar">\
        <div id="ggdc-bar-head">\
            <span class="ggdc-bar-tips">Tips? D5hUdmJCGVpLxZgVBwqvKY5UFr51bFRZ9y</span>\
            <span class="ggdc-bar-toggle">Show/Hide</span>\
            <span class="ggdc-bar-rescan"><abbr title="Useful if you loaded more content (like RES\'s \'Never Ending Reddit\')"">Rescan Page</abbr></span>\
            <span class="ggdc-bar-head-title"><a href="http://www.reddit.com/r/dogemarket">/r/DogeMarket</a> Helper! By <a href="http://www.reddit.com/user/GusGold/">/u/GusGold</a>.</span>\
        </div>\
        <div id="ggdc-bar-content">\
            There\'s nothing here! Hover over highlighted names below and click on "More info" for details about them.\
        </div>\
    </div>');

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
    fixSpacerHeight();
});

//Get Values from background.js
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
        });
    });
});
