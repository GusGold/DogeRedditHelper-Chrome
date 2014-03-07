var tab;

chrome.tabs.query({
    active: true,
    currentWindow: true},
    function (tabs){
        tab = tabs[0];
    });

$("#show").click(function(e){
    e.preventDefault();
    chrome.tabs.sendMessage(tab.id, {
        action: "show",
        context: "info",
        from: "page_action"
    }, function(response){
        console.warn(JSON.stringify(response));
    });
});

$("#rescan").click(function(e){
    e.preventDefault();
    chrome.tabs.sendMessage(tab.id, {
        action: "do",
        context: "rescan",
        from: "page_action"
    }, function(response){
        console.warn(JSON.stringify(response));
    });
});

$("#support").click(function(e){
    chrome.tabs.create({
        url: chrome.extension.getURL("html/support/help.html")
    });
});

$("#donation").click(function(e){
    e.preventDefault();
    chrome.tabs.sendMessage(tab.id, {
        action: "show",
        context: "donation",
        from: "page_action"
    }, function(response){
        console.warn(JSON.stringify(response));
    });
});