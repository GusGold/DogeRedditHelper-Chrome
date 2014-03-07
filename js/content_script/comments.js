function highlightComments(){
    $(".content .usertext-body > .md").each(function(){
    	highlightField(this);
    });
    addOnClick();
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