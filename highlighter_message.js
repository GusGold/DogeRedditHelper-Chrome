$("body").prepend($(
	"<div/>", {
		id: "gusgold-dogecoin-warning"
	}));

var data = {
	"creator":{
		"reddit": ""},
	"mods": [],
	"blacklist":{
		"reddit": []
	}
};

errors = [];

chrome.runtime.sendMessage({get: "creator"}, function(response) {

	data.creator.reddit = response.reddit;

	chrome.runtime.sendMessage({get: "mods"}, function(response) {

		if(response.populated){
			data.mods.mods = response.mods;
		} else {
			errors.push("could not get list of moderators");
		}

		chrome.runtime.sendMessage({get: "blacklist"}, function(response) {
			
			if(response.populated){
				data.blacklist.reddit = response.reddit;
			} else {
				errors.push("could not get blacklist information");
			}

			showLoadErrors();

			$(".author").each(function(){
				if($.inArray($(this).text(), data.mods.mods) != -1){
					$(this).addClass("gusgold-dogecoin-moderator");
					$(this).append($("<span/>", {
						"class": "gusgold-dogecoin-moderator-popup gusgold-dogecoin-moderator_message-popup",
						"html": "This user is a moderator of DogeMarket"
					}));
				} else if($(this).text() == data.creator.reddit){
					$(this).addClass("gusgold-dogecoin-creator");
					$(this).append($("<span/>", {
						"class": "gusgold-dogecoin-creator-popup gusgold-dogecoin-creator_message-popup",
						"html": "This user created Dogecoin Helper!"
					}));
				} else if($.inArray($(this).text(), data.blacklist.reddit) != -1){
					$(this).addClass("gusgold-dogecoin-blacklist");
					$(this).append($("<span/>", {
						"class": "gusgold-dogecoin-blacklist-popup gusgold-dogecoin-blacklist_message-popup",
						"html": "This user is on the blacklist<br/>Trade with extreme caution"
					}));
				}
			});
		});
	});
});

function showLoadErrors(){
	if(errors.length){
		$("#gusgold-dogecoin-warning").html("Dogemarket Helper ");
		if(errors.length === 1){
			$("#gusgold-dogecoin-warning").html("Dogemarket Helper " + errors[0] + ". <br/> Please reload page.");
		} else {
			$("#gusgold-dogecoin-warning").html("Unable to get all necessary data. Dogemarket Helper " + errors.join(" and ") + ". <br/> Please reload page.");
		}
		$("#gusgold-dogecoin-warning").css("display", "block");
	}
}