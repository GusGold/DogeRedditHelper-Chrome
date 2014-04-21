function highlightComments(){
    var elems = document.querySelectorAll(".content .usertext-body > .md");
    var index = 0;
    var total = elems.length;
    var intId = setInterval(function(){
    	highlightField(elems[index]);
        index++;
        if(index == total){
            clearInterval(intId);
            addOnClick();
        }
    }, 25);
}

function comments_js(){
    /******
     Setup
    ******/

    //Rescans page for new information (User Activated)
    document.querySelector(".ggdc-bar-rescan").addEventListener("click", function(event){
        highlightComments();
    });

    /*****
     Main
    *****/
    highlightComments();
}