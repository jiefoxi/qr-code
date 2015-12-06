var options = JSON.parse(localStorage.getItem("options")) || {
    ecl: "M",
    size: 200,
    ask: true,
    autoclose: true
};

window.onstorage = function(event) {
    options = JSON.parse(event.newValue);
};

qrcode.callback = function(data) {
    if (data == "error decoding QR Code") {
        alert(chrome.i18n.getMessage("error"));
    } else if (/^https?:\/\//i.test(data) && (!options.ask || confirm(chrome.i18n.getMessage("open") + "\r\n" + data))) {
        chrome.tabs.create({
            url: data
        });
    } else {
        prompt(chrome.i18n.getMessage("result"), data);
    };
};

var App = {
    sample: new QRCode(document.body, {
        width: options.size,
        height: options.size,
        correctLevel: QRCode.CorrectLevel[options.ecl]
    }),
    test: function(data) {
        var pass = true;
        try {
            this.sample.makeCode(data);
        } catch (e) {
            pass = false;
        };
        return pass;
    },
    generate: function(info, tab) {
        var data = info.selectionText || info.linkUrl || info.srcUrl || info.frameUrl || info.pageUrl;
        this.popup(data);

        var types = "selectionText|linkUrl|srcUrl|frameUrl|pageUrl".split("|").filter(function(type) {
            return type in info;
        });
        _gaq.push(["_trackEvent", "contextMenu", "generate", types[0]]);
    },
    scan: function(info, tab) {
        qrcode.decode(info.srcUrl);
        _gaq.push(["_trackEvent", "contextMenu", "scan"]);
    },
    popup: function(data) {
        if (!this.test(data)) {
            alert(chrome.i18n.getMessage("error"));
            return false;
        };
        if (this._popup && this._popup._makeCode) {
            this._popup._makeCode(data);
            this.focusPopup();
        } else {
            var size = Math.max(300, options.size * 1.25);
            this._popup = window.open("popup.html?window", "QRCode", "width=" + size + ",height=" + size + ",left=" + (screen.width - size) / 2 + ",top=" + (screen.height - size) / 2);
            this._popup.onload = function() {
                this.onunload = function() {
                    App._popup = null;
                };
                this._makeCode(data);
            };
        };
    },
    focusPopup: function() {
        chrome.tabs.query({
            title: chrome.i18n.getMessage("name")
        }, function(tabs) {
            var tab = tabs[0];
            if (tab.highlighted) {
                var windowId = tab.windowId;
                chrome.windows.update(windowId, {
                    focused: true
                }, function(window) {
                    console.log("focusPopup", window);
                });
            } else {
                chrome.tabs.highlight({
                    tabs: tab.index
                }, function(window) {
                    console.log("focusPopup", window);
                });
            };
        });
    }
};

chrome.contextMenus.create({
    title: chrome.i18n.getMessage("generate"),
    contexts: ["page", "selection", "link", "image", "video", "audio"],
    onclick: App.generate.bind(App)
});

chrome.contextMenus.create({
    title: chrome.i18n.getMessage("scan"),
    contexts: ["image"],
    onclick: App.scan.bind(App)
});

chrome.tabs.onUpdated.addListener(function(tabId) {
    chrome.pageAction.show(tabId);
});

var _gaq = _gaq || [];
_gaq.push(["_setAccount", "UA-37085142-5"]);
_gaq.push(["_trackPageview"]);
_gaq.push(["_setCustomVar", 1, "ecl", options.ecl, 2]);
_gaq.push(["_setCustomVar", 2, "size", options.size, 2]);
_gaq.push(["_setCustomVar", 3, "ask", options.ask, 2]);

(function() {
    var ga = document.createElement("script");
    ga.type = "text/javascript";
    ga.async = true;
    ga.src = "https://ssl.google-analytics.com/ga.js";
    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(ga, s);
})();