/**
 * Alias for querySelector
 * @param  {string} selector
 * @return {object} Element
 */
function el(selector) {
	return document.querySelector(selector);
}

/**
 * WebSocket Chat Client Helper
 * @type {Object}
 */
var client = {
	_socket: null,
	connect: function() {
		this._socket = new WebSocket('ws://localhost:8080');
		this._socket.addEventListener('message', this.message);
		this._socket.addEventListener('error', this.error);
		this._socket.addEventListener('open', this.open);
		this._socket.addEventListener('close', this.close);
	},
	nick: function(name) {
		var m = JSON.stringify({type: 'nick', nick: name});
		localStorage.nick = name;
		this._socket.send(m);
	},
	send: function(message) {
		var m = JSON.stringify({type: 'message', message: message});
		this._socket.send(m);
	},
	message: function(messageObj) {
		var m = JSON.parse(messageObj.data);

		// Create message element
		var li = document.createElement('li');
		switch(m.type) {
			case 'message':
				var b = document.createElement('b');
				b.className = 'nick';
				b.style.color = randomColor({
					seed: m.nick.toUpperCase(),
					luminosity: 'dark'
				});
				b.textContent = m.nick + ':';
				li.appendChild(b);
				var text = document.createTextNode(' ');
				li.appendChild(text);
				var span = document.createElement('span');
				span.className = 'message';
				span.textContent = m.message;
				li.appendChild(span);
				break;
			case 'nick':
				li.className = 'notice';
				li.textContent = m.oldnick + ' changed nick to ' + m.nick;
				break;
			case 'join':
				li.className = 'notice';
				li.textContent = m.nick + ' joined';
				break;
			case 'part':
				li.className = 'notice';
				li.textContent = m.nick + ' left';
				break;
		}

		ui.writeMessage(li);
	},
	error: function() {
		var li = document.createElement('li');
		li.className = 'error';
		li.textContent = 'Socket error occurred.';
		ui.writeMessage(li);
		var container = el('.message-container');
		container.scrollTop = container.scrollHeight;
	},
	open: function() {
		if(localStorage.nick) {
			client.nick(localStorage.nick);
			el('#frm-connect').setAttribute('hidden', true);
			el('.overlay').setAttribute('hidden', true);
			el('#frm-message input[name="message"]').removeAttribute('disabled');
			el('#frm-message input[name="message"]').focus();
		} else {
			el('#frm-connect .window-message').textContent = 'Connected! Pick a username:';
			el('#frm-connect input[name="nick"]').removeAttribute('hidden');
			el('#frm-connect input[name="nick"]').focus();
		}
	},
	close: function() {
		var li = document.createElement('li');
		li.className = 'notice';
		li.textContent = 'Disconnected.';
		ui.writeMessage(li);
		var container = el('.message-container');
		container.scrollTop = container.scrollHeight;
		el('#frm-message input[name="message"]').setAttribute('disabled', true);
	}
};

/**
 * UI Helper
 * @type {Object}
 */
var ui = {
	lastDate: null,
	writeMessage: function(element) {
		var ul = el('.messages');

		// Add timestamp if no messages for 5 minutes
		var d = new Date();
		if(!ui.lastDate || d.getTime() > this.lastDate.getTime() + 60e3 * 5) {
			var ts = document.createElement('li');
			ts.className = 'time';
			ts.textContent = d.toLocaleString();
			ul.appendChild(ts);
		}

		// Append message
		ul.appendChild(element);
		this.lastDate = d;

		// Scroll to end
		var container = el('.message-container');
		container.scrollTop = container.scrollHeight;

		// Write last 30 messages to history
		var messages = el('.messages').childNodes,
			count = Math.max(messages.length - 30, 0),
			mString = '';
		for (var i = messages.length - 1; i >= count; i--) {
			mString = messages[i].outerHTML + mString;
		}
		localStorage.history = mString;
	}
};

// Initialize client client
document.addEventListener('DOMContentLoaded', function() {
	if(localStorage.history) {
		// Load history
		var ul = el('.messages');
		ul.innerHTML = localStorage.history;

		// Add <hr>
		var hr = document.createElement('hr');
		ul.appendChild(hr);

		// Scroll to end
		var container = el('.message-container');
		container.scrollTop = container.scrollHeight;
	}
	client.connect();
});

// Handle message form submit
el('#frm-message').addEventListener('submit', function(e) {
	e.preventDefault();
	var input = el('#frm-message input[name="message"]');
	var m = input.value;
	if(m.substr(0, 5) == '/nick') {
		client.nick(m.substr(6));
	} else if(m == '/join') {
		if(client._socket.readyState == 3) {
			client.connect();
		}
	} else if(m == '/part') {
		client._socket.close();
		el('#frm-connect .window-message').textContent = 'Disconnected';
		el('#frm-connect').removeAttribute('hidden');
		el('#frm-connect .window-input').setAttribute('hidden', true);
		el('#frm-connect .btn-connect').removeAttribute('hidden');
		el('.overlay').removeAttribute('hidden');
		localStorage.removeItem('nick');
	} else if(m == '/clear') {
		localStorage.removeItem('history');
		el('.messages').innerHTML = '';
	} else {
		client.send(m);
	}
	input.value = '';
});

// Handle connection button
el('#frm-connect .btn-connect').addEventListener('click', function(e) {
	el('#frm-connect .window-message').innerHTML = 'Connecting&hellip;';
	client.connect();
	this.setAttribute('hidden', true);
});

// Handle nick form submit
el('#frm-connect').addEventListener('submit', function(e) {
	e.preventDefault();
	var nick = el('#frm-connect input[name="nick"]').value;
	client.nick(nick);
	el('#frm-connect').setAttribute('hidden', true);
	el('.overlay').setAttribute('hidden', true);
	el('#frm-message input[name="message"]').removeAttribute('disabled');
	el('#frm-message input[name="message"]').focus();
});
