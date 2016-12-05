const PEDALS = {
	'INFINITY': {
		vendorId: 0x05f3,
		productId: 0x00FF,
		mappings: data => {
			let byteArray = new Uint16Array(data);

			return byteArray[0];
		}
	},
	'VPEDAL': {
		vendorId: 0x04b4,
		productId: 0x5555,
		mappings: data => {
			let byteArray = new Uint8Array(data);

			return byteArray.reverse()[0]
		}
	}
}


function initializeHid(pollHid) {
	getDevs(PEDALS['INFINITY'].vendorId, PEDALS['INFINITY'].productId);
	getDevs(PEDALS['VPEDAL'].vendorId, PEDALS['VPEDAL'].productId);

	function getDevs (vendorId, productId) {
		var DEVICE_INFO = {"vendorId": vendorId, "productId": productId };
		// Try to open the USB HID device
		chrome.hid.getDevices(DEVICE_INFO, function(devices) {
			if (!devices || !devices.length) {
				console.log('device not found');
				return;
			}
			console.log('Found device: ' + devices[0].deviceId);
			let myHidDevice = devices[0].deviceId;

				// Connect to the HID device
			chrome.hid.connect(myHidDevice, function(connection) {
				console.log('Connected to the HID device!', connection);
				if (connection && connection.connectionId) {
					// Poll the USB HID Interrupt pipe
					pollHid(connection.connectionId, DEVICE_INFO);
				} else {
					console.log("connection is bad", arguments);
				}

			});
		});
	}
}

var myDevicePoll = function(connectionId, deviceInfo) {
	if (connectionId) {
		chrome.hid.receive(connectionId, function(reportId, data) {
			if (data != null) {
				if (deviceInfo.vendorId == 0x05f3) {
					console.log(`vendor is: '${PEDALS['INFINITY'].vendorId}'. Data is: `, PEDALS['INFINITY'].mappings(data))
				} else {
					console.log(`vendor is: '${PEDALS['VPEDAL'].vendorId}'. Data is: `, PEDALS['VPEDAL'].mappings(data))
				}
			}

			setTimeout(function(){
				myDevicePoll(connectionId, deviceInfo);
			}, 0);
		});
	}
}



chrome.app.runtime.onLaunched.addListener(function() {
	initializeHid(myDevicePoll);
});

