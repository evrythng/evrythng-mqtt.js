// ## EVRYTHNG-MQTT.JS Plugin

// This is an evrythng.js plugin for CommonJS-like environments (e.g. Node.js)
// that adds MQTT support to Resources. This means that, after installed, the application
// is able to subscribe, unsubscribe and publish messages to any resource:

// ```
//  // Subscribe to actions on a particular thng
//  user.thng('{id}').action('all').subscribe(function(action){
//    console.log('New action:', action);
//  });
//
//  // Subscribe to property updates on a particular product
//  user.product('{id}').property().subscribe(function(properties){
//    console.log('Property changes:', properties);
//  });
//
//  // Publish new message via MQTT
//  user.product('{id}').property('foo').publish('my new value!');
// ```

(function (root, factory) {

  // Plugin only for Node.js
  module.exports = factory(require('mqtt'));

}(this, function (mqtt) {
  'use strict';

  // Version of plugin maintained in sync with every release of evt.js
  var version = '1.0.0';


  // Setup default settings:

  // - ***apiUrl**: EVRYTHNG URL for the MQTT server*
  // - ***reconnectPeriod**: Connection retry timeout*
  // - ***keepAlive**: Longest period of time which broker and client can
  // live without sending a message*
  // - ***clientIdPrefix**: Prefix in randomly generated unique ID*
  var defaultSettings = {
    apiUrl: 'mqtts://mqtt.evrythng.com:8883/mqtt',
    reconnectPeriod: 1000,
    keepAlive: 10,
    clientIdPrefix: 'evtjs'
  };


  // Generate unique client ID for MQTT connection.
  function _generateClientId(prefix) {
    return prefix + '_' + Math.random().toString(16).substr(2, 8)
  }

  function _isClientConnected(scope) {
    return scope.mqttClient instanceof mqtt.Client && scope.mqttClient.connected === true;
  }


  // Get an existent or create a new MQTT client for the specified scope.
  function _getClient(scope) {
    var settings = EVTMqttPlugin.settings;

    return new Promise(function (resolve, reject) {

      if (_isClientConnected(scope)) {

        // Return existing client if exists and is connected.
        resolve(scope.mqttClient);

      } else {

        // Create a new client and store in scope.
        var mqttClientId = _generateClientId(settings.clientIdPrefix),
          mqttOptions = {
            username: 'authorization',
            password: scope.apiKey,
            clientId: mqttClientId,
            keepalive: settings.keepAlive,
            reconnectPeriod: settings.reconnectPeriod
          };

        // create a new MQTT client
        var client = mqtt.connect(settings.apiUrl, mqttOptions);

        // One client per scope
        client.once('connect', function () {
          scope.mqttClient = client;
          resolve(scope.mqttClient);
        });

        client.on('error', function (error) {
          reject(error);
        });

      }

    });
  }


  // Subscribe to the current resource path topic. Create client if needed.
  // Message callback is called all the time a new message is received on that topic.
  function subscribe(messageCallback, successCallback, errorCallback) {
    if (!(Object.prototype.toString.call(messageCallback) == '[object Function]')) {
      throw new TypeError('Message callback missing.');
    }

    var $this = this;

    return _getClient(this.scope).then(function (client) {
      return new Promise(function (resolve, reject) {

        function subscriptionHandler(err) {
          if (err) {

            // Failed to subscribe
            if (errorCallback) {
              errorCallback(err);
            }
            reject(err);

          } else {

            // Attach handler for any incoming message on this client
            client.on('message', function (topic, message) {
              if ($this.path === topic) {

                // Incoming as Buffer
                var response = message.toString();

                // Try to parse as JSON and then to the corresponding resource class.
                try {
                  response = $this.parse(JSON.parse(response));
                } catch (e) {}

                messageCallback(response);

              }
            });

            client.on('error', function (error) {
              if (errorCallback) {
                errorCallback(error);
              }
              reject(error);
            });

            if (successCallback) {
              successCallback(client);
            }
            resolve(client);
          }
        }

        client.subscribe($this.path, subscriptionHandler);
      });
    }, function (error) {

      // Failed to get Mqtt client...
      if (errorCallback) {
        errorCallback(error);
      }
      return Promise.reject(error);

    });
  }


  // Unsubscribe from this resource's path MQTT topic.
  function unsubscribe(successCallback, errorCallback) {
    var $this = this;

    return new Promise(function (resolve, reject) {

      if(!_isClientConnected($this.scope)){
        reject('MQTT Client is not connected.');
      }

      function unsubscriptionHandler(err) {
        if (err) {

          // Failed to unsubscribe
          if (errorCallback) {
            errorCallback(err);
          }
          reject(err);

        } else {

          if (successCallback) {
            successCallback($this.scope.mqttClient);
          }
          resolve($this.scope.mqttClient);
        }
      }

      $this.scope.mqttClient.unsubscribe($this.path, unsubscriptionHandler);
    });
  }

  // Publish a message on this resource's path MQTT topic.
  function _publishMessage(message, successCallback, errorCallback) {
    var $this = this;

    return _getClient(this.scope).then(function (client) {
      return new Promise(function (resolve, reject) {

        if (!_isClientConnected($this.scope)) {
          reject('MQTT Client is not connected.');
        }

        function publishHandler(err) {
          if (err) {

            // failed to publish
            if (errorCallback) {
              errorCallback(err);
            }
            reject(err);

          } else {

            if (successCallback) {
              successCallback();
            }
            resolve();
          }
        }

        // Data has to be sent as a string
        message = JSON.stringify($this.jsonify(message));

        client.publish($this.path, message, publishHandler);
      });
    });
  }

  // Convert an Update/Create request into a MQTT publish message.
  function _preparePublish(method, message, successCallback, errorCallback) {
    var $this = this;

    return new Promise(function (resolve, reject) {

      var transferToPublish = {
        request: function (options, cancel) {
          // Cancel REST request
          cancel();

          // Use normalized data as the message to publish
          _publishMessage.call($this, options.data, successCallback, errorCallback).then(resolve, reject);
        }
      };

      $this[method](message || {}, {
        interceptors: [transferToPublish]
      });
    });
  }

  // Simple wrapper to pass in the Action class for validation.
  function publish(Action) {
    return function (message, successCallback, errorCallback) {
      var method = 'update';

      // Action is special, as it publishes on POST
      if(this.class === Action){
        method = 'create';
      }

      return _preparePublish.call(this, method, message, successCallback, errorCallback);
    };
  }


  // Plugin API
  var EVTMqttPlugin = {

    version: version,

    settings: defaultSettings,

    // Modules that this plugin requires. Injected into the install method.
    requires: ['resource', 'evrythng'],

    // Setup new settings.
    setup: function (customSettings) {
      if (Object.prototype.toString.call(customSettings) === '[object Object]') {

        // Override default settings with new ones
        for (var i in customSettings) {
          if (customSettings.hasOwnProperty(i)) {
            this.settings[i] = customSettings[i];
          }
        }

      } else {
        throw new TypeError('Setup should be called with an options object.');
      }

      return this.settings;
    },

    install: function (Resource, EVT) {

      // Add MQTT methods to any Resource
      Resource.prototype.subscribe = subscribe;
      Resource.prototype.unsubscribe = unsubscribe;
      Resource.prototype.publish = publish(EVT.Entity.Action);

    }
  };

  return EVTMqttPlugin;
}));