# EVRYTHNG-MQTT.JS (plugin for EVT.js)

**evrythng-mqtt.js** is an extension plugin to be used with [evrythng.js](https://github.com/evrythng/evrythng.js) or 
[evrythng-extended.js](https://github.com/evrythng/evrythng-extended.js) JS libraries.

It adds MQTT support to any resource, allowing to *publish*, *subscribe* and *unsubscribe* to the resource's topics easily.

**evrythng-mqtt.js** is only available for Node.js as a NPM package. For browsers, another plugin supporting 
WebSockets is coming shortly.

## Installation

### Node.js

    npm install evrythng-mqtt --save

## Usage

```javascript
var EVT = require('evrythng-extended'),
  mqtt = require('evrythng-mqtt');

EVT.use(mqtt);
...
```

## Examples

#### General

```javascript
// Use different settings (below are defaults)
mqtt.setup({
  apiUrl: 'mqtts://mqtt.evrythng.com:8883/mqtt',
  reconnectPeriod: 1000,
  keepAlive: 10,
  clientIdPrefix: 'evtjs'
});

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

...
```

---

## Documentation

Check all the available subscriptions on the [EVRYTHNG Pubsub documentation](https://dashboard.evrythng.com/developers/apidoc/pubsub).

## Source Maps

Source Maps are available, which means that when using the minified version, if you open 
Developer Tools (Chrome, Safari, Firefox), *.map* files will be downloaded to help you debug code using the 
original uncompressed version of the library.

## Related tools

#### evrythng.js

[`evrythng.js`](https://github.com/evrythng/evrythng.js) is the core version of *evrythng.js* intended to be used in 
public applications and/or devices.

#### evrythng-extended.js

[`evrythng-extended.js`](https://github.com/evrythng/evrythng-extended.js) is an extended version of *evrythng.js* which 
includes Operator access to the API.

## License

Apache 2.0 License, check `LICENSE.txt`

Copyright (c) EVRYTHNG Ltd.
