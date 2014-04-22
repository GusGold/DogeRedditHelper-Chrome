function highlightComments(){
    function loopComments(elems){
        highlightField(elems[index], function(){
            index++;
            if(index < total){
                setTimeout(function(){
                    loopComments(elems);
                }, 25);
            }
        });
    }

    var elems = document.querySelectorAll(".content .usertext-body > .md");
    var index = 0;
    var total = elems.length;

    loopComments(elems);
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