function highlightMessages(){
    $(".noncollapsed > .md").each(function(){
        if ($(this).parent().css("display") !== "none"){
            highlightField(this);
        }
    });
}

function messages_js(){
    /******
     Setup
    ******/

    //Rescans page for new information (User Activated)
    $(".ggdc-bar-rescan").click(function(event){
        highlightMessages();
    });

    /*****
     Main
    *****/

    highlightMessages();
}