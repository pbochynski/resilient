var app = require('express')();

var request = require('request');
var port = process.env.PORT || 3000;

app.get('/a/:number', function (req, res) {
    var time = process.hrtime();

    request.get('http://localhost:3001/b/' + req.params.number,
        {},
        function (err, response, body) {
            var json = body ? JSON.parse(body) : {response: "error"};
            json.latency = latency(time);

            if (err || response.statusCode != 200) {
                return res.status(500).send(json);
            }
            res.send(json);
        });
});


function latency(time) {
    var diff = process.hrtime(time);
    return (diff[0] * 1e9 + diff[1]) / 1e6;
}

app.listen(port);
console.log('Service A listening on port %s', port);