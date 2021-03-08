const config = require("./config/keys");
const app = require("./config/express");
const http = require('http');
const cluster = require('cluster');

let workers = [];

const setupWorkerProcesses = () => {
    let numCores = require('os').cpus().length;
    console.log('Master cluster setting up ' + numCores + ' workers');

    for (let i = 0; i < numCores; i++) {
        workers.push(cluster.fork());
        workers[i].on('message', message => console.log(message));
    }
    cluster.on('online', worker => console.log('Worker ' + worker.process.pid + ' is listening'));
    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
        workers.push(cluster.fork());
        workers[workers.length - 1].on('message', message => console.log(message));
    });
};

const setUpExpress = () => {
    app.server = http.createServer(app);
    app.disable('x-powered-by');
    app.server.listen(config.server_port, () => console.log(`Started server on => http://localhost:${app.server.address().port} for Process Id ${process.pid}`));

    app.on('error', (appErr, appCtx) => {
        console.error('app error', appErr.stack);
        console.error('on url', appCtx.req.url);
        console.error('with headers', appCtx.req.headers);
    });
};

const setupServer = (isClusterRequired) => {
    isClusterRequired && cluster.isMaster
        ? setupWorkerProcesses()
        : setUpExpress();
};

process.env.ENV == 'PRODUCTION'
    ? setupServer(true)
    : app.listen(config.server_port, () => console.log("server is running on port", config.server_port));

