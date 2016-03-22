[![Stories in Ready](https://badge.waffle.io/istrategylabs/paw.png?label=ready&title=Ready)](https://waffle.io/istrategylabs/paw)

# PAW: Puppies at Work

![PAW preview](paw-preview.png)

PAW is a [Slack](https://slack.com/)-integrated tracking system for dogs in the workplace. It allows owners to effortlessly keep tabs of their pets without needing to have them tethered to a desk all day.

## Up-and-running

First, start a [Redis](http://redis.io/) server for storing data.

Then, to start the API server:

```
npm run start
```

or to start the API server with [Nodemon](https://github.com/remy/nodemon) + a client with [Browsersync](https://github.com/Browsersync/browser-sync) server:

```
npm run dev
```

or to build, cachebust, and minify all assets for production:

```
npm run build
```

Finally, send external events to the `/api/event` endpoint. The payload should be formatted as:

```
{
	events: [
		{
			device: String,
			location: String,
			time: Date
		},
		...
	]
}
```

## Configuration

Application config lives in `config.js` and uses [nconf](https://github.com/indexzero/nconf).
The same configuration is shipped with Node and the browser.

### Node

In Node, require the file then use nconf to get a config value by name:

```
var config = require('./config');
var TOKEN = config.get('ISL_API_TOKEN');
```

### Browserify

In Browserify, we load the nconf configuration with [envify](https://github.com/hughsk/envify/). Refer to your config value through `process.env`:

```
setInterval(function() {
  fetch();
}, process.env.DOG_POLLING_INTERVAL_MS);
```
