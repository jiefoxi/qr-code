document.title = chrome.i18n.getMessage("name");

var options = JSON.parse(localStorage.getItem("options")) || {
	ecl: "M",
	size: 200,
	ask: true,
	autoclose: true
};

var size = options.size * (window.devicePixelRatio || 1);
var $qrcode = document.getElementById("qrcode");
$qrcode.style.width = $qrcode.style.height = options.size + "px";

var qrcode = new QRCode($qrcode, {
	width: size,
	height: size,
	correctLevel: QRCode.CorrectLevel[options.ecl]
});

window._makeCode = function(data) {
	try {
		qrcode.makeCode(data);
	} catch (e) {
		alert(chrome.i18n.getMessage("error"));
	};
};

if (location.search == "") {
	// pageAction's popup
	document.body.style.width = document.body.style.height = Math.min(584, options.size * 1.25) + "px";
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		_makeCode(tabs[0].url);
	});
} else {
	// window.open
	if (options.autoclose) window.onblur = window.close;
	document.getElementsByTagName("img")[0].ondblclick = function() {
		var old_data = $qrcode.title;
		var new_data = prompt(chrome.i18n.getMessage("edit"), old_data);

		if (new_data && new_data != old_data) {
			_makeCode(new_data);
		};
	};
};
