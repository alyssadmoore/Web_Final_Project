var express = require('express');
var router = express.Router();
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// TODO send back name & sprite as well
router.get('/searchPokemon', function(req, res, next){
    P.getPokemonByName(req.query.pokemon_name).then(function(response){
        res.render('index', {pokemon: response['id']})
    }).catch(function(err){
        console.log('Error:', err)
    });
});

// router.get('/savePokemon', function(req, res, next){
//
// });

module.exports = router;