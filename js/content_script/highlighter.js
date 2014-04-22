//Finds and marks Authors for highlighting
function highlightAuthors(){
    var elems = document.querySelectorAll(".content .author");
    var index = 0;
    var total = elems.length - 1;
    var intId = setInterval(function(){
    	if (elems[index].getAttribute("data-ggdc-found") !== "1"){
	        var text = elems[index].innerText;
	        if(data.mods.entries.indexOf(text) >= 0){
	            elems[index].setAttribute("class", elems[index].getAttribute("class") + " ggdc-moderator");
	            elems[index].setAttribute("data-ggdc-moderator-reddit", escapeQuotes(text));
	        } else if(text == data.creators.entries){
	            elems[index].setAttribute("class", elems[index].getAttribute("class") + " ggdc-creators");
                elems[index].setAttribute("data-ggdc-creators-reddit", escapeQuotes(text));
	        } else if(grep(data.blacklist.entries, function(entry){return(entry.reddit.toLowerCase() === text.toLowerCase());}).length){
	            elems[index].setAttribute("class", elems[index].getAttribute("class") + " ggdc-blacklist");
	            elems[index].setAttribute("data-ggdc-blacklist-reddit", escapeQuotes(text));
	        } else {
	        	elems[index].setAttribute("data-ggdc-user-reddit", escapeQuotes(text));
	        }
	        elems[index].setAttribute("class", elems[index].getAttribute("class") + " ggdc-info");
            var newElem = document.createElement("span");
            newElem.setAttribute("class", "ggdc-popup");

            newElem.innerHTML = "More info";
            elems[index].appendChild(newElem);
	    }

        index++;

        if(index > total){
            clearInterval(intId);
            addOnClick();
        }
    }, 25);

    var flairs = document.querySelectorAll(".content .flair");
    /*flairs.forEach(function(flair, i){
        flair.addEventListener("click", function(event){
            var user = flair.parentNode.querySelector("a.author").childNodes[0].nodeValue;
            document.getElementById("ggdc-bar-content").setAttribute("class", "");
            document.getElementById("ggdc-bar-content").innerHTML = "Finding " + user + "'s latest verification thread...";
            document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
            fixSpacerHeight();
            chrome.runtime.sendMessage({
                get: "user_verification",
                user: user},
                function(response){
                    if(response.success){
                        if(response.threads.length > 0){
                            console.dir(response);
                            window.open(response.threads[response.threads.length - 1], "_blank");
                            document.getElementById("ggdc-bar-content").innerHTML = "Found " + user + "'s latest verification thread. It has been opened in a new tab.";
                            document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                        } else {
                            document.getElementById("ggdc-bar-content").innerHTML = user + " has no verification threads.";
                            document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                        }
                    } else {
                        document.getElementById("ggdc-bar-content-details-verification").innerHTML = "Could not look up username. Server may be offline.";
                    }
                    fixSpacerHeight();
                }
            );
        });
    });*/
    for (var i = 0; i < flairs.length; i++){
        (function(i){
            flairs[i].addEventListener("click", function(event){
                var user = flairs[i].parentNode.querySelector("a.author").childNodes[0].nodeValue;
                document.getElementById("ggdc-bar-content").setAttribute("class", "");
                document.getElementById("ggdc-bar-content").innerHTML = "Finding " + user + "'s latest verification thread...";
                document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                fixSpacerHeight();
                chrome.runtime.sendMessage({
                    get: "user_verification",
                    user: user},
                    function(response){
                        if(response.success){
                            if(response.threads.length > 0){
                                console.dir(response);
                                window.open(response.threads[response.threads.length - 1], "_blank");
                                document.getElementById("ggdc-bar-content").innerHTML = "Found " + user + "'s latest verification thread. It has been opened in a new tab.";
                                document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                            } else {
                                document.getElementById("ggdc-bar-content").innerHTML = user + " has no verification threads.";
                                document.getElementById("ggdc-bar").setAttribute("class", "ggdc-bar-open");
                            }
                        } else {
                            document.getElementById("ggdc-bar-content-details-verification").innerHTML = "Could not look up username. Server may be offline.";
                        }
                        fixSpacerHeight();
                    }
                );
            });
        })(i);
    }
}


function highlighter_js(){
    /******
     Setup
    ******/

    //Rescans page for new information (User Activated)
    document.getElementById("ggdc-bar-rescan").addEventListener("click", function(event){
        highlightAuthors();
    });

    /*****
     Main
    *****/

    highlightAuthors();
}