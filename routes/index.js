

const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const Team = require('../models/team');
const League = require('../models/league');
const fetch = require('node-fetch');


const router = express.Router();


router.get('/', (req, res) => {
    League
    .find() 
    .exec()
    .then(leagues => {
        //console.log(leagues)
        res.render('index', { user : req.user, leagues: leagues });
    }) 
    
})

router.get('/profile', (req, res) => {
    if (!req.user) { res.redirect('/'); }
    if (req.user) {
        //console.log(req.user);
        League
            .find({'createdBy':req.user._id}) 
            .exec()
            .then(leagues => {
                //console.log(leagues)
                res.render('profile', { user : req.user, leagues: leagues });
            }) 
    }
    
});

router.post('/create-league', (req, res) => {
    League.create({
                'leaguename':req.body.leaguename,
                'createdBy':req.user._id,
                'leagueOwner':req.user.username
                })
        //res.render('index', { user : req.user });
        res.redirect('/profile');
});

/*router.get('/league/:id', (req, res) => {
    if (!req.user) { res.redirect('/'); }
    if (req.user) {
        req.app.set('leagueId', req.params.id);
        //router.set('leagueId', req.params.id);
        League
            .findOne({'_id':req.params.id}) 
            .exec()
            .then(league => {
                //console.log(league)
                res.render('league', { leaguename: league.leaguename, john: "adams", teams: league.teams, leagueId: req.params.id });
            }) 
    }
    
});*/
router.post('/league/:leaguename', (req, res) => {
    //console.log(req.body, req.params, 'dog')
	Team.create({
        'teamname':req.body.teamname, 
        'leaguename': req.params.leaguename, 
        'createdBy':req.user._id,
        'teamOwner':req.user.username
     },function(doc, x) {
         //console.log(doc, x);
         //console.log('apple');
         League.update({_id:req.params.leaguename},
            {$push: { 
                teams: {'name': req.body.teamname, 'teamId': x._id, 'teamOwner':req.user.username } } }, function(err, doc){
            if (err) {
                throw error
            }
            //console.log(doc);
            
        });
     })
    
     
        res.redirect(`/league/${req.params.leaguename}`);
});


router.get('/league/:id', (req, res) => {
    if (!req.user) { res.redirect('/'); }
    if (req.user) {
        let league_name = "";
        let schedule;
        League
            .findOne({'_id':req.params.id}) 
            .exec()
            .then(league => {
                //console.log(league)
                league_name = league.leaguename;
                schedule = league.schedule;
        //router.set('leagueId', req.params.id);
                Team
                    .find({'leaguename':req.params.id}) 
                    .exec()
                    .then(teams => {
                         //console.log(teams)
                        res.render('league', { teams: teams, leagueId: req.params.id, league_name: league_name, user : req.user, schedule: schedule });
                }) 
            })
    }
    
});
router.get('/team/:id', (req, res) => {
    if (!req.user) { res.redirect('/'); }
    if (req.user) {
        
        Team
            .findOne({'_id':req.params.id}) 
            .exec()
            .then(team => {
                //console.log(team)
                res.render('team', { teamname: team.teamname, teamId: req.params.id, stocks: team.stocks, score: team.score, user : req.user});
            }) 
    }
    
});
router.post('/team/:id', (req, res) => {
    //console.log('we made it', req.body, req.params);
    Team.update({_id:req.params.id}, {$push: { stocks: {'name': req.body.stockname, 'description': req.body.stockdescription} } }, function(err, doc){
        if (err) {
            throw error
        }
        //console.log(doc);
        
    });
    //res.redirect(`/team/${req.params.id}`);
    res.end();
})
router.delete('/team/:id', (req, res) => {
    //console.log('cubs', req.body);

    Team.update(
        {'_id': req.params.id},
        {$pull: {"stocks": {name: req.body.stockname}}},
        false,
        function(err, doc){
            if (err) {
                throw err
            }
            //console.log(doc);
        })
        //res.redirect(`/team/${req.params.id}`);
        res.end();
});




function fetchData(stockname) {
    console.log('fetching data', stockname);
    return fetch(`https://www.quandl.com/api/v3/datasets/${stockname}/data.json?api_key=RHAbp4b2msadmufSJuzn`)
    .then(function(res) {
        return res.json();
    }).then(function(data) {
        console.log('data')
        console.log(data)
        let open = data.dataset_data.data[0][1];
        let close = data.dataset_data.data[0][4];
        let profit = close - open;
        //console.log('the profit for ' + stockname + "  is " + profit);
        return profit;
    });
}
//etchData('WIKI/AAPL');

