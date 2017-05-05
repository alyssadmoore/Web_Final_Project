var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
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
        res.render('savePokemon', {pokemon: docs, name: req.query.pokemon_name})
    });
});

// TODO save pokemon to a team
router.post('/savePokemon', function(req, res, next){
    /* By querying for null column entries in order, we can find the first null column by
        looking for the first one to return something (not null)*/
    // If we somehow get here and the team is full, nothing will happen
    var again = true;

    function method1() {
        return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p1": null})
            .then(function (response) {
                if (response) {
                    req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p1": req.body.name}});
                    again = false;
                    return again
                }
            });
    }

    function method2(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p2": null})
                .then(function (response) {
                    if (response) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p2": req.body.name}});
                        again = false;
                        return again
                    }
                });
    }

    function method3(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p3": null})
                .then(function (response) {
                    if (response) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p3": req.body.name}});
                        again = false;
                        return again
                    }
                });
    }

    function method4(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p4": null})
                .then(function (response) {
                    if (response) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p4": req.body.name}});
                        again = false;
                        return again
                    }
                });
    }

    function method5(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p5": null})
                .then(function (response) {
                    if (response) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p5": req.body.name}});
                        again = false;
                        return again
                    }
                });
    }

    function method6() {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p6": null})
                .then(function (response) {
                    if (response) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p6": req.body.name}});
                    }
                });
    }

    method1().then(function(a){
        console.log(a);
        if (a){
            var b = method2(a).then(function(b){
                if (b){
                    var c = method3(b).then(function(c){
                        if (c){
                            var d = method4(c).then(function(d){
                                if (d){
                                    var e = method5(d).then(function(e){
                                        if (e){
                                            method6()
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    });
    // if (a){
    //     var b = method2(a);
    //     if (b){
    //         var c = method3(b);
    //         if (c){
    //             var d = method4(c);
    //             if (d){
    //                 var e = method5(d);
    //                 if (e){
    //                     method6()
    //                 }
    //             }
    //         }
    //     }
    // }

    return res.redirect('/teams')
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

// Add a new, empty team
router.post('/newteam', function(req, res, next){
    var title = req.body.title;
    req.db.collection('teams').insertOne({"title":title, "p1":null, "p2":null, "p3":null, "p4":null, "p5":null, "p6":null})
        .then(function(response){
            res.redirect('/teams')
        })
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

//Add a new, empty moveset
// Add a new, empty team
router.post('/newmoveset', function(req, res, next){
    var title = req.body.title;
    req.db.collection('movesets').insertOne({"title":title, "m1":null, "m2":null, "m3":null, "m4":null, "m5":null, "m6":null})
        .then(function(response){
            res.redirect('/movesets')
        })
});

module.exports = router;