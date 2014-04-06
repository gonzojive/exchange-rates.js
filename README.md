# exchange-rates.js

A Javascript (node) library for obtaining exchange rates from the internet.
This library is released with no warranty, and it is entirely up to library
users to ensure use complies with local laws and regulations.

Unfortunately this library as written requires node.js.  Feel free to contribute
a refactoring that makes it work, for example, in Chrome apps.

## Installation and dependencies
Install the dependencies:

```
npm install jsdom
```


## Usage
See `example.js`.

```
var xe = require('./exchange-rates.js');

new xe.ExchangeRateRequest({
  from: "KES",
  to: "USD",
  source: "xe.com"
}, function(rate) {
  console.log("rate: " + rate);
});
```

## NO WARRANTY
{Imagine every possible disclosure here}.
