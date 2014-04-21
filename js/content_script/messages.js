function highlightMessages(){
    var messages = document.querySelectorAll(".noncollapsed > .md");
    for (i = 0; i < messages.length; i++){
        if(messages[i].parentNode.style.display !== "none"){
            highlightField(messages[i]);
        }
    }
    addOnClick();
}

function messages_js(){
    /******
     Setup
    ******/

    //Rescans page for new information (User Activated)
    document.getElementById("ggdc-bar-rescan").addEventListener("click", function(event){
        highlightMessages();
    });

    /*****
     Main
    *****/

    highlightMessages();
}