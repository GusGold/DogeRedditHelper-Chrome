/*****
 Setup
 *****/

if(localStorage.privateAllowed === undefined){
    localStorage.privateAllowed = true;
}
if(localStorage.alwaysShowBar === undefined){
    localStorage.alwaysShowBar = true;
}

function fade(elem, fadeFrom, fadeTo, time, callback){
    var intId, step;

    elem.style.opacity = fadeFrom;
    elem.style.display = null;

    step = (fadeTo - fadeFrom) / time;

    if(fadeTo === fadeFrom){
        return;
    } else {
        intId = setInterval(
            function(){
                var op = parseFloat(elem.style.opacity) + step;

                if((step > 0 && op >= fadeTo) || (step < 0 && op <= fadeTo)){
                    elem.style.opacity = fadeTo;
                    clearInterval(intId);
                    if(callback !== undefined){
                        (callback.bind(elem))();
                    }
                } else {
                    elem.style.opacity = op;
                }
            }, 1);
    }
}

function saveFlash(elem){
    var save, inserted;
    save = document.createElement("span");
    save.setAttribute("class", "saved");
    save.innerHTML = "Saved!";
    save.style.display = "none";
    elem.appendChild(save);
    fade(save, 0, 1, 250);
    setTimeout(function(){
        fade(save, 1, 0, 250, function(){ this.parentNode.removeChild(this); });
    }, 2000);
}

/****
 Main
 ****/



var privateAllowed = document.getElementById("privateAllowed");
var alwaysShowBar = document.getElementById("alwaysShowBar");

privateAllowed.checked = localStorage.privateAllowed === "true";
alwaysShowBar.checked = localStorage.alwaysShowBar === "true";

privateAllowed.addEventListener("click", function(){
    localStorage.privateAllowed = this.checked;
    saveFlash(this.parentNode);
});

alwaysShowBar.addEventListener("click", function(){
    localStorage.alwaysShowBar = this.checked;
    saveFlash(this.parentNode);
});