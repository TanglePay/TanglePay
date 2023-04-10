var e = require('struct'),
    r = require('bip32-path'),
    t = require('@ledgerhq/logs'),
    n = require('@iota/crypto.js')
function o(e) {
    return e && 'object' == typeof e && 'default' in e ? e : { default: e }
}
var i = o(e),
    a = (function () {
        function e(e) {
            this.type = e
        }
        return (
            (e.prototype.get_type = function (r) {
                switch (r) {
                    case 0:
                        return e.Empty
                    case 1:
                        return e.GeneratedAddress
                    case 2:
                        return e.ValidatedEssence
                    case 3:
                        return e.UserConfirmedEssence
                    case 4:
                        return e.Signatures
                    case 5:
                        return e.Locked
                    default:
                        return e.Unknown
                }
            }),
            e
        )
    })()
function s(e, r, t) {
    if (!e.s) {
        if (t instanceof u) {
            if (!t.s) return void (t.o = s.bind(null, e, r))
            1 & r && (r = t.s), (t = t.v)
        }
        if (t && t.then) return void t.then(s.bind(null, e, r), s.bind(null, e, 2))
        ;(e.s = r), (e.v = t)
        var n = e.o
        n && n(e)
    }
}
;(a.Empty = new a(0)),
    (a.GeneratedAddress = new a(1)),
    (a.ValidatedEssence = new a(2)),
    (a.UserConfirmedEssence = new a(3)),
    (a.Signatures = new a(4)),
    (a.Locked = new a(5)),
    (a.Unknown = new a(255))
