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

// TODO save pokemon to team
router.get('/savePokemon', function(req, res, next){
    res.render('index')
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
router.get('/savePokemon', function(req, res, next){
    res.render('index')
});


module.exports = router;