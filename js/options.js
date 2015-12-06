var options = JSON.parse(localStorage.getItem("options")) || {
	ecl: "M",
	size: 200,
	ask: true,
	autoclose: true
};

var form = document.forms[0];

Array.prototype.forEach.call(document.querySelectorAll("[data-i18n]"), function(ele){
	ele[/button|input|textarea/.test(ele.tagName) ? "value" : "innerText"] = chrome.i18n.getMessage(ele.dataset.i18n);
});

form.onsubmit = function(event) {
	localStorage.setItem("options", JSON.stringify({
		ecl: this.ecl.value,
		size: this.size.value,
		ask: this.ask.checked,
		autoclose: this.autoclose.checked
	}));
	return false;
};

form.ecl.value = options.ecl;
form.size.value = options.size;
form.ask.checked = options.ask;
form.autoclose.checked = options.autoclose;

document.title = chrome.i18n.getMessage("name") + " " + chrome.i18n.getMessage("options");