var c = (function () {
        function e(e) {
            e.decorateAppAPIMethods(this, ['getAppVersion', 'getAddress'], 'IOTA'), (this.transport = e)
        }
        var o = e.prototype
        return (
            (o.getAppVersion = function () {
                try {
                    return (
                        t.log('getting app version...'),
                        Promise.resolve(this._getAppConfig()).then(function (e) {
                            return e.app_version
                        })
                    )
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o.getAddress = function (r, t, o) {
                try {
                    var i = this,
                        a = e._validatePath(r)
                    return Promise.resolve(i._setAccount(a[2], t)).then(function () {
                        return Promise.resolve(i._generateAddress(a[3], a[4], 1, o)).then(function () {
                            return Promise.resolve(i._getData()).then(function (e) {
                                return (function (e, r) {
                                    var t = ''
                                    switch (e) {
                                        case 'shimmer':
                                            t = n.Bech32.encode('smr', r)
                                            break
                                        case 'shimmer_testnet':
                                            t = n.Bech32.encode('rms', r)
                                            break
                                        case 'iota':
                                            t = n.Bech32.encode('iota', r)
                                            break
                                        case 'atoi':
                                            t = n.Bech32.encode('atoi', r)
                                            break
                                        default:
                                            throw new Error('currency ID error: "' + e + '" is not a valid ID')
                                    }
                                    return t
                                })(t.id, e)
                            })
                        })
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (e._validatePath = function (e) {
                var n
                try {
                    n = r.fromString(e).toPathArray()
                } catch (e) {
                    throw new Error('"path" invalid: ' + e.message)
                }
                for (var o = 0; o < n.length; o++) 0 == n[o] && (n[o] = 2147483648)
                if ((3 == n.length && (n = this._validatePath(e + "/0'/0'")), !n || 5 != n.length))
                    throw new Error('"path" invalid: Invalid path length: ' + n.length)
                return t.log('validatePath end'), n
            }),
            (o._setAccount = function (e, r) {
                try {
                    t.log('setting account...')
                    var n,
                        o = i.default().word32Ule('account')
                    switch ((o.allocate(), (o.fields.account = e), r.id)) {
                        case 'iota':
                            n = 0
                            break
                        case 'atoi':
                            n = 128
                            break
                        case 'shimmer':
                            n = 3
                            break
                        case 'shimmer_testnet':
                            n = 131
                            break
                        default:
                            throw new Error('packable error: IncorrectP1P2')
                    }
                    console.log('App mode=' + n, o)
                    return Promise.resolve(this._sendCommand(17, n, 0, o.buffer(), 1e4)).then(function () {
                        t.log('setting account done...')
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._getDataBufferState = function () {
                try {
                    return Promise.resolve(this._sendCommand(128, 0, 0, void 0, 1e4)).then(function (e) {
                        var r = i
                            .default()
                            .word16Ule('dataLength')
                            .word8('dataType')
                            .word8('dataBlockSize')
                            .word8('dataBlockCount')
                        r.setBuffer(e)
                        var t = r.fields
                        return {
                            dataLength: t.dataLength,
                            dataType: t.dataType,
                            dataBlockSize: t.dataBlockSize,
                            dataBlockCount: t.dataBlockCount
                        }
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._clearDataBuffer = function () {
                try {
                    return Promise.resolve(this._sendCommand(131, 0, 0, void 0, 1e4)).then(function () {
                        t.log('setting account done...')
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._readDataBlock = function (e) {
                var r = e.block,
                    t = e.size
                try {
                    return Promise.resolve(this._sendCommand(130, r, 0, void 0, 1e4)).then(function (e) {
                        var r = i.default().array('data', t, 'word8')
                        return (
                            r.setBuffer(e),
                            (function (e, r) {
                                for (var t = new Uint8Array(r), n = 0; n < r; n++) t[n] = e[n]
                                return t
                            })(r.fields.data, t)
                        )
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._writeDataBuffer = function (e) {
                try {
                    var r = this
                    return Promise.resolve(r._clearDataBuffer()).then(function () {
                        return Promise.resolve(r._getDataBufferState()).then(function (t) {
                            if (t.dataType != a.Empty.type)
                                throw new Error("Command not Allowed: Ledger state is not 'Empty'")
                            var n = t.dataBlockSize,
                                o = e.length / n
                            if ((e.length % n != 0 && (o += 1), o > t.dataBlockCount))
                                throw new Error('Invalid data passed to Ledger device')
                            var i = 0,
                                s = h(
                                    function () {
                                        return i < o
                                    },
                                    function () {
                                        return i++
                                    },
                                    function () {
                                        var t = e.slice(i * n, (i + 1) * n)
                                        if (t.length < n) {
                                            var o = new Uint16Array(n)
                                            o.set(t), o.set(Array(n - t.length).fill(0), t.length), (t = Buffer.from(o))
                                        }
                                        return Promise.resolve(r._writeDataBlock(i, t)).then(function () {})
                                    }
                                )
                            if (s && s.then) return s.then(function () {})
                        })
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._writeDataBlock = function (e, r) {
                try {
                    return (
                        t.log('writing data block...'),
                        Promise.resolve(this._sendCommand(129, e, 0, r, 15e4)).then(function () {})
                    )
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._getData = function () {
                try {
                    var e = this
                    return Promise.resolve(e._getDataBufferState()).then(function (r) {
                        function t() {
                            return o.subarray(0, r.dataLength)
                        }
                        var n = Math.ceil(r.dataLength / r.dataBlockSize),
                            o = new Uint8Array(n * r.dataBlockSize),
                            i = 0,
                            a = 0,
                            s = h(
                                function () {
                                    return a < n
                                },
                                function () {
                                    return a++
                                },
                                function () {
                                    return Promise.resolve(e._readDataBlock({ block: a, size: r.dataBlockSize })).then(
                                        function (e) {
                                            o.set(e, i), (i += e.length)
                                        }
                                    )
                                }
                            )
                        return s && s.then ? s.then(t) : t()
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._showMainFlow = function () {
                try {
                    return Promise.resolve(this._sendCommand(144, 0, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._showGeneratingAddressesFlow = function () {
                try {
                    return Promise.resolve(this._sendCommand(144, 1, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._showGenericErrorFlow = function () {
                try {
                    return Promise.resolve(this._sendCommand(144, 2, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._showRejectedFlow = function () {
                try {
                    return Promise.resolve(this._sendCommand(144, 3, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._showSignedSuccessfullyFlow = function () {
                try {
                    return Promise.resolve(this._sendCommand(144, 4, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._showSigningFlow = function () {
                try {
                    return Promise.resolve(this._sendCommand(144, 5, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._prepareSigning = function (e, r, t, n) {
                try {
                    var o = i
                        .default()
                        .word16Ule('remainder_index')
                        .word32Ule('remainder_bip32_index')
                        .word32Ule('remainder_bip32_change')
                    return (
                        o.allocate(),
                        (o.fields.remainder_index = r),
                        (o.fields.remainder_bip32_index = t),
                        (o.fields.remainder_bip32_change = n),
                        Promise.resolve(this._sendCommand(160, 1, e, o.buffer(), 15e4)).then(function () {})
                    )
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._generateAddress = function (e, r, t, n) {
                void 0 === n && (n = !1)
                try {
                    var o = i.default().word32Ule('bip32_index').word32Ule('bip32_change').word32Ule('count')
                    return (
                        o.allocate(),
                        (o.fields.bip32_index = r),
                        (o.fields.bip32_change = e),
                        (o.fields.count = t),
                        Promise.resolve(this._sendCommand(161, n ? 1 : 0, 0, o.buffer(), 15e4)).then(function () {})
                    )
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._userConfirmEssence = function () {
                try {
                    return Promise.resolve(this._sendCommand(163, 0, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._signSingle = function (e) {
                try {
                    return Promise.resolve(this._sendCommand(164, e, 0, void 0, 1e4)).then(function (e) {
                        var r = e.at(0),
                            t = i.default()
                        switch (r) {
                            case 0:
                                    t
                                        .word8('signature_type')
                                        .word8('unknown')
                                        .array('ed25519_public_key', 32, 'word8')
                                        .array('ed25519_signature', 64, 'word8'),
                                    void t.setBuffer(e)
                                break;
                            case 1:
                                t.word8('signature_type').array('reference', 2, 'word8'), void t.setBuffer(e)
                                break;
                            default:
                                throw new Error('packable error: Invalid variant')
                        }
                        return t
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._getAppConfig = function () {
                try {
                    return Promise.resolve(this._sendCommand(16, 0, 0, void 0, 1e4)).then(function (e) {
                        var r = i
                            .default()
                            .word8('app_version_major')
                            .word8('app_version_minor')
                            .word8('app_version_patch')
                            .word8('app_flags')
                            .word8('device')
                            .word8('debug')
                        r.setBuffer(e)
                        var t = r.fields
                        return {
                            app_version: t.app_version_major + '.' + t.app_version_minor + '.' + t.app_version_patch,
                            app_flags: t.app_flags,
                            device: t.device,
                            debug: t.debug
                        }
                    })
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._reset = function (e) {
                void 0 === e && (e = !1)
                try {
                    return Promise.resolve(this._sendCommand(255, e ? 1 : 0, 0, void 0, 1e4)).then(function () {})
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            (o._sendCommand = function (e, r, t, n, o) {
                try {
                    var i = this.transport
                    return Promise.resolve(
                        (function (a, s) {
                            try {
                                var c = (i.setExchangeTimeout(o), Promise.resolve(i.send(123, e, r, t, n)))
                            } catch (e) {
                                return s(e)
                            }
                            return c && c.then ? c.then(void 0, s) : c
                        })(0, function (e) {
                            throw (
                                (e.statusCode &&
                                    (e.message =
                                        (function (e) {
                                            var r = (function (e) {
                                                switch (e) {
                                                    case 36864:
                                                        return 'Success'
                                                    case 26368:
                                                        return 'Incorrect input length'
                                                    case 27264:
                                                        return 'Incorrect data'
                                                    case 27392:
                                                        return 'Incorrect command parameter'
                                                    case 27648:
                                                        return 'Incorrect length specified in header'
                                                    case 27904:
                                                        return 'Invalid INS command'
                                                    case 28160:
                                                        return 'Incorrect CLA (Wrong application opened)'
                                                    case 26880:
                                                        return 'Command not allowed (Command out of order)'
                                                    case 27010:
                                                        return 'Security not satisfied (Device locked)'
                                                    case 27013:
                                                        return 'Condition of use not satisfied (Denied by the user)'
                                                    case 25601:
                                                        return 'Security not satisfied (Timeout exceeded)'
                                                    case 27041:
                                                        return 'Bundle error (Insecure hash)'
                                                    case 27042:
                                                        return 'Bundle error (Non zero balance)'
                                                    case 27043:
                                                        return 'Bundle error (Invalid meta transaction)'
                                                    case 27044:
                                                        return 'Bundle error (Invalid input address/index pair(s))'
                                                    case 27045:
                                                        return 'Bundle error (Address reused)'
                                                    case 27012:
                                                        return 'Invalid input data'
                                                    case 27014:
                                                        return 'App has not been initialized by user'
                                                    case 27025:
                                                        return 'Invalid transaction index'
                                                    case 27026:
                                                        return 'Invalid transaction order (Output, Inputs, Change)'
                                                    case 27027:
                                                        return 'Invalid meta transaction'
                                                    case 27028:
                                                        return 'Invalid output transaction (Output must come first)'
                                                }
                                                if (28416 <= e && e <= 28671) return 'Internal error, please report'
                                            })(e)
                                            if (r) return 'Ledger device: ' + r + ' (0x' + e.toString(16) + ')'
                                        })(e.statusCode) || e.message),
                                e)
                            )
                        })
                    )
                } catch (e) {
                    return Promise.reject(e)
                }
            }),
            e
        )
    })(),
    u = (function () {
        function e() {}
        return (
            (e.prototype.then = function (r, t) {
                var n = new e(),
                    o = this.s
                if (o) {
                    var i = 1 & o ? r : t
                    if (i) {
                        try {
                            s(n, 1, i(this.v))
                        } catch (e) {
                            s(n, 2, e)
                        }
                        return n
                    }
                    return this
                }
                return (
                    (this.o = function (e) {
                        try {
                            var o = e.v
                            1 & e.s ? s(n, 1, r ? r(o) : o) : t ? s(n, 1, t(o)) : s(n, 2, o)
                        } catch (e) {
                            s(n, 2, e)
                        }
                    }),
                    n
                )
            }),
            e
        )
    })()
function d(e) {
    return e instanceof u && 1 & e.s
}
function h(e, r, t) {
    for (var n; ; ) {
        var o = e()
        if ((d(o) && (o = o.v), !o)) return i
        if (o.then) {
            n = 0
            break
        }
        var i = t()
        if (i && i.then) {
            if (!d(i)) {
                n = 1
                break
            }
            i = i.s
        }
        if (r) {
            var a = r()
            if (a && a.then && !d(a)) {
                n = 2
                break
            }
        }
    }
    var c = new u(),
        h = s.bind(null, c, 2)
    return (0 === n ? o.then(l) : 1 === n ? i.then(f) : a.then(m)).then(void 0, h), c
    function f(n) {
        i = n
        do {
            if (r && (a = r()) && a.then && !d(a)) return void a.then(m).then(void 0, h)
            if (!(o = e()) || (d(o) && !o.v)) return void s(c, 1, i)
            if (o.then) return void o.then(l).then(void 0, h)
            d((i = t())) && (i = i.v)
        } while (!i || !i.then)
        i.then(f).then(void 0, h)
    }
    function l(e) {
        e ? ((i = t()) && i.then ? i.then(f).then(void 0, h) : f(i)) : s(c, 1, i)
    }
    function m() {
        ;(o = e()) ? (o.then ? o.then(l).then(void 0, h) : l(o)) : s(c, 1, i)
    }
}
module.exports = c
//# sourceMappingURL=index.js.map
