var benchrest = require('bench-rest');

function argvAsNumber(i, defaultVal) {
    return process.argv[i] ? Number(process.argv[i]) : defaultVal;
}

var job = {
    "flow": {"get": "http://localhost:3000/statistics/loadtest"},
    "runOptions": {"limit": argvAsNumber(2,30), "iterations": argvAsNumber(3,100), progress: 1000}
};

console.log(JSON.stringify(job, null,2));
benchrest(job.flow, job.runOptions)
    .on('error', function (err, ctxName) {
        // ignore errors
    })
    .on('progress', function (stats, percent, concurrent, ips) {
        console.log('Progress: %s\% complete. Current throuhput: %s req/sec', percent, ips);
    })
    .on('end', function (stats, errorCount) {
        console.log('error count: ', errorCount);
        console.log('stats', stats);
    });
