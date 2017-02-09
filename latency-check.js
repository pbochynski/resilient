var request = require('request');
var colors = require('colors');

function latencyCheck() {
    var iteration = 0;
    setInterval(function () {
        iteration = iteration + 1;
        request("http://localhost:3000/statistics/" + iteration, {}, function (err, res, body) {
            if (err) {
                return console.log('connection error'.red);

            }
            var txt = body;
            var latency = JSON.parse(body).latency;
            if (latency > 500) {
                txt = body.red;
            } else if (latency > 100) {
                txt = body.yellow
            }
            if (body.indexOf('fallback') > 0) {
                txt = body.blue;
            }
            if (body.indexOf('error') > 0) {
                txt = body.red;
            }
            if (body.indexOf('rejected') > 0) {
                txt = body.red;
            }

            console.log(txt);
        });
    }, 500)
}

latencyCheck();