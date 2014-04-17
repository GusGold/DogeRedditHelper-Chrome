function highlightComments(){
    var elems = $(".content .usertext-body > .md");
    var index = 0;
    var total = elems.length;
    console.log("comments started");
    var intId = setInterval(function(){
    	highlightField(elems.get(index));
        index++;
        if(index == total){
            clearInterval(intId);
            addOnClick();
            console.log("comments finished");
        }
    }, 25);
}

function comments_js(){
    /******
     Setup
    ******/

    //Rescans page for new information (User Activated)
    $(".ggdc-bar-rescan").click(function(event){
        highlightComments();
    });

    /*****
     Main
    *****/
    highlightComments();
}