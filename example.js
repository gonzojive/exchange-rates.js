var xe = require('./exchange-rates.js');

new xe.ExchangeRateRequest({
  from: "KES",
  to: "USD",
  source: "xe.com"
}, function(rate) {
  console.log("rate: " + rate);
});
