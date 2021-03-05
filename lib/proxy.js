const httpProxy = require('http-proxy');

module.exports = function ({resources, options}) {
	const proxy = new httpProxy.createProxyServer({secure: false});
	const config = options.configuration;
	const searchString = new RegExp('domain=.*\$');
	if(config.reWriteHead){
		proxy.on('proxyReq', function (proxyReq, req, res, options) {
			res.oldWriteHead = res.writeHead;
			res.writeHead = function (statusCode, headers) {

				let cookie = res.getHeader('set-cookie');
				let host = req.get('host').split(new RegExp(':[0-9]'))[0];
				for (let key in cookie) {
					cookie[key] = cookie[key].replace("secure", ""); //remove "secure" from cookie, otherwise cookie will not be saved to storage for local http, post requests will be fixed with that for "csrf validation"
					if (cookie[key].match(searchString))
						cookie[key] = cookie[key].substring(0, cookie[key].indexOf("domain")) + "domain=" + host;
				}
				res.oldWriteHead(statusCode, headers);
			};

		});
	}

	return function (req, res, next) {

		req.url = config.basePath + req.url;

		if (req.header) {
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
