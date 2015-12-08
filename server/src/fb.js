var lastNotification;
var lastNotificationTime;
var dockCounter = "";
var ignoreNotification = false;

csssetup = function() {
	head = document.head || document.getElementsByTagName( 'head' )[ 0 ];
	style = document.createElement( 'style' );
	style.type = 'text/css';
	if ( style.styleSheet ) {
			style.styleSheet.cssText = css;
	} else {
			style.appendChild( document.createTextNode( css ) );
	}
	head.appendChild( style );
};

function init() {

    csssetup();

	setInterval(function() {
		updateTitle();
		dockCount();

		var uploadButton = document.querySelector('._m._4q60._3rzn._6a');
		if (uploadButton && uploadButton.onclick==null) {
			uploadButton.onclick = function (e) {
				e.preventDefault();
				e.stopPropagation();
				uploadInfo();
			}
		}

	}, 200);

	setTimeout(function() {
		//render settings menu
		document.querySelector('._30yy._2fug._p').click();
		mixpanel.track("loaded");
		window.dispatchEvent(new Event('resize'));
	}, 3000);

	document.body.onkeypress=function(e) {
		// If no inputs are focused, or we're at the start of the message input (to prevent system beep), focus the message input and trigger the keypress.
		if ((!document.querySelector(':focus') || (document.querySelector('._54-z:focus') && window.getSelection().baseOffset === 0)) && !e.metaKey && !e.ctrlKey) {
			var char = event.which || event.keyCode;

			// Focus the input at the end of any current text.
			var el = document.querySelector('._54-z');
			var range = document.createRange();
			var sel = window.getSelection();
			range.setStart(el, 1);
			range.collapse(true);
			sel.removeAllRanges();
			sel.addRange(range);

			// Trigger the captured key press.
			var textEvent = document.createEvent('TextEvent');
			textEvent.initTextEvent('textInput', true, true, null, String.fromCharCode(char), 9, "en-US");
			el.dispatchEvent(textEvent);

			return false;
		}
	};

	document.querySelector('._5743').addEventListener("DOMSubtreeModified", function () {
		updateTitle();
	});
}

function uploadInfo() {
	window.webkit.messageHandlers.notification.postMessage({type: 'CHOOSE_IMAGE'});
}

function updateTitle() {
	var a = ""
	if (document.querySelector('._2v6o')) {
		a = document.querySelector('._2v6o').textContent;
	}
	window.webkit.messageHandlers.notification.postMessage({type: 'SET_TITLE', title: document.querySelector('._5743 span').textContent, activity: a});
}

function newConversation() {
	document.querySelector('._36ic._5l-3 > a._30yy').click();
}

function gotoConversation(tag) {
	if (tag==1) {
		document.querySelector('._1ht2').nextElementSibling.querySelector('a').click();
	} else {
		document.querySelector('._1ht2').previousElementSibling.querySelector('a').click();
	}
}

function gotoConversationAtIndex(index) {
	document.querySelector('._2xhi ul li:nth-child(' + index + ') a').click()
}

function reactivation(userid) {
	if (userid) {
		document.querySelector('[data-reactid="'+userid+'"] a').click();
	} else if (new Date().getTime() < lastNotificationTime + 1000*60) {
		document.querySelector('._1ht3 a').click();
	}
}

function logout() {
	document.querySelector('._54nq._2i-c._558b._2n_z li:last-child a').click();
}

function info() {
	document.querySelector('._fl3._30yy').click();
}

function preferences() {
	document.querySelector('._54nq._2i-c._558b._2n_z li:first-child a').click();
}

function search() {
	document.querySelector('._58al').focus()
}

function dockCount() {
	var c = document.querySelectorAll('._1ht3').length;
	if (c != dockCounter) {
		window.webkit.messageHandlers.notification.postMessage({type: 'DOCK_COUNT', content: String(c)});
		dockCounter = c;
	}

	convertEmoji();

	if (c > 0) {
		var text = document.querySelector('._1ht3 ._1htf');
		if (text) {
			text = text.textContent;
			var subtitle = document.querySelector('._1ht3 ._1ht6').textContent;
			if (lastNotification != subtitle+text) {
				var el = document.querySelector('._1ht3 ._1htf');

				[].forEach.call(document.querySelectorAll('.emoticon_text'), function(a) {
					a.textContent = "";
				});

				text = document.querySelector('._1ht3 ._1htf').textContent;

				var id = document.querySelector('._1ht1._1ht3 div').getAttribute('id');
				var pictureUrl = document.querySelector('._1ht3 ._55lt > .img');
				if (pictureUrl) {
					pictureUrl = pictureUrl.getAttribute('src');
				} else {
					pictureUrl = "";
				}

				//muted = ._569x
				if (ignoreNotification || document.querySelector('[id="'+id+'"]').parentElement.classList.toString().indexOf('_569x') > -1) {
					ignoreNotification = false;
				} else {
					window.webkit.messageHandlers.notification.postMessage({type: 'NOTIFICATION', title: subtitle, text: text, id: id, pictureUrl: pictureUrl});
					window.webkit.messageHandlers.notification.postMessage({type: 'DOCK_COUNT', content: String(c)});
				}

				lastNotification = subtitle+text;
				lastNotificationTime = new Date().getTime();
			}
		}
	}
}

function replyToNotification(userid, answer) {
	document.querySelector('[id="'+userid+'"] a').click();
	setTimeout(function () {
		var textEvent = document.createEvent('TextEvent');
		textEvent.initTextEvent('textInput', true, true, null, answer, 9, "en-US");
		document.querySelector('._209g._2vxa').dispatchEvent(textEvent);
		ignoreNotification = true;
		__triggerKeyboardEvent(document.querySelector('._209g._2vxa'),13,true);
	},50);
}

function getValueForFirstObjectKey(object) {
    var keys = Object.keys(object);
    if (keys.length > 0) {
        return object[keys[0]];
    }
    return null;
}

// Handle pasted image data forwarded from the wrapper app.
function pasteImage(base64Data) {
	var blob = b64toBlob(base64Data, 'image/png');
	var uploader = getValueForFirstObjectKey(getValueForFirstObjectKey(__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers).ComponentTree.getClosestInstanceFromNode(document.querySelector('._4rv4 form').parentElement)._renderedChildren);
	uploader._instance.uploadFiles([blob]);
}

// Convert base64 encoded data to a Blob.
function b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);

        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        var byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
}

function __triggerKeyboardEvent(el, keyCode, meta) {
    var eventObj = document.createEventObject ?
        document.createEventObject() : document.createEvent("Events");

    if(eventObj.initEvent){
      eventObj.initEvent("keydown", true, true);
    }

    eventObj.keyCode = keyCode;
    eventObj.which = keyCode;
	if (meta) {
		eventObj.metaKey = true;
	}

    el.dispatchEvent ? el.dispatchEvent(eventObj) : el.fireEvent("onkeydown", eventObj);

}

function convertEmoji() {}


