# UI5 server proxy middleware

Proxy middleware for [ui5-server](https://github.com/SAP/ui5-server).

## Install

```bash
"devDependencies": {
    ...,
    "ui5-middleware-server-proxy": "https://github.com/DSC-GMBH/ui5-middleware-server-proxy.git#X.X.X",
    ...
},
```

## Configuration options (in `$yourapp/ui5.yaml`)

- debug: `boolean`
  Enables debug logs
- target: `string`
  Target url
- basePath: `string`
  Base path on the target
- changeOrigin:  `boolean`
  Set the http-proxy option 'changeOrigin'
- reWriteHead:  `boolean`
  Rewrites 'WriteHead' function on 'res' to change the cookie domain to caller-domain. Necessary if domain in cookie is set. Also removes secure flag on cookies.


## Usage
1. Define the dependency in `$yourapp/package.json`:
```json
"devDependencies": {
    ...,
    "ui5-middleware-server-proxy": "https://github.com/DSC-GMBH/ui5-middleware-server-proxy.git#X.X.X",
    ...
},
"ui5": {
  "dependencies": [
    "ui5-middleware-server-proxy"
  ]
}
```

2. configure it in `$yourapp/ui5.yaml`:

```yaml
server:
  customMiddleware:
    - name: ui5-middleware-server-proxy
      afterMiddleware: compression
      mountPath: /sap/opu/odata
      configuration:
        debug: false
        target: https://example.com
        basePath: /sap/opu/odata
        changeOrigin: false
        reWriteHead: true
```

## How it works

The middleware launches a [http-proxy](https://www.npmjs.com/package/http-proxy) server which proxies requests on the mount path to the given uri.

##License
Project is distributed under [Apache-2.0 License](./LICENSE)