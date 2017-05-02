var express = require('express');
var router = express.Router();
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// TODO send back number & sprite as well
router.get('/searchPokemon', function(req, res, next){
    var search = req.query.pokemon_name.toLowerCase();  // search doesn't work if any part is capitalized
    P.getPokemonByName(search).then(function(response){
        var name = response['name'];
        var num = response['id'];
        var sprite = response['sprites']['front_default'];
        // console.log(response);
        res.render('index', {sprite: sprite, pokemon: name, num: num})
    }).catch(function(err){
        console.log('Error:', err)
    });
});

// router.get('/savePokemon', function(req, res, next){
//
// });

module.exports = router;