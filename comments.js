var data = {
	"creator":{
		"reddit": ""},
	"mods": [],
	"blacklist":{
		"reddit": [],
		"email": [],
		"skype": []
	}
},
errors = [];
chrome.runtime.sendMessage({get: "creator"}, function(response) {
	data.creator.reddit = response.reddit;

	chrome.runtime.sendMessage({get: "mods"}, function(response) {
		if(response.populated){
			data.mods.mods = response.mods;
		}

		chrome.runtime.sendMessage({get: "blacklist"}, function(response) {
			if(response.populated){
				data.blacklist.reddit = response.reddit;
				data.blacklist.email = response.email;
				data.blacklist.skype = response.skype;
			}

			$(".usertext-body > .md").each(function(){
				var html = $(this).html();
				$.each(data.mods.mods, function(i, val){
					var repl = new RegExp("( " + escapeRegExp(val) + " )", ["gi"]);
					html = html.replace(
						repl, 
						$("<span/>",{
							"class": "gusgold-dogecoin-moderator",
							text: data.mods.mods[i]
						}).append($("<span/>", {
							"class": "gusgold-dogecoin-moderator-popup",
							"html": "This user is a current moderator"
						})).prop("outerHTML"),
						true);
				});
				$.each(data.blacklist.reddit, function(i, val){
					var repl = new RegExp("( " + escapeRegExp(val) + " )", ["gi"]);
					html = html.replace(
						repl, 
						$("<span/>",{
							"class": "gusgold-dogecoin-blacklist",
							text: data.blacklist.reddit[i]
						}).append($("<span/>", {
							"class": "gusgold-dogecoin-blacklist-popup",
							"html": "This user is on the blacklist<br/>Trade with extreme caution"
						})).prop("outerHTML"),
						true);
				});
				$.each(data.blacklist.email, function(i, val){
					var repl = new RegExp("( " + escapeRegExp(val) + " )", ["gi"]);
					html = html.replace(
						repl, 
						$("<span/>",{
							"class": "gusgold-dogecoin-blacklist",
							text: data.blacklist.email[i]
						}).append($("<span/>", {
							"class": "gusgold-dogecoin-blacklist-popup",
							"html": "This email is on the blacklist<br/>Trade with extreme caution"
						})).prop("outerHTML"),
						true);
				});$.each(data.blacklist.skype, function(i, val){
					var repl = new RegExp("( " + escapeRegExp(val) + " )", ["gi"]);
					html = html.replace(
						repl, 
						$("<span/>",{
							"class": "gusgold-dogecoin-blacklist",
							text: data.blacklist.skype[i]
						}).append($("<span/>", {
							"class": "gusgold-dogecoin-blacklist-popup",
							"html": "This skype is on the blacklist<br/>Trade with extreme caution"
						})).prop("outerHTML"),
						true);
				});
				$(this).html(html);
				/*if($.inArray($(this).text(), data.mods.mods) != -1){
					$(this).addClass("gusgold-dogecoin-moderator");
					$(this).append($("<span/>", {
						"class": "gusgold-dogecoin-moderator-popup",
						"html": "This user is a current moderator"
					}));
				} else if($(this).text() == data.creator.reddit){
					$(this).addClass("gusgold-dogecoin-creator");
					$(this).append($("<span/>", {
						"class": "gusgold-dogecoin-creator-popup",
						"html": "This user created Dogecoin Helper!"
					}));
				} else if($.inArray($(this).text(), data.blacklist.reddit) != -1){
					$(this).addClass("gusgold-dogecoin-blacklist");
					$(this).append($("<span/>", {
						"class": "gusgold-dogecoin-blacklist-popup",
						"html": "This user is on the blacklist<br/>Trade with extreme caution"
					}));
				}*/
			});
		});
	});
});

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}