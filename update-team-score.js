const express = require('express');
const passport = require('passport');
const Account = require('./models/account');
const Team = require('./models/team');
const League = require('./models/league');
const fetch = require('node-fetch');
const bluebird = require('bluebird'); 
const mongoose = require('mongoose');



const PromiseThrottle = require('promise-throttle');

var promiseThrottle = new PromiseThrottle({
    requestsPerSecond: .5,           // up to 1 request per second 
});


mongoose.Promise = bluebird;
mongoose.connect('mongodb://localhost/stocks');
//mongoose.connect('mongodb://john:fantasystocks@ds155695.mlab.com:55695/fantasystocks');
console.log('update');


function fetchData(stockname) {
    console.log('fetching data', stockname);
    return fetch(`https://www.quandl.com/api/v3/datasets/${stockname}/data.json?api_key=RHAbp4b2msadmufSJuzn`)
        .then(function(res) {
            return res.json();
	}).then(function(data) {
	    console.log('data',data.quandl_error)

	    if(!data.dataset_data){ return null}
	    //console.log('data',data)
            let open = data.dataset_data.data[0][1];
            let close = data.dataset_data.data[0][4];
            let profit = close - open;
            console.log('the profit for ' + stockname + "  is " + profit);
            
            return profit;
	}).catch(function(err){
   	        console.log('err', err)
		throw err; 
	});
}



 var myFunction = function(i) {
    return new Promise(function(resolve, reject) {
      // here we simulate that the promise runs some code 
      // asynchronously 
      setTimeout(function() {
        console.log(i + ": " + Math.random());
        resolve(i);
      }, 10);
    });
  };




 var fetchFunction = function(stockname) {
    //return new Promise(function(resolve, reject) {
      // here we simulate that the promise runs some code 
      // asynchronously 

     console.log('fetching data', stockname);
     return fetch(`https://www.quandl.com/api/v3/datasets/${stockname}/data.json?api_key=RHAbp4b2msadmufSJuzn`)
        .then(function(res) {
            return res.json();
	}).then(function(data) {
	    console.log('data',data.quandl_error)

	    if(!data.dataset_data){ return null}
	    //console.log('data',data)
            let open = data.dataset_data.data[0][1];
            let close = data.dataset_data.data[0][4];
            let profit = close - open;
            console.log('the profit for ' + stockname + "  is " + profit);
            
	    return profit;
	    //resolve(stockname);

	}).catch(function(err){
   	        console.log('err', err)
		throw err; 
	});



   // });
  };



function updateTeams(team) {

    let totals = [];
    team.stocks.forEach(function(stock, i) {
       // totals.push(fetchData(stock.name));
	//promiseThrottle.add(myFunction.bind(this, 1)
	//totals.push(promiseThrottle.add(fetchData(stock.name).bind(this, i)));
	//totals.push(promiseThrottle.add(fetchFunction.bind(this, stock.name)))
	totals.push(promiseThrottle.add(fetchFunction.bind(this, stock.name)))
	
    })
    return Promise.all(totals).then(values => {
        let teamTotal = 0;
        for (let i = 0; i < values.length; i++) {
            if (values[i]) {
                teamTotal += values[i];
            }
        }

        Team.update({
                _id: team._id
            }, {
                $set: {
                    "score": teamTotal
                }
            }, {
                multi: true
            },
            function(err, doc) {
                if (err) {
                    throw err
                }
            })

        return {
            teamname: team.teamname,
            score: teamTotal
        }


    })
}




function updateLeague(league_id){



}

function calculateScores() {
    console.log('hi omething');
    let league_id = "";
    League
        .find()
        .exec()
        .then(leagues => {
            console.log(leagues);

            leagues.forEach(function(league, i) {
            league_id = league._id;


                Team
                    .find({
                        'leaguename': league_id
                    })
                    .exec()
                    .then(teams => {
                        let leagueTotals = []
                        teams.forEach(function(team, i) {
                            leagueTotals.push(updateTeams(team))
                        })
                        Promise.all(leagueTotals).then(l => {
                            console.log(l) 

                            let now = new Date();
                            league.schedule.forEach(function(week) {


                                if (now >= week.date && now < now.addDays(1)) {

                                    week.games.forEach(function(game) {
                                        game.matchups.forEach(function(match) {


                                            var result = l.filter(function(obj) {
                                                //console.log(obj)
                                                return obj.teamname == match.team.teamname;
                                            });
                                            //console.log(result,'result')
                                            match.team.score = result[0].score;
                                        })
                                    })
                                }
                            })

                            league.markModified('schedule');

                            league.save();


                            console.log('calcfunction', new Date());
                            console.log(' ');
                            console.log(' ');
                            console.log(' ');
                            console.log(' ');
                            console.log(' ');
                            setTimeout(function() {
				//mongoose.connection.close();
                                console.log("end bucs");

                            },2000)
                            
                        })
                        console.log('end bengals');


                    })
                    console.log('end seahawks');

            })
            console.log('end pats');
        })
}

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
}
calculateScores();

