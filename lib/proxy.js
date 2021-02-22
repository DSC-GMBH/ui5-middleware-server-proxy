const httpProxy = require('http-proxy');

module.exports = function ({resources, options}) {
	const proxy = new httpProxy.createProxyServer({secure: false});
	const config = options.configuration;

	return function (req, res, next) {

		req.url = config.basePath + req.url;

		if (req.header) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Credentials', 'true');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');
			if ('OPTIONS' === req.method) {
				res.header(200);
				if (config.debug) {
					console.log(req.method + ' is OPTIONS call: ' + req.url);
				}
				next();
				return;
			}
		}

		let proxyServerOptions = {target: config.target};

		if (config.debug) {
			console.log(req.method + ' redirected to: ' + config.target + req.url);
		}

		let changeOrigin = config.changeOrigin;
		if (changeOrigin) {
			proxyServerOptions.changeOrigin = changeOrigin;
		}

		proxy.web(req, res, proxyServerOptions, function (err) {
			if (err)
				next(err);
		});
	}
};
