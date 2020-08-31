var tape = require('tape')
var datDns = require('./index')()

var FAKE_DAT = 'f'.repeat(64)

tape('Successful test against dwebx.org', function (t) {
  datDns.resolveName('dwebx.org', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dwebx.org').then(function (name2) {
      t.equal(name, name2)
      t.end()
    })
  })
})

tape('Works for keys', function (t) {
  datDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')
    t.end()
  })
})

tape('Works for versioned keys and URLs', function (t) {
    datDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+5', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      datDns.resolveName('dwebx.org+5', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for non-numeric versioned keys and URLs', function (t) {
    datDns.resolveName('40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9+foo', function (err, name) {
      t.error(err)
      t.equal(name, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      datDns.resolveName('dwebx.org+foo', function (err, name) {
        t.error(err)
        t.ok(/[0-9a-f]{64}/.test(name))
        t.end()
      })
    })
})

tape('Works for full URLs', function (t) {
  datDns.resolveName('dwebx://40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dwebx://dwebx.org/foo.txt?bar=baz', function (err, name) {
      t.error(err)
      t.ok(/[0-9a-f]{64}/.test(name))
      t.end()
    })
  })
})

tape('A bad hostname fails gracefully', function (t) {
  datDns.resolveName('example.com', function (err, name) {
    t.ok(err)
    t.notOk(name)

    datDns.resolveName(1234, function (err, name) {
      t.ok(err)
      t.notOk(name)

      datDns.resolveName('foo bar', function (err, name) {
        t.ok(err)
        t.notOk(name)

        t.end()
      })
    })
  })
})

tape('A bad DNS record fails gracefully', function (t) {
  datDns.resolveName('bad-dwebx-record1.dbrowser.com', function (err, name) {
    t.ok(err)
    t.notOk(name)
    t.end()
  })
})

tape('Successful test against dbrowser.com', function (t) {
  datDns.resolveName('dbrowser.com', function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dbrowser.com (no dns-over-https)', function (t) {
  datDns.resolveName('dbrowser.com', {noDnsOverHttps: true}, function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('Successful test against dbrowser.com (no well-known/dwebx)', function (t) {
  datDns.resolveName('dbrowser.com', {noWellknownDat: true}, function (err, name) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(name))

    datDns.resolveName('dbrowser.com').then(function (name2) {
      t.equal(name, name2)
      t.end()
    }).catch(function (err) {
      t.error(err)
      t.end()
    })
  })
})

tape('List cache', function (t) {
  t.is(Object.keys(datDns.listCache()).length, 5)
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

  var datDns = require('./index')({persistentCache})

  datDns.resolveName('dwebx.org', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))

    datDns.resolveName('foo', function (err, key) {
      t.error(err)
      t.deepEqual(key, '40a7f6b6147ae695bcbcff432f684c7bb5291ea339c28c1755896cdeb80bd2f9')

      datDns.resolveName('bar', function (err, key) {
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

  var datDns = require('./index')({persistentCache})

  datDns.resolveName('dwebx.org', function (err, key) {
    t.error(err)
    t.ok(/[0-9a-f]{64}/.test(key))
    t.end()
  })
})
