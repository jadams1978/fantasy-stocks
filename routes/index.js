

const express = require('express');
const passport = require('passport');
const Account = require('../models/account');
const Team = require('../models/team');
const League = require('../models/league');
const fetch = require('node-fetch');

const router = express.Router();


router.get('/', (req, res) => {
    res.render('index', { user : req.user });
})

router.get('/profile', (req, res) => {
    if (!req.user) { res.redirect('/'); }
    if (req.user) {
        console.log(req.user);
        League
            .find({'createdBy':req.user._id}) 
            .exec()
            .then(leagues => {
                console.log(leagues)
                res.render('profile', { user : req.user, leagues: leagues });
            }) 
    }
    
});

router.post('/create-league', (req, res) => {
	League.create({'leaguename':req.body.leaguename, 'createdBy':req.user._id})
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
                console.log(league)
                res.render('league', { leaguename: league.leaguename, john: "adams", teams: league.teams, leagueId: req.params.id });
            }) 
    }
    
});*/
router.post('/league/:leaguename', (req, res) => {
    console.log(req.body, req.params, 'dog')
	Team.create({'teamname':req.body.teamname, 'leaguename': req.params.leaguename, 'createdBy':req.user._id })
        
        res.redirect(`/league/${req.params.leaguename}`);
});

router.get('/league/:id', (req, res) => {
    if (!req.user) { res.redirect('/'); }
    if (req.user) {
        
        //router.set('leagueId', req.params.id);
        Team
            .find({'leaguename':req.params.id}) 
            .exec()
            .then(teams => {
                console.log(teams)
                res.render('league', { teams: teams, leagueId: req.params.id });
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
                console.log(team)
                res.render('team', { teamname: team.teamname, teamId: req.params.id, stocks: team.stocks });
            }) 
    }
    
});
router.post('/team/:id', (req, res) => {
    console.log('we made it', req.body, req.params);
    Team.update({_id:req.params.id}, {$push: { stocks: {'name': req.body.stockname, 'description': req.body.stockdescription} } }, function(err, doc){
        if (err) {
            throw error
        }
        console.log(doc);
        
    });
    //res.redirect(`/team/${req.params.id}`);
    res.end();
})
router.delete('/team/:id', (req, res) => {
    console.log('cubs', req.body);

    Team.update(
        {'_id': req.params.id},
        {$pull: {"stocks": {name: req.body.stockname}}},
        false,
        function(err, doc){
            if (err) {
                throw err
            }
            console.log(doc);
        })
        //res.redirect(`/team/${req.params.id}`);
        res.end();
});




function fetchData(stockname) {
    console.log('fetching data');
    fetch(`https://www.quandl.com/api/v3/datasets/${stockname}/data.json?api_key=RHAbp4b2msadmufSJuzn`)
    .then(function(res) {
        return res.json();
    }).then(function(data) {
        
        let open = data.dataset_data.data[0][1];
        let close = data.dataset_data.data[0][4];
        let profit = close - open;
        console.log('the profit for ' + stockname + "  is " + profit);
    });
}
fetchData('WIKI/FB');

function profitOrLoss(teamname) {
    let teamStocks = [stock1, stock2, stock3, stock4, stock5];
    let totalProfitOrLoss = 0;
    for (let i=0; i<teamStocks.length; i++) {
        totalProfitOrLoss += teamStocks[i];
    }
}
//profitOrLoss('saq');
/*router.post('/create-team', (req, res) => {
    Team.create({'teamname':req.body.teamname})
    console.log(req.body)
    console.log('poop')
        //res.render('index', { user : req.user });
        res.render('team', {teamname:req.body.teamname});
});*/



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

module.exports = router;
