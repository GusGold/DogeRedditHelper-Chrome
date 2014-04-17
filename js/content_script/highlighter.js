//Finds and marks Authors for highlighting
function highlightAuthors(){
    var elems = $(".content .author");
    var index = 0;
    var total = elems.length;
    var intId = setInterval(function(){
    	if ($(elems.get(index)).attr("data-ggdc-found") !== "1"){
	        var text = $(elems.get(index)).text();
	        if(~$.inArray(text, data.mods.entries)){
	            $(elems.get(index)).addClass("ggdc-moderator");
	            $(elems.get(index)).attr("data-ggdc-moderator-reddit", escapeQuotes(text));
	        } else if(text == data.creators.entries){
	            $(elems.get(index)).addClass("ggdc-creators");
	            $(elems.get(index)).attr("data-ggdc-creator-reddit", escapeQuotes(text));
	        } else if($.grep(data.blacklist.entries, function(entry){return(entry.reddit.toLowerCase() === text.toLowerCase());}).length){
	            $(elems.get(index)).addClass("ggdc-blacklist");
	            $(elems.get(index)).attr("data-ggdc-blacklist-reddit", escapeQuotes(text));
	        } else {
	        	$(elems.get(index)).attr("data-ggdc-user-reddit", escapeQuotes(text));
	        }
	        $(elems.get(index)).addClass("ggdc-info");
	        $(elems.get(index)).append($("<span/>", {
	                "class": "ggdc-popup",
	                "html": "More info"
	            }));
	    }

        index++;

        if(index > total){
            clearInterval(intId);
            addOnClick();
        }
    }, 25);

    $(".content .flair").click(function(){
        var user = $(this).parent().find("a.author").contents()[0].data;
        $("#ggdc-bar-content").attr("class", "");
        $("#ggdc-bar-content").html("Finding " + user + "'s latest verification thread...");
        $("#ggdc-bar").attr("class", "ggdc-bar-open");
        fixSpacerHeight();
        chrome.runtime.sendMessage({
            get: "user_verification",
            user: user},
            function(response){
                if(response.success){
                    if(response.threads.length > 0){
                        window.open(response.threads[response.threads.length - 1], "_blank");
                        $("#ggdc-bar-content").html("Found " + user + "'s latest verification thread. It has been opened in a new tab.");
                        $("#ggdc-bar").attr("class", "ggdc-bar-open");
                    } else {
                        $("#ggdc-bar-content").html(user + "has no verification threads.");
                        $("#ggdc-bar").attr("class", "ggdc-bar-open");
                    }
                } else {
                    $("#ggdc-bar-content-details-verification").html("Could not look up username. Server may be offline.");
                }
                fixSpacerHeight();
        });
    });
}


function highlighter_js(){
    /******
     Setup
    ******/

    //Rescans page for new information (User Activated)
    $(".ggdc-bar-rescan").click(function(event){
        highlightAuthors();
    });

    /*****
     Main
    *****/

    highlightAuthors();
}