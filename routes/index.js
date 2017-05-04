var express = require('express');
var router = express.Router();
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();

// Gets home page
router.get('/', function(req, res, next) {
  res.render('index');
});

// Sends back pokemon search results
router.get('/searchPokemon', function(req, res, next){
    var search = req.query.pokemon_name.toLowerCase();  // search doesn't work if any part is capitalized
    P.getPokemonByName(search).then(function(response){
        var name = response['name'];
        var id = response['id'];
        var sprite = response['sprites']['front_default'];
        // console.log(response);
        res.render('index', {sprite: sprite, pokemon: name, pokemon_id: id})
    }).catch(function(err){
        res.render('index')
    });
});

// Page where you select which team to add the pokemon to
router.get('/savePokemon', function(req, res, next){
    req.db.collection('teams').find().toArray(function(err, docs){
        if(err){
            return next(err)
        }
        res.render('savePokemon', {pokemon: docs, id: req.query.pokemon_id})
    });
});

// TODO save pokemon to a team
router.post('/savePokemon', function(req, res, next){
    var id = req.body.id;
    console.log(id);
    res.redirect('/teams')
});

// Get teams
router.get('/teams', function(req, res, next){
    req.db.collection('teams').find().toArray(function(err, docs){
        if(err){
            return next(err)
        }
        res.render('teams', {pokemon: docs})
    });
});

// Sends back move search results
router.get('/searchMoves', function(req, res, next){
    var search = req.query.move_name.toLowerCase();  // search doesn't work if any part is capitalized
    P.getMoveByName(search).then(function(response){
        var move = response['name'];
        var type = response['type']['name'];
        // console.log(response);
        res.render('index', {move: move, type: type})
    }).catch(function(err){
        res.render('index')
    });
});

// TODO save move to moveset
router.post('/saveMove', function(req, res, next){
    res.redirect('movesets')
});

// Get movesets
router.get('/movesets', function(req, res, next){
    req.db.collection('movesets').find().toArray(function(err, docs){
        if(err){
            return next(err)
        }
        res.render('movesets', {moves: docs})
    });
});

module.exports = router;