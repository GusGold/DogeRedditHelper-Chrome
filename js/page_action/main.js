var tab;

chrome.tabs.query({
    active: true,
    currentWindow: true},
    function (tabs){
        tab = tabs[0];
    });

document.getElementById("show").addEventListener("click", function(event){
    event.preventDefault();
    chrome.tabs.sendMessage(tab.id, {
        action: "show",
        context: "info",
        from: "page_action"
    }, function(response){
        console.warn(JSON.stringify(response));
    });
});

document.getElementById("rescan").addEventListener("click", function(event){
    event.preventDefault();
    chrome.tabs.sendMessage(tab.id, {
        action: "do",
        context: "rescan",
        from: "page_action"
    }, function(response){
        console.warn(JSON.stringify(response));
    });
});

document.getElementById("support").addEventListener("click", function(event){
    chrome.tabs.create({
        url: chrome.extension.getURL("html/support/help.html")
    });
});

document.getElementById("donation").addEventListener("click",function(event){
    event.preventDefault();
    chrome.tabs.sendMessage(tab.id, {
        action: "show",
        context: "donation",
        from: "page_action"
    }, function(response){
        console.warn(JSON.stringify(response));
    });
});