var fs     = require('fs');
var http = require('http');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var jsdom  = require('jsdom');
var jquery = fs.readFileSync("./jquery-1.11.0.js").toString();

// Issues a request for an exchange rate from one currency to another.
//
// Example:
//     new xe.ExchangeRateRequest({
//         from: "KES",
//         to: "USD",
//         source: "xe.com"
//       }, function(rate) {
//         console.log("1 KES (Kenyan shilling) = " + rate + " USD (US dollar)");
//       });
//
// @param {Object} options A dictionary with the following properties:
//  - from: The currency code of the source currency.
//  - to: The currency code of the destination currency.
//  - source: The source of the exchange rate information.  Possiblities:
//    - 'xe.com'
// @param {Function} callback A function called with the exchange rate (a scalar
//   value) upon success
function ExchangeRateRequest(options, callback) {
  if (options.source !== 'xe.com') {
    throw "Invalid source of information.";
  }
  var self = this;
  var req = 
        http.request({
          host: 'www.xe.com',
          path: '/ucc/convert.cgi?template=mobile&Amount=1&From=' +
            encodeURIComponent(options.from) + '&To=' +
            encodeURIComponent(options.to)
        }, function(response) {
          var data = '';
          response.on('data', function (chunk) {
            data += chunk;
          });
          
          response.on('end', function () {
            parseXeResponse(response, data, options.from, options.to,
                            callback,
                            function onError() { self.emit('error', e); });
          });
        });
  req.on('error', function(e) {
    self.emit('error', e);
  });
  req.end();
}
util.inherits(ExchangeRateRequest, EventEmitter);

function parseXeResponse(response, data, from, to, callback, onError) {
  if (response.statusCode !== 200) {
    onError("Invalid status code: want 200, got " + response.statusCode);
    return;
  }

  jsdom.env({
    html: data,
    src: [jquery],
    done: function(errors, window) {
      if (errors && errors.length > 0) {
        onError(errors);
        return;
      }
      var $ = window.$;
      var success = false;
      $('td.resultColLft').each(function(){
        if ($(this).text().trim() === '1.00 ' + from) {
          var value = $(this).siblings("td.resultColRght").text();
          var match = /(\d*\.\d*) (.*)/.exec(value);
          if (!match || match[2] !== to) {
            return;
          }
          var valueAsNumber = parseFloat(match[1]);
          if (isNaN(valueAsNumber)) {
            return;
          }
          success = true;
          callback(valueAsNumber);
        }
      });
      if (!success) {
        onError("failed to scrape xe.com response");
      }
    }
  });
}

module.exports.ExchangeRateRequest = ExchangeRateRequest;