function profitOrLoss(teamname) {
    let teamStocks = [stock1, stock2, stock3, stock4, stock5];
    let totalProfitOrLoss = 0;
    for (let i=0; i<teamStocks.length; i++) {
        totalProfitOrLoss += teamStocks[i];
    }
}
//var dayInMilliseconds = 1000 * 60 * 60 * 24; 
//setInterval(function() { calculateScores() },dayInMilliseconds );
router.get('/calc', (req, res) => {
    
            let league_id = "";
            League
                .find() 
                .exec()
                .then(leagues => {
                    
                    
                    leagues.forEach(function(league, i) {
                        league_id = league._id;
                        
                        
                        Team
                            .find({'leaguename': league_id}) 
                            .exec()
                            .then(teams => {
                                let leagueTotals = []  
                                teams.forEach(function(team, i) {
       					        leagueTotals.push(updateTeams(team))                                        
				})
   			        Promise.all(leagueTotals).then(l => {
				    //console.log(l) 
                    
					let now = new Date();
					league.schedule.forEach(function(week){
                        
                        
					  if(now >= week.date && now < now.addDays(1)){
                        
						  week.games.forEach(function(game){
						  game.matchups.forEach(function(match){
						  

						var result = l.filter(function( obj ) {
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
				
			        })
			    
                                res.json('calculating scores');
                             }) 



                      	 


                    })
                    
                })
                
            



    
})






function updateTeams(team){

    let totals = [];
    team.stocks.forEach(function(stock, i) {
	  totals.push(fetchData(stock.name));
       
    })
   return Promise.all(totals).then(values => {
	    let teamTotal = 0;
	    for (let i=0; i<values.length; i++) {
            if(values[i]){ 
                teamTotal += values[i]; 
            }
	    }
	    
	    


	     Team.update(
		{_id: team._id},
		{$set: {"score": teamTotal }},
		{multi: true},
		function(err, doc){
		    if (err) {
			throw err
		    }
		})

		return {teamname:team.teamname, score: teamTotal}
	     
	    
	})  
}



router.get('/register', (req, res) => {
    res.render('register', { });
});

router.post('/register', (req, res, next) => {
    Account.register(new Account({ username : req.body.username }), req.body.password, (err, account) => {
        if (err) {
          return res.render('register', { error : err.message });
        }

        passport.authenticate('local')(req, res, () => {
            req.session.save((err) => {
                if (err) {
                    return next(err);
                }
                res.redirect('/profile');
            });
        });
    });
});


router.get('/login', (req, res) => {
    res.render('login', { user : req.user, error : req.flash('error')});
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res, next) => {
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/profile');
    });
});

router.get('/logout', (req, res, next) => {
    req.logout();
    req.session.save((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

router.get('/ping', (req, res) => {
    res.status(200).send("pong!");
});

router.put('/league/:id', (req, res) => {
    //console.log('schedule', req.params)
    League
        .findOne({'_id':req.params.id}, function(err, league) {
            //console.log(league.teams);
            //console.log('football')
            Team.find({'leaguename': req.params.id}, function(err, teams) {
                //console.log(teams, "blue");
                let schedule = tournament(teams);
                league.schedule = schedule;
                    league.save();
            })


            
        }) 

})
console.log('peu')
function tournament(teams) {
    var n = teams.length;
    var schedule = [];

    for (var r = 1; r < n; r++) {
        var dat = new Date();
        console.log('pickles');
        let date = dat.addDays(r-1);
    	var week = {'week':r, 'games':[], 'date':date}
        for (i = 1; i <= n / 2; i++) {
            let game = {'gamenum':i, 'matchups':[]}
            ////console.log(teams[i], i);
            if (i == 1) {
                game.matchups.push({'team':teams[0]});
                game.matchups.push({'team':teams[(n - 1 + r - 1) % (n - 1) + 1]});
            } else {
                game.matchups.push({'team':teams[(r + i - 2) % (n - 1) + 1]});
                game.matchups.push({'team':teams[(n - 1 + r - i) % (n - 1) + 1]});
            }
            //bigarr.push(arr);
            week.games.push(game);
        }
        schedule.push(week)
    }
    //console.log(schedule)
    return schedule;
}

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf());
    dat.setDate(dat.getDate() + days);
    return dat;
  }

  function calculateScores() {
    
            let league_id = "";
            League
                .find() 
                .exec()
                .then(leagues => {
                    
                    
                    leagues.forEach(function(league, i) {
                        league_id = league._id;
                        
                        
                        Team
                            .find({'leaguename': league_id}) 
                            .exec()
                            .then(teams => {
                                let leagueTotals = []  
                                teams.forEach(function(team, i) {
       					        leagueTotals.push(updateTeams(team))                                        
				})
   			        Promise.all(leagueTotals).then(l => {
				    //console.log(l) 
                    
					let now = new Date();
					league.schedule.forEach(function(week){
                        
                        
					  if(now >= week.date && now < now.addDays(1)){
                        
						  week.games.forEach(function(game){
						  game.matchups.forEach(function(match){
						  

						var result = l.filter(function( obj ) {
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
				
			        })
			    
                                
                             }) 

                    })
                })
}



module.exports = router;
