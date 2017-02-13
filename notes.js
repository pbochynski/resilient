var CircuitBreaker = require('circuit-breaker-js');
var breaker = new CircuitBreaker({windowDuration: 1000});


var command = function (success, failure) {
    // call other service
}


var fallback = function () {
    var json = {fallback: req.params.number, latency: latency(time)};
    res.send(json);
};

breaker.run(command, fallback);
