var app = require('express')();
var CircuitBreaker = require('circuit-breaker-js');
var request = require('request');
var breaker = new CircuitBreaker({windowDuration: 1000});
var port = process.env.PORT || 3000;

const MAX_WORKERS=5
// Slow service can process MAX_WORKERS requsts per second
class SlowService {
    constructor() {
        this.availableWorkers = MAX_WORKERS;
        this.taskQueue = [];
        setInterval(()=>{this.addWorker()}, 1000/MAX_WORKERS);
        setInterval(()=>{this.status()}, 1000);
    }

    addWorker(){
        if (this.availableWorkers < MAX_WORKERS) {
            this.availableWorkers += 1;
        }
        this.drain();
    }

    status() {
        console.log("Available workers: %s, Task queue: %s",
            this.availableWorkers, this.taskQueue.length);
    }

    drain() {
        while (this.availableWorkers > 0 && this.taskQueue.length > 0) {
            var task = this.taskQueue.shift();
            this.availableWorkers -= 1;
            task.res.send({response: task.number});
        }
    }

    queue(response, taskNumber) {
        this.taskQueue.push({res: response, number: taskNumber});
        this.drain();
    }

    queueLength() {
        return this.taskQueue.length;
    }
}

var slowService = new SlowService();

app.get('/slow/:number', function (req, res) {
    if (slowService.queueLength()>MAX_WORKERS) {
        return res.status(503).send({response: req.params.number, rejected: true});
    }
    slowService.queue(res, req.params.number);
});


app.get('/statistics/:number', function (req, res) {
    var time = process.hrtime();

    var command = function (success, failure) {
        request.get('http://localhost:' + port+ '/slow/' + req.params.number,
            {timeout:500},
            function (err, response, body) {
                var json = body ? JSON.parse(body) : {response: "error"};
                json.latency = latency(time);

                if (err || response.statusCode != 200) {
                    res.status(500).send(json);
                    return failure();
                }

                res.send(json);
                return success();
            });
    };

    var fallback = function () {
        var json = {fallback: req.params.number, latency: latency(time)};
        res.send(json);
    };
    breaker.run(command, fallback);
});


function latency(time) {
    var diff = process.hrtime(time);
    return (diff[0] * 1e9 + diff[1]) / 1e6;
}


app.listen(port);
console.log('Listening on port %s', port);

