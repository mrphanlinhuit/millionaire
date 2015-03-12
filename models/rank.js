/**
 * Created by linh on 3/7/2015.
 */
var mongoose = require('mongoose');
var searchPlugin = require('mongoose-search-plugin');

var rank = mongoose.Schema({
    name: String,
    grade: Number,
    date: Date
});

rank.plugin(searchPlugin, {
    fields: ['name']
});

rank.statics.getRankYear = function (cb) {
    var date = new Date();
    var year = date.getFullYear();
    var query = 'this.date.toJSON().slice(0, 4) == ' + year;
//    console.log('query: ', query);
    this.find({ '$where': query })
        .where()
        .limit(10)
        .exec(cb);
};

rank.statics.getRankMonth = function (cb) {
    var date = new Date();
    var month = date.getMonth()+1;
    var query = 'this.date.toJSON().slice(5,7) == ' + month;
//    console.log('query: ', query);
    this.find({ '$where': query })
        .where()
        .limit(10)
        .exec(cb);
};

rank.statics.getRankDay = function (cb) {
    var date = new Date();
    var day = JSON.stringify(date.toJSON().slice(0,10));
    var query = 'this.date.toJSON().slice(0,10) ==' +day;
    console.log('query: ', query);
    this.find({ '$where': query })
        .where()
        .limit(10)
        .exec(cb);
};

module.exports = mongoose.model('rank', rank);