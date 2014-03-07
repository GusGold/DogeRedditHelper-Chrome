//Finds and marks Authors for highlighting
function highlightAuthors(){
    $(".content .author").each(function(){
    	if ($(this).attr("data-ggdc-found") !== "1"){
	        var text = $(this).text();
	        if(~$.inArray(text, data.mods.entries)){
	            $(this).addClass("ggdc-moderator");
	            $(this).attr("data-ggdc-moderator-reddit", escapeQuotes(text));
	        } else if(text == data.creators.entries){
	            $(this).addClass("ggdc-creators");
	            $(this).attr("data-ggdc-creator-reddit", escapeQuotes(text));
	        } else if($.grep(data.blacklist.entries, function(entry){return(entry.reddit.toLowerCase() === text.toLowerCase());}).length){
	            $(this).addClass("ggdc-blacklist");
	            $(this).attr("data-ggdc-blacklist-reddit", escapeQuotes(text));
	        } else {
	        	$(this).attr("data-ggdc-user-reddit", escapeQuotes(text));
	        }
	        $(this).addClass("ggdc-info");
	        $(this).append($("<span/>", {
	                "class": "ggdc-popup",
	                "html": "More info"
	            }));
	    }
        
    });
    addOnClick();
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