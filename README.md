# EVRYTHNG-MQTT.JS

**evrythng-mqtt.js** is an extension plugin to be used with [evrythng.js](https://github.com/evrythng/evrythng.js) or 
[evrythng-extended.js](https://github.com/evrythng/evrythng-extended.js) JS libraries.
It adds MQTT support to any resource, allowing to publish, subscribe and unsubscribe to the resource's topics easily.

## Installation

### Node.js

`evrythng-mqtt.js` is only available in CommonJS format as a NPM package. Install it using:

    npm install evrythng-mqtt

**Note:** For browsers, another plugin supportings WebSockets is coming shortly.

## Usage

```javascript
var EVT = require('evrythng-extended'),
  mqtt = require('evrythng-mqtt');

EVT.use(mqtt);

var operator = new EVT.Operator('{operatorApiKey'});
var thngResource = operator.thng('{thngId}');

// Subscribe to property updates of a particular thng
thngResource.property().subscribe(function(update){
  console.log(update);
});

// Publish
// Property updates
thngResource.property('test').publish(123);

// Actions
thngResource.action('scans').publish();

// Thng
thngResource.publish({
  name: 'My new cool name'
});

// Unsubscribe to a subscribed topic
thngResource.property().unsubscribe();
```

## More examples

### Use different settings

```javascript
mqtt.setup({
  apiUrl: 'mqtts://mqtt.evrythng.com:8883/mqtt',
  reconnectPeriod: 1000,
  keepAlive: 10,
  clientIdPrefix: 'evtjs'
});
```

## Documentation

Check all the available subscriptions on the [EVRYTHNG Pubsub documentation](https://dashboard.evrythng.com/developers/apidoc/pubsub).
