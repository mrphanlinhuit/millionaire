var express = require('express');
var router = express.Router();
var quesM = require('../models/questions');
var rankM = require('../models/rank');
var fs = require('fs');

module.exports = function(app, passport) {

    /* GET home page. */
    app.get('/', function (req, res, next) {
        res.render('index', { title: 'Express' });
    });

    app.get('/questions',isLoggedIn, function (req, res, next) {
        var path = __dirname + '/questions.txt';
        fs.readFile(path, {encoding: 'utf-8'}, function (err, data) {
            if (err) next(err);
            data = JSON.parse(data);
        });
        res.render('questions');
    });

    app.post('/addQuestion', isLoggedIn, function (req, res, next) {
        q = new quesM();
        q.question = req.body.Q;
        q.A = req.body.A;
        q.B = req.body.B;
        q.C = req.body.C;
        q.D = req.body.D;
        q.correct = req.body.correct;
        q.save(function (err, product, numberAffected) {
            if (err) next(err);
//        console.log('***** ' +product + ' has saved and number affected '+ numberAffected);
            res.send(product);
        });
    });

    app.post('/importQuestions', isLoggedIn, function (req, res, next) {
        console.log('import: ', req.body.data);
        var data = JSON.parse(req.body.data);
        for (var i = 0; i < data.length; i++) {
            (function (data) {
                q = new quesM();
                q.question = data.Q;
                q.A = data.A;
                q.B = data.B;
                q.C = data.C;
                q.D = data.D;
                q.correct = data.correct;
                q.save(function (err, product, numberAffected) {
                    if (err) next(err);
                    console.log('***** ' + product + ' has saved and number affected ' + numberAffected);
                });
            })(data[i]);
        }
        res.send('ok');
    });

    app.get('/exportQuestions',isLoggedIn, function (req, res, next) {
        quesM.find()
            .exec(function (err, collections) {
                if (err) next(err);
                var JSONCollections = JSON.stringify(collections);
                var path = __dirname + '/questions.txt';
                fs.writeFile(path, JSONCollections, function (err) {
                    if (err) next(err);
                    res.set('Content-Type', 'text/plain');
                    res.download(path);
                    console.log('file is saved in same location');
                });
            });
    });

    app.post('/Questions',isLoggedIn, function (req, res, next) {
        var limit, order, offset, search;
        if (typeof req.body.limit === undefined)
            limit = 10;
        else limit = req.body.limit;

        if (typeof req.body.order === undefined)
            order = 'asc';
        else order = req.body.order;

        if (typeof req.body.offset === undefined)
            offset = 0;
        else offset = req.body.offset;

        if (typeof req.body.search === undefined || req.body.search === '')
            search = /\w*/i;
        else search = new RegExp(req.body.search, 'i');

        quesM.count({}, function (err, count) {
            if (err) next(err);
            quesM.find({})
                .where({
                    $or: [
                        {question: search},
                        {A: search},
                        {B: search},
                        {C: search},
                        {D: search}
                    ]
                })
                .skip(offset)
                .limit(limit)
                .exec(function (err, data) {
                    if (err) next(err);
                    var ques = {
                        "total": count,
                        "rows": data
                    }
                    res.send(ques);
                });
        });
    });

    app.post('/updateQuestion', isLoggedIn, function (req, res, next) {
        var id = req.body.id,
            Q = req.body.Q,
            A = req.body.A,
            B = req.body.B,
            C = req.body.C,
            D = req.body.D,
            correct = req.body.correct;
        quesM.findByIdAndUpdate(id,
            {$set: {question: Q, A: A, B: B, C: C, D: D, correct: correct}}, function (err, q) {
                if (err) next(err);
                res.send(q)
            });
    });

    app.post('/deleteQuestion',isLoggedIn, function (req, res, next) {
        var selections = (typeof req.body['selections[]'] === 'string') ? [req.body['selections[]']] : req.body['selections[]'];
        console.log('selections: ', selections);
        if (selections.length > 0) {
            quesM.find({_id: {$in: selections}})
                .remove()
                .exec(function (err, docs) {
                    if (err) next(err);
                    console.log('docs: ', docs);
                    res.send('ok');
                });
        } else {
            res.send('selection is empty');
            return;
        }
    });

//====== RANK

    app.get('/rank', isLoggedIn, function (req, res, next) {
        res.render('rank');
    });

    app.post('/rank', isLoggedIn, function (req, res, next) {
        var limit, order, offset, search;
        if (typeof req.body.limit === undefined)
            limit = 10;
        else limit = req.body.limit;

        if (typeof req.body.order === undefined)
            order = 'asc';
        else order = req.body.order;

        if (typeof req.body.offset === undefined)
            offset = 0;
        else offset = req.body.offset;

        if (typeof req.body.search === undefined || req.body.search === '')
            search = /\w*/i;
        else search = new RegExp(req.body.search, 'i');

        rankM.count({}, function (err, count) {
            if (err) next(err);
            rankM.find({})
                .where({
                    $or: [
                        {name: search}
                    ]
                })
                .skip(offset)
                .limit(limit)
                .exec(function (err, data) {
                    if (err) next(err);
                    res.send({
                        "total": count,
                        "rows": data
                    });
                });
        });
    });

    app.post('/getRankYear', function (req, res, next) {
        rankM.getRankYear(function (err, data) {
            if (err) next(err);
            res.send(data);
        });
    });

    router.post('/getRankMonth', function (req, res, next) {
        rankM.getRankMonth(function (err, data) {
            if (err) next(err);
            res.send(data);
        });
    });

    app.post('/getRankDay', function (req, res, next) {
        rankM.getRankDay(function (err, data) {
            if (err) next(err);
            res.send(data);
        });
    });

    app.post('/updateRank', isLoggedIn, function (req, res, next) {
        var id = req.body.id,
            name = req.body.name,
            grade = req.body.grade;
        rankM.findByIdAndUpdate(id,
            {$set: {name: name, grade: grade}}, function (err, product) {
                if (err) next(err);
                res.send(product);
            });
    });

    app.get('/exportRank', isLoggedIn, function (req, res, next) {
        rankM.find()
            .exec(function (err, collections) {
                if (err) next(err);
                var JSONCollections = JSON.stringify(collections);
                var path = __dirname + '/rank.txt';
                fs.writeFile(path, JSONCollections, function (err) {
                    if (err) next(err);
                    res.set('Content-Type', 'text/plain');
                    res.download(path);
                    console.log('file is saved in same location');
                });
            });
    });

    app.post('/deleteRank', isLoggedIn, function (req, res, next) {
        var selections = (typeof req.body['selections[]'] === 'string') ? [req.body['selections[]']] : req.body['selections[]'];
        console.log('selections: ', selections);
        if (selections.length > 0) {
            rankM.find({_id: {$in: selections}})
                .remove()
                .exec(function (err, docs) {
                    if (err) next(err);
//                console.log('docs: ',docs);
                    res.send('ok');
                });
        } else {
            res.send('selection is empty');
            return;
        }
    });

    app.post('/importRank', isLoggedIn, function (req, res, next) {
        console.log('import: ', req.body.data);
        var data = JSON.parse(req.body.data);
        for (var i = 0; i < data.length; i++) {
            (function (data) {
                r = new rankM();
                r.name = data.name;
                r.grade = data.grade;
                r.date = data.date;
                r.save(function (err, product, numberAffected) {
                    if (err) next(err);
                    console.log('***** ' + product + ' has saved and number affected ' + numberAffected);
                });
            })(data[i]);
        }
        res.send('ok');
    });

//===Admin
    app.get('/signIn', function (req, res, next) {
        res.render('signIn', {message: req.flash('signInMessage')});
        console.log('signin flash: ', req.flash('signInMessage'));
    });
    app.post('/signIn', passport.authenticate('local-signIn', {
        successRedirect: '/questions',
        failureRedirect: '/signIn',
        failureFlash: true
    }));

    app.get('/signUp', function (req, res, next) {
        res.render('signUp', { message: req.flash('signupMessage')});
        console.log('signup flash: ', req.flash('signUpMessage'));
});

    app.post('/signUp',passport.authenticate('local-signUp', {
        successRedirect: '/questions',
        failureRedirect: '/',
        failureFlash: true //allow flash message
    }));

    app.get('/signOut', function (req, res, next) {
        req.logout();
        res.redirect('/signIn');
    });

    app.get('/about', function (req, res, next) {
        res.render('about');
    });
};

//== route middleware to make sure a user is logged in.
function isLoggedIn(req, res, next) {
    //if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        return next();
    }
    //if they aren't, redirect them to home page.
    console.log('user didnt logg in');
    res.redirect('/');
}