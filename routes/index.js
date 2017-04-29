var express = require('express');
var router = express.Router();
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();

/* GET home page. */
router.get('/', function(req, res, next) {
    P.getPokemonByName('eevee') // with Promise
        .then(function(response) {
            console.log(response);
        })
        .catch(function(error) {
            console.log('There was an ERROR: ', error);
        });
  res.render('index');
});

module.exports = router;
