var tape = require('tape')
var dwebxDns = require('./index')()
var dmemoDns = require('./index')({
    hashRegex: /^[0-9a-f]{64}?$/i,
    recordName: 'dmemo',
    protocolRegex: /^dmemo:\/\/([0-9a-f]{64})/i,
    txtRegex: /^"?dmemokey=([0-9a-f]{64})"?$/i
})

var FAKE_DAT = 'f'.repeat(64)

tape('Successful test against cblgh.org', function (t) {
  dmemoDns.resolveName('cblgh.org', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    dmemoDns.resolveName('cblgh.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    })
  })
})

tape('Works for keys', function (t) {
  dmemoDns.resolveName('14bc77d788fdaf07b89b28e9d276e47f2e44011f4adb981921056e1b3b40e99e', function (err, name) {
    t.error(err)
    t.equal(name, '14bc77d788fdaf07b89b28e9d276e47f2e44011f4adb981921056e1b3b40e99e')
    t.end()
  })
})

tape('Successful test against dwebx.org', function (t) {
  dwebxDns.resolveName('dwebx.org', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    dwebxDns.resolveName('dwebx.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    })
  })
})

tape('Works for keys', function (t) {
  dwebxDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')
    t.end()
  })
})

tape('Works for versioned keys and URLs', function (t) {
  dwebxDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+5', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      dwebxDns.resolveName('dwebx.org+5', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for non-numeric versioned keys and URLs', function (t) {
  dwebxDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+foo', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      dwebxDns.resolveName('dwebx.org+foo', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for full URLs', function (t) {
  dwebxDns.resolveName('dwebx://40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    dwebxDns.resolveName('dwebx://dwebx.org/foo.txt?bar=baz', function (err, name) {
      t.error(err)
      t.ok(/[0-9a-f]{64}/.test(name))
      t.end()
    })
  })
})

tape('A bad hostname fails gracefully', function (t) {
  dwebxDns.resolveName('example.com', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)

    dwebxDns.resolveName(1234, function (err, name) {
      t.ok(err)
      t.notOk(name)

      dwebxDns.resolveName('foo bar', {ignoreCache: true}, function (err, name) {
        t.ok(err)
        t.notOk(name)

        t.end()
      })
    })
  })
})

tape('A bad DNS record fails gracefully', function (t) {
  dwebxDns.resolveName('bad-dwebx-record1.dbrowser.com', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Unqualified domain fails gracefully', function (t) {
  dwebxDns.resolveName('bad-dwebx-domain-name', {ignoreCache: true}, function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Successful test against dbrowser.com', function (t) {
  dwebxDns.resolveName('dbrowser.com', {ignoreCache: true}, function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    dwebxDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dbrowser.com (no dns-over-https)', function (t) {
  dwebxDns.resolveName('dbrowser.com', {noDnsOverHttps: true, ignoreCache: true}, function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    dwebxDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dbrowser.com (no well-known/dwebx)', function (t) {
  console.log('running...')
  dwebxDns.resolveName('dbrowser.com', {noWellknownDat: true, ignoreCache: true}, function (err, name) {
    console.log('res', err, name)
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    dwebxDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('List cache', function (t) {
  t.is(Object.keys(dwebxDns.listCache()).length, 6)
  t.end()
})

tape('Persistent fallback cache', function (t) {
  t.plan(8)

  var persistentCache = {
    read: function (name, err) {
      if (name === 'foo') return '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9'
      throw err
    },
    write: function (name, key, ttl) {
      t.deepEqual(name, 'dwebx.org')
      t.ok(/[0-9a-f]{64}/.test(key))
    }
  }

  var dwebxDns = require('./index')({persistentCache})

  dwebxDns.resolveName('dwebx.org', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))

    dwebxDns.resolveName('foo', function (err, key) {
      t.error(err)
      t.deepEqual(key, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      dwebxDns.resolveName('bar', function (err, key) {
        t.ok(err)
        t.notOk(key)

        t.end()
      })
    })
  })
})

tape('Persistent fallback cache doesnt override live results', function (t) {
  var persistentCache = {
    read: function (name, err) {
      if (name === 'dwebx.org') return 'from-cache'
      throw err
    },
    write: function (name, key, ttl) {}
  }

  var dwebxDns = require('./index')({persistentCache})

  dwebxDns.resolveName('dwebx.org', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))
    t.end()
  })
})
