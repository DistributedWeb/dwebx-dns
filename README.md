# dwebx-dns

Issue DNS lookups for DWebX archives using HTTPS requests to the target host. Keeps an in-memory cache of recent lookups.

## API

```js
var dwebxDns = require('dwebx-dns')()

// or, if you have a custom protocol
var dwebxDns = require('dwebx-dns')({
    recordName: /* name of .well-known file */
    protocolRegex: /* RegExp object for custom protocol */,
    hashRegex: /* RegExp object for custom hash i.e. */,
    txtRegex: /* RegExp object for DNS TXT record of custom protocol */,
})

// example: 
var dmemoDns = require('dwebx-dns')({
    recordName: 'dmemo',
    hashRegex: /^[0-9a-f]{64}?$/i,
    protocolRegex: /^dmemo:\/\/([0-9a-f]{64})/i,
    txtRegex: /^"?dmemokey=([0-9a-f]{64})"?$/i
})

// resolve a name: pass the hostname by itself
dwebxDns.resolveName('foo.com', function (err, key) { ... })
dwebxDns.resolveName('foo.com').then(key => ...)

// dont use cached 'misses'
dwebxDns.resolveName('foo.com', {ignoreCachedMiss: true})

// dont use the cache at all
dwebxDns.resolveName('foo.com', {ignoreCache: true})

// dont use dns-over-https
dwebxDns.resolveName('foo.com', {noDnsOverHttps: true})

// dont use .well-known/dwebx
dwebxDns.resolveName('foo.com', {noWellknownDat: true})

// list all entries in the cache
dwebxDns.listCache()

// clear the cache
dwebxDns.flushCache()

// configure the DNS-over-HTTPS host used
var dwebxDns = require('dwebx-dns')({
  dnsHost: 'dns.google.com',
  dnsPath: '/resolve'
})

// use a persistent fallback cache
// (this is handy for persistent dns data when offline)
var dwebxDns = require('dwebx-dns')({
  persistentCache: {
    read: async (name, err) => {
      // try lookup
      // if failed, you can throw the original error:
      throw err
    },
    write: async (name, key, ttl) => {
      // write to your cache
    }
  }
})

// emits some events, mainly useful for logging/debugging
dwebxDns.on('resolved', ({method, name, key}) => {...})
dwebxDns.on('failed', ({method, name, err}) => {...})
dwebxDns.on('cache-flushed', () => {...})
```

## Spec

[In detail.](https://www.dwebx.net/deps/0005-dns/)

**Option 1 (DNS-over-HTTPS).** Create a DNS TXT record witht he following schema:

```
datkey={key}
```

**Option 2 (.well-known/dwebx).** Place a file at `/.well-known/dwebx` with the following schema:

```
{dwebx-url}
TTL={time in seconds}
```

TTL is optional and will default to `3600` (one hour). If set to `0`, the entry is not cached.
