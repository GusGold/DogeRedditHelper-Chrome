/*****
 Setup
 *****/

if(localStorage.privateAllowed === undefined){
    localStorage.privateAllowed = true;
}
if(localStorage.alwaysShowBar === undefined){
    localStorage.alwaysShowBar = true;
}

function saveFlash(elem){
    var save = $("<span/>", {
        "class": "saved",
        html: "Saved!"
    }).hide().appendTo(elem).fadeIn(250);
    setTimeout(function(){
        $(save).fadeOut(250, function(){
            this.remove();
        });
    }, 2000);
}

/****
 Main
 ****/



var privateAllowed = $("#privateAllowed");
var alwaysShowBar = $("#alwaysShowBar");

$(privateAllowed).prop("checked", localStorage.privateAllowed === "true");
$(alwaysShowBar).prop("checked", localStorage.alwaysShowBar === "true");

$(privateAllowed).change(function(){
    localStorage.privateAllowed = $(this).prop("checked");
    saveFlash($(this).parent());
});

$(alwaysShowBar).change(function(){
    localStorage.alwaysShowBar = $(this).prop("checked");
    saveFlash($(this).parent());
});