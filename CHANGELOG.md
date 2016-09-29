# v1.0.8 (29-09-2016)

## Bug fixes

- **Subscribe** - Fix multiple subscriptions not being handled correctly.

# v1.0.7 (18-08-2016)

## Bug fixes

- **Unsubscribe** - Fix subscription not being removed correctly on unsubscribe.

# v1.0.6 (14-12-2015)

## Bug fixes

- **Connect**: Reject and terminate connection when unable to reach host.

# v1.0.5 (02-12-2015)

## Bug fixes

- **Resubscribe on reconnect**: Restore subscriptions after reconnect.
- **One connection per scope**: When making multiple subscriptions in parallel, only 
one connection per scope should be created.

# v1.0.4 (31-07-2015)

## Bug Fixes

- **Publish**: silence rejection from hijacked HTTP request.

# v1.0.3 (25-06-2015)

## Features

- **documentation**: updated documentation with consistent format from other libs.

# v1.0.2 (24-06-2015)

## Bug Fixes

- **package.json**: `request` dependency removed, as this is part of `evrythng.js`.

# v1.0.1 (24-06-2015)

## Bug Fixes

- **package.json**: Added `mqtt` to dependencies.

# v1.0.0 (22-06-2015)

## Features

- **MQTT methods**: allow to *subscribe*, *unsubscribe* and *publish* to any EVT resource.
