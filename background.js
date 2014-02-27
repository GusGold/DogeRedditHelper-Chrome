var data = {
	"blacklist":{
		"populated":false,
		"src":"https://docs.google.com/spreadsheet/pub?key=0Aqnnk6Qcgo_edDNWOUY4dV91YndZRVh6QmVxanQ2Mmc&single=true&output=csv",
		"reddit":[],
		"email":[],
		"skype":[]
		},
	"mods":{
		"populated":false,
		"src":"http://www.reddit.com/r/dogemarket/",
		"mods":[]
		},
	"creator":{
		"reddit":"GusGold"
		}
	};


//Black List\\
$.ajax({
	url: data.blacklist.src,
	success: function(response_raw){
		var response = $.csv.toArrays(response_raw);
		for(var i = 1; i < response.length; i++){
			if(response[i][0] !== ""){
				data.blacklist.reddit.push(response[i][0].trim());
			}
			if(response[i][1] !== ""){
				data.blacklist.email.push(response[i][1].trim());	
			}
			if(response[i][2] !== ""){
				data.blacklist.skype.push(response[i][2].trim());	
			}
		}
		data.blacklist.populated = true;
	}
});

//Mods\\
$.ajax({
	url: data.mods.src,
	success: function(response_raw){
		var response = $.parseHTML(response_raw);
		$("body").html(response);
		var results = $("body").find("div.side > .spacer > .sidecontentbox");
		for(var i = 0; i < results.length; i++){
			$("body").html(results[i]);
			if($("body").find(".title > h1").text() == "MODERATORS"){
				$("body").html(results[i]);
				$("body .content > li > a").each(function(){
					data.mods.mods.push($(this).text());
				});
				data.mods.populated = true;
				break;
			}
		}
	}
});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    	if (request.get == "mods"){
    		if(data.mods.populated){
        		sendResponse({
        			populated: true,
        			mods: data.mods.mods
        		});
        	} else {
        		sendResponse({
        			populated: false
        		});
        	}
    	} else if(request.get == "blacklist"){
    		if(data.blacklist.populated){
    			sendResponse({
    				populated: true,
    				reddit: data.blacklist.reddit,
    				email: data.blacklist.email,
    				skype: data.blacklist.skype
    			});
    		} else {
    			sendResponse({
    				populated: false
    			});
    		}
    	} else if(request.get == "creator"){
    		sendResponse({
    			reddit: data.creator.reddit
    		});
    	}
    }
);