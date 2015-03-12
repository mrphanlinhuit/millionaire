/**
 * Created by linh on 2/16/2015.
 */
var quesM = require('./models/questions');
var rankM = require('./models/rank');

module.exports = function(server){
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        socket.emit('news', { hello: 'world' });
        socket.on('getQuestions', function (data) {
            console.log('**** get questions');
            quesM.findRandom().limit(15).exec(function(err, questions){
                socket.player = {};
                socket.player.ques = questions;
                socket.player.fail = false;
                socket.player.currentQuestion = 0;
                socket.player.help = {fifty: true, phone: true, audience: true};
//                console.log('***** socket' , socket);
                var data = [];
                for(var i=0; i<questions.length; i++){
                    data[i] = {
                        question: questions[i].question,
                        _id: questions[i]._id,
                        A: questions[i].A,
                        B: questions[i].B,
                        C: questions[i].C,
                        D: questions[i].D
                    }
                }
                socket.emit('getQuestions', data);
            });
        });

        socket.on('answer', function(data){
            quesM.findById(data.id, function(err, question){
                if(err) throw new Error(err);
                if(data.ans === question.correct){
                    socket.player.currentQuestion ++;
                    socket.emit('correct');
                }else{
                    socket.player.fail = true;
                    socket.emit('incorrect');
                }
            })
        });

        socket.on('saveGrade', function(data){
            var newGrade = new rankM();
            newGrade.name = data.name;
            newGrade.grade = data.grade;
            newGrade.date = new Date();

            newGrade.save(function(err, product, numberAffected){
                if(err) throw new Error(err);
//                console.log('grade ***** ' +product + ' has saved and number affected '+ numberAffected);
                socket.emit('saveGrade','ok');
            });
        });

        socket.on('help', function (data) {
//            console.log('****&&& socket: ', socket);
            switch (data){
                case 'helpFifty':
                    if(socket.player.help.fifty){
                        var currentQuestion = socket.player.ques[socket.player.currentQuestion];
                        var correctAnswer = currentQuestion.correct;
                        var arr = [];//contains the incorrect answers.
                        switch (correctAnswer){
                            case 'A':
                                arr = ['B', 'C', 'D'];
                                break;
                            case 'B':
                                arr = ['A', 'C', 'D'];
                                break;
                            case 'C':
                                arr = ['A', 'B', 'D'];
                                break;
                            case 'D':
                                arr = ['A', 'B', 'C'];
                                break;
                            default :
                                break;
                        }
                        //get 2 number index randomly
                        var index1 = Math.round(2 * Math.random());
                        var index2;
                        while(true){
                            index2 = Math.round(2*Math.random());
                            if(index1 !== index2) break;
                        }
                        console.log('socket.player.ques: ', socket.player.ques);
                        console.log('currentQuestion: ', currentQuestion);
                        console.log('correct: ', correctAnswer);
                        console.log('index1', index1);
                        console.log('index2', index2);

                        var data = {
                            type: 'helpFifty',
                            incorrect1: arr[index1],
                            incorrect2: arr[index2]
                        }
                        socket.emit('help', data);
                        socket.player.help.fifty = false;
                    }else{
                        socket.emit('help', 'your help was unavailable');
                    }

                    break;

                case 'helpPhone':

                    break;

                case 'helpAudience':
                    if(socket.player.help.audience){
                        var currentQuestion = socket.player.ques[socket.player.currentQuestion];
                        var correctAnswer = currentQuestion.correct;
                        var per1 = Math.round(70*Math.random() + 20);
                        var data = {};//contains the incorrect answers.
                        switch (correctAnswer){
                            case 'A':
                                data.A = per1;
                                data.B = Math.round((100-data.A)*Math.random());
                                data.C = Math.round((100-data.A-data.B)*Math.random());
                                data.D = 100 - data.A - data.B - data.C;
                                break;
                            case 'B':
                                data.B = per1;
                                data.A = Math.round((100-data.B)*Math.random());
                                data.C = Math.round((100-data.A-data.B)*Math.random());
                                data.D = 100 - data.A - data.B - data.C;
                                break;
                            case 'C':
                                data.C = per1;
                                data.A = Math.round((100-data.C)*Math.random());
                                data.B = Math.round((100-data.A-data.C)*Math.random());
                                data.D = 100 - data.A - data.B - data.C;
                                break;
                            case 'D':
                                data.D = per1;
                                data.A = Math.round((100-data.D)*Math.random());
                                data.B = Math.round((100-data.A-data.D)*Math.random());
                                data.C = 100 - data.A - data.B - data.D;
                                break;
                            default :
                                break;
                        }
                        data.type = 'helpAudience';
                        socket.emit('help',data);
                        console.log('**** data && :', data);

                    }else{
                        socket.emit('help', 'your help was unavailable');
                    }
                    break;

                default :
                    console.log('this case isn\'t correct');
                    break;
            }
        });
    });
}