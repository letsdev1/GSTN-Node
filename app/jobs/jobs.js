var express = require('express');
var app = express();
var kue = require('kue');

//Same queue as we use in the worker
var queue;


module.exports = {

    createQueue(jobName, jobObject) 
    {
        

        if(!queue){
            queue = kue.createQueue({
                "prefix": "e2queue"
                });
        }

        queue.create(jobName, jobObject )
            .removeOnComplete(true)
            .save();
    }
}



