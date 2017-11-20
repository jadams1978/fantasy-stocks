const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const Team = require('../models/team');
const League = require('../models/league');
const fetch = require('node-fetch');

const router = express.Router();

//home page. shows leagues user has joined.
router.get('/', (req, res) => {
	League
		.find()
		.exec()
		.then(leagues => {
			//console.log(leagues)
			res.render('index', {
				user: req.user,
				leagues: leagues
			});
		})
})

//user profile page. must be logged into account. lists username and leagues.
router.get('/profile', loggedIn, (req, res) => {
	League
		.find({
			'createdBy': req.user._id
		})
		.exec()
		.then(leagues => {
			res.render('profile', {
				user: req.user,
				leagues: leagues
			});
		})
});

//allows user to create leagues. user can access their leagues from profile.
router.post('/create-league', loggedIn, (req, res) => {
	League.create({
		'leaguename': req.body.leaguename,
		'createdBy': req.user._id,
		'leagueOwner': req.user.username
	})
	res.redirect('/profile');
});

//create a team associated with a specific league and user.
router.post('/league/:leaguename', loggedIn, (req, res) => {
	Team.create({
		'teamname': req.body.teamname,
		'leaguename': req.params.leaguename,
		'createdBy': req.user._id,
		'teamOwner': req.user.username
	}, function(doc, x) {
		League.update({
			_id: req.params.leaguename
		}, {
			$push: {
				teams: {
					'name': req.body.teamname,
					'teamId': x._id,
					'teamOwner': req.user.username
				}
			}
		}, function(err, doc) {
			if (err) {
				throw error
			}
		});
	})
	res.redirect(`/league/${req.params.leaguename}`);
});

//leagues have a unique ID. if the league has started users can view the weekly matchup schedule.
router.get('/league/:id', loggedIn, (req, res) => {
	let league_name = "";
	let schedule;
	League
		.findOne({
			'_id': req.params.id
		})
		.exec()
		.then(league => {
			league_name = league.leaguename;
			schedule = league.schedule;
			started = league.started;
			Team
				.find({
					'leaguename': req.params.id
				})
				.exec()
				.then(teams => {
					res.render('league', {
						teams: teams,
						leagueId: req.params.id,
						league_name: league_name,
						user: req.user,
						schedule: schedule,
						started: started
					});
				})
		})
});

//view a specific team page.
router.get('/team/:id', loggedIn, (req, res) => {
	Team
		.findOne({
			'_id': req.params.id
		})
		.exec()
		.then(team => {
			res.render('team', {
				teamname: team.teamname,
				teamId: req.params.id,
				stocks: team.stocks,
				score: team.score,
				user: req.user
			});
		})
});

//adding stocks to team.
router.post('/team/:id', loggedIn, (req, res) => {
	Team.update({
		_id: req.params.id
	}, {
		$push: {
			stocks: {
				'name': req.body.stockname,
				'description': req.body.stockdescription
			}
		}
    }, 
    function(err, doc) {
		if (err) {
			throw error
		}
	});
	res.end();
})

//deleting stocks from team.
router.delete('/team/:id', loggedIn, (req, res) => {
	Team.update({
			'_id': req.params.id
		}, {
			$pull: {
				"stocks": {
					name: req.body.stockname
				}
			}
		},
		false,
		function(err, doc) {
			if (err) {
				throw err
			}
		})
	res.end();
});

//find stock profits by subtracting open value from close value. data is from quandl.com api.
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
			return profit;
		});
}

//this isnt needed
function profitOrLoss(teamname) {
	let teamStocks = [stock1, stock2, stock3, stock4, stock5];
	let totalProfitOrLoss = 0;
	for (let i = 0; i < teamStocks.length; i++) {
		totalProfitOrLoss += teamStocks[i];
	}
}

//var dayInMilliseconds = 1000 * 60 * 60 * 24; 
//setInterval(function() { calculateScores() },dayInMilliseconds );

