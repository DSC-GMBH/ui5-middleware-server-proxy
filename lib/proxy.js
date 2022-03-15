const httpProxy = require('http-proxy');
/**
 * Custom UI5 Server middleware example
 *
 * @param {object} parameters Parameters
 * @param {object} parameters.resources Resource collections
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.all Reader or Collection to read resources of the
 *                                        root project and its dependencies
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.rootProject Reader or Collection to read resources of
 *                                        the project the server is started in
 * @param {module:@ui5/fs.AbstractReader} parameters.resources.dependencies Reader or Collection to read resources of
 *                                        the projects dependencies
 * @param {object} parameters.middlewareUtil Specification version dependent interface to a
 *                                        [MiddlewareUtil]{@link module:@ui5/server.middleware.MiddlewareUtil} instance
 * @param {object} parameters.options Options
 * @param {string} [parameters.options.configuration] Custom server middleware configuration if given in ui5.yaml
 * @returns {function} Middleware function to use
 */
module.exports = function ({resources, middlewareUtil, options}) {
	const proxy = new httpProxy.createProxyServer({secure: false});
	const config = options.configuration;
	const searchString = new RegExp('domain=.*?;',"i");
	if(config.reWriteHead){
		proxy.on('proxyReq', function (proxyReq, req, res, options) {
			res.oldWriteHead = res.writeHead;
			res.writeHead = function (statusCode, headers) {

				let cookie = res.getHeader('set-cookie');
				let host = req.get('host').split(new RegExp(':[0-9]'))[0];
				for (let key in cookie) {
					cookie[key] = cookie[key].replace("secure", ""); //remove "secure" from cookie, otherwise cookie will not be saved to storage for local http, post requests will be fixed with that for "csrf validation"
					cookie[key] = cookie[key].replace("SameSite=None", "");
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
