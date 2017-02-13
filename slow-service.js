var app = require('express')();
var port = process.env.PORT || 3001;

const MAX_WORKERS = 5;
// Slow service can process MAX_WORKERS requsts per second
class SlowService {
    constructor() {
        this.availableWorkers = MAX_WORKERS;
        this.taskQueue = [];
        setInterval(()=> {
            this.addWorker()
        }, 1000 / MAX_WORKERS);
        setInterval(()=> {
            this.status()
        }, 1000);
    }

    addWorker() {
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
            task();
        }
    }

    queue(task) {
        this.taskQueue.push(task);
        this.drain();
    }

    queueLength() {
        return this.taskQueue.length;
    }
}

var slowService = new SlowService();

app.get('/b/:number', function (req, res) {
    res.send({response: req.params.number});
});

app.get('/b-slow/:number', function (req, res) {
    slowService.queue( ()=> { res.send({response: req.params.number} ) });
});

app.get('/b-slow-throttled/:number', function (req, res) {
    if (slowService.queueLength()>MAX_WORKERS) {
        return res.status(503).send({response: req.params.number, rejected: true});
    }
    slowService.queue( ()=> { res.send({response: req.params.number} ) });
});


app.listen(port);
console.log('Service B listening on port %s', port);