//calculate scores. find all leagues and then all teams within each league. the score is calculated
//for each date in matchup schedule and saved.
router.get('/calc', (req, res) => {
	let league_id = "";
	League
		.find()
		.exec()
		.then(leagues => {
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
							let now = new Date();
							league.schedule.forEach(function(week) {
								if (now >= week.date && now < now.addDays(1)) {
									week.games.forEach(function(game) {
										game.matchups.forEach(function(match) {
											var result = l.filter(function(obj) {
												return obj.teamname == match.team.teamname;
											});
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

//update scores. the daily scores are added together into one total score.
function updateTeams(team) {
	let totals = [];
	team.stocks.forEach(function(stock, i) {
		totals.push(fetchData(stock.name));
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

//page where user can signup.
router.get('/register', (req, res) => {
	res.render('register', {});
});

//user enters a username and password to signup. user is saved to database.
router.post('/register', (req, res, next) => {
	Account.register(new Account({
		username: req.body.username
	}), req.body.password, (err, account) => {
		if (err) {
			return res.render('register', {
				error: err.message
			});
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

//user login page.
router.get('/login', (req, res) => {
	res.render('login', {
		user: req.user,
		error: req.flash('error')
	});
});

//goes to profile if login credentials are correct.
router.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: true
}), (req, res, next) => {
	req.session.save((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/profile');
	});
});

//user log out.
router.get('/logout', loggedIn, (req, res, next) => {
	req.logout();
	req.session.save((err) => {
		if (err) {
			return next(err);
		}
		res.redirect('/');
	});
});

//start league button clicked. schedule is rendered from tournament function.
router.put('/league/:id', loggedIn, (req, res) => {
	console.log('schedule', req.params)
	League
		.findOne({
			'_id': req.params.id
		}, function(err, league) {
			console.log('football')
			Team.find({
				'leaguename': req.params.id
			}, function(err, teams) {
				console.log(teams, "blue");
				let schedule = tournament(teams);
				league.schedule = schedule;
				league.started = true;
				league.save();
				res.end();
			})
		})
})

//round robin tournament created. creates league schedule that 
//makes each team play each other team with no repeats.
function tournament(teams) {
	if (!teams) {
		return;
	}
	var n = teams.length;
	var schedule = [];
	for (var r = 1; r < n; r++) {
		var dat = new Date();
		console.log('pickles');
		let date = dat.addDays(r - 1);
		var week = {
			'week': r,
			'games': [],
			'date': date
		}
		for (i = 1; i <= n / 2; i++) {
			let game = {
				'gamenum': i,
				'matchups': []
			}
			if (i == 1) {
				game.matchups.push({
					'team': teams[0]
				});
				game.matchups.push({
					'team': teams[(n - 1 + r - 1) % (n - 1) + 1]
				});
			} else {
				game.matchups.push({
					'team': teams[(r + i - 2) % (n - 1) + 1]
				});
				game.matchups.push({
					'team': teams[(n - 1 + r - i) % (n - 1) + 1]
				});
			}
			week.games.push(game);
		}
		schedule.push(week)
	}
	return schedule;
}

//gets current date and adds future days.
Date.prototype.addDays = function(days) {
	var dat = new Date(this.valueOf());
	dat.setDate(dat.getDate() + days);
	return dat;
}

//calculate and save scores for each team in each league.
function calculateScores() {
	let league_id = "";
	League
		.find()
		.exec()
		.then(leagues => {
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
							let now = new Date();
							league.schedule.forEach(function(week) {
								if (now >= week.date && now < now.addDays(1)) {
									week.games.forEach(function(game) {
										game.matchups.forEach(function(match) {
											var result = l.filter(function(obj) {
												return obj.teamname == match.team.teamname;
											});
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

//checks if user is logged-in. used to prevent other users from accessing private pages.
function loggedIn(req, res, next) {
	if (req.user) {
		console.log("loggedIn")
		next();
	} else {
		console.log("logged out")
		res.redirect('/login');
	}
}

module.exports = router;