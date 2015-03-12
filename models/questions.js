/**
 * Created by linh on 2/15/2015.
 */
var mongoose = require('mongoose');
var random = require('mongoose-random');
var searchPlugin = require('mongoose-search-plugin');

var questions = mongoose.Schema({
    question: String,
    A: String,
    B: String,
    C: String,
    D: String,
    correct: String
});

//get a question randomly.
questions.statics.getRand = function(cb){
    this.count(function(err, count) {
        if (err) cb(err);
        var rand = Math.round(count * Math.random());
        if (rand === count) rand--;
        this.find().skip(rand).limit(1).exec(cb);
    }.bind(this));
};

// by default `path` is `random`. It's used internally to store a random value on each doc.
questions.plugin(random, { path: 'r' });
questions.plugin(searchPlugin, {
    fields: ['question', 'A', 'B', 'C', 'D']
});




questions.statics.validateAnswer = function(id, cb){
    this.findById(id).limit(1).exec(cb);
};

module.exports = mongoose.model('questions', questions);