'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var fs = require('fs');
var path = require('path');
var electron_notarize = require('electron-notarize');

module.exports = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(params) {
        var appId, appPath;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (!(process.platform !== 'darwin')) {
                            _context.next = 2;
                            break;
                        }

                        return _context.abrupt('return');

                    case 2:
                        console.log('afterSign hook triggered', params);

                        // Same appId in electron-builder.
                        appId = 'com.onmyway133.IconGenerator';
                        appPath = path.join(params.appOutDir, params.packager.appInfo.productFilename + '.app');

                        if (fs.existsSync(appPath)) {
                            _context.next = 7;
                            break;
                        }

                        throw new Error('Cannot find application at: ' + appPath);

                    case 7:

                        console.log('Notarizing ' + appId + ' found at ' + appPath);

                        _context.prev = 8;
                        _context.next = 11;
                        return electron_notarize.notarize({
                            appBundleId: appId,
                            appPath: appPath,
                            appleId: process.env.appleId,
                            appleIdPassword: process.env.appleIdPassword
                        });

                    case 11:
                        _context.next = 16;
                        break;

                    case 13:
                        _context.prev = 13;
                        _context.t0 = _context['catch'](8);

                        console.error(_context.t0);

                    case 16:

                        console.log('Done notarizing ' + appId);

                    case 17:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[8, 13]]);
    }));

    return function (_x) {
        return _ref.apply(this, arguments);
    };
}();