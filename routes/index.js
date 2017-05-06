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
    P.getPokemonByName(search)
        .then(function(response){
            var name = response['name'];
            var id = response['id'];
            var sprite = response['sprites']['front_default'];
            res.render('index', {sprite: sprite, pokemon: name, pokemon_id: id})})
        .catch(function(err){
            res.render('index');
            return next(err)
    });
});

// Page where you select which team to add the pokemon to
router.get('/savePokemon', function(req, res, next){
    req.db.collection('teams').find().toArray()
        .then(function(response){
            res.render('savePokemon', {pokemon: response, name: req.query.pokemon_name})})
        .catch(function(err){
            res.render('teams');
            return next(err)
        })
});

// Save a pokemon to a team
router.post('/savePokemon', function(req, res, next){
    /* By querying for null column entries in order, we can find the first null column by
        looking for the first one to return something (not null)*/
    // If we somehow get here and the team is full, nothing will happen
    var again = true;

    function method1() {
        return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p1": null})
            .then(function (response) {
                if (response) {
                    req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p1": req.body.name}})
                        .then(function (response) {
                            again = false;
                            return again
                        }).catch(function(err){
                            return next(err)
                        })
                } else {
                    return again
                }
            }).catch(function(err){
                return next(err)
            })
    }

    function method2(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p2": null})
                .then(function (response) {
                    if (response && again){
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p2": req.body.name}})
                            .then(function(response){
                                again = false;
                                return again
                            }).catch(function(err){
                                return next(err)
                            })
                    } else {
                        return again
                    }
                }).catch(function(err){
                    return next(err)
                })
    }

    function method3(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p3": null})
                .then(function (response) {
                    if (response && again) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p3": req.body.name}})
                            .then(function(response){
                                again = false;
                                return again
                            }).catch(function(err){
                                return next(err)
                            })
                    } else {
                        return again
                    }
                }).catch(function(err){
                    return next(err)
                })
    }

    function method4(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p4": null})
                .then(function (response) {
                    if (response && again) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p4": req.body.name}})
                            .then(function(response){
                                again = false;
                                return again
                            }).catch(function(err){
                                return next(err)
                            })
                    } else {
                        return again
                    }
                }).catch(function (err) {
                    return next(err)
                })
    }

    function method5(again) {
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p5": null})
                .then(function (response) {
                    if (response && again) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p5": req.body.name}})
                            .then(function(response){
                                again = false;
                                return again
                            }).catch(function(err){
                                return next(err)
                            })
                    } else {
                        return again
                    }
                }).catch(function(err){
                    return next(err)
                })
    }

    function method6(again) {
            req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p6": null})
                .then(function (response) {
                    if (response && again) {
                        return req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p6": req.body.name}})
                            .then(function(response){
                                res.redirect('teams')
                            }).catch(function(err){
                                return next(err)
                            })
                    } else {
                        return again
                    }
                }).catch(function(err){
                    return next(err)
                })
    }

    // Chaining the promises to access variable 'again', if changed
    method1().then(function(a) {
        if (!a){
            res.redirect('teams')
        } else {
            return method2(a)
        }
    }).then(function(b){
        if (!b){
            res.redirect('teams')
        } else {
            return method3(b)
        }
    }).then(function(c){
        if (!c){
            res.redirect('teams')
        } else {
            return method4(c)
        }
    }).then(function(d){
        if (!d){
            res.redirect('teams')
        } else {
            return method5(d)
        }
    }).then(function(e){
        if (!e){
            res.redirect('teams')
        } else {
            return method6(e)
        }
    });
});

// Page where user selects which pokemon from team to remove
router.get('/removeFromTeam', function(req, res, next){
    var id = req.query.team;
    req.db.collection('teams').findOne({'_id': ObjectId(id)})
        .then(function(response){
            res.render('removeFromTeam', {pokemon: response, team: id})
        }).catch(function(err){
            res.render('/');
            return next(err)
    })
});

// Remove pokemon from team, redirect to team page
router.post('/removeFromTeam', function(req, res, next){
    var team = req.body.team;
    var pokemon = req.body.pokemon;
    req.db.collection('teams').updateOne({'_id': ObjectId(team)}, {$set: {[pokemon]: null}})
        .then(function(response){
            res.redirect('teams')
        }).catch(function(err){
            res.redirect('teams');
            return next(err)
    })
});

// Get teams
router.get('/teams', function(req, res, next){
    req.db.collection('teams').find().toArray()
        .then(function(response){
            res.render('teams', {pokemon: response})})
        .catch(function(err){
            res.render('teams');
            return next(err)
        })
});

// Add a new, empty team
router.post('/newteam', function(req, res, next){
    var title = req.body.title;
    req.db.collection('teams').insertOne({"title":title, "p1":null, "p2":null, "p3":null, "p4":null, "p5":null, "p6":null})
        .then(function(response){
            res.redirect('teams')})
        .catch(function(err){
            res.redirect('teams');
            return next(err)
        })
});

// Sends back move search results
router.get('/searchMoves', function(req, res, next){
    var search = req.query.move_name.toLowerCase();  // search doesn't work if any part is capitalized
    P.getMoveByName(search)
        .then(function(response){
            var move = response['name'];
            var type = response['type']['name'];
            res.render('index', {move: move, type: type})
        }).catch(function(err){
            res.render('index');
            return next(err)
    })
});

// Page where you select which moveset to add the move to
router.get('/saveMove', function(req, res, next){
    req.db.collection('movesets').find().toArray()
        .then(function(response){
            res.render('saveMove', {moves: response, name: req.query.move_name})
        }).catch(function(err){
            res.render('movesets');
            return next(err)
        })
});

// Save move to moveset
router.post('/saveMove', function(req, res, next){  // Same basic method as /savePokemon POST above
    var again = true;

    function method1() {
        return req.db.collection('movesets').findOne({"_id": ObjectId(req.body.id), "m1": null})
            .then(function (response) {
                if (response) {
                    req.db.collection('movesets').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"m1": req.body.name}})
                        .then(function (response) {
                            again = false;
                            return again
                        }).catch(function(err){
                        return next(err)
                    })
                } else {
                    return again
                }
            }).catch(function(err){
                return next(err)
            })
    }

    function method2(again) {
        return req.db.collection('movesets').findOne({"_id": ObjectId(req.body.id), "m2": null})
            .then(function (response) {
                if (response && again){
                    req.db.collection('movesets').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"m2": req.body.name}})
                        .then(function(response){
                            again = false;
                            return again
                        }).catch(function(err){
                        return next(err)
                    })
                } else {
                    return again
                }
            }).catch(function(err){
                return next(err)
            })
    }

    function method3(again) {
        return req.db.collection('movesets').findOne({"_id": ObjectId(req.body.id), "m3": null})
            .then(function (response) {
                if (response && again) {
                    req.db.collection('movesets').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"m3": req.body.name}})
                        .then(function(response){
                            again = false;
                            return again
                        }).catch(function(err){
                        return next(err)
                    })
                } else {
                    return again
                }
            }).catch(function(err){
                return next(err)
            })
    }

    function method4(again) {
        return req.db.collection('movesets').findOne({"_id": ObjectId(req.body.id), "m4": null})
            .then(function (response) {
                if (response && again) {
                    req.db.collection('movesets').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"m4": req.body.name}})
                        .then(function(response){
                            again = false;
                            return again
                        }).catch(function(err){
                        return next(err)
                    })
                } else {
                    return again
                }
            }).catch(function (err) {
                return next(err)
            })
    }

    // Chaining the promises to access variable 'again', if changed
    method1().then(function(a) {
        if (!a){
            res.redirect('movesets')
        } else {
            return method2(a)
        }
    }).then(function(b){
        if (!b){
            res.redirect('movesets')
        } else {
            return method3(b)
        }
    }).then(function(c){
        if (!c){
            res.redirect('movesets')
        } else {
            return method4(c)
        }
    })
});

// Get movesets
router.get('/movesets', function(req, res, next){
    req.db.collection('movesets').find().toArray()
        .then(function(response) {
            res.render('movesets', {moves: response})})
        .catch(function(err){
            return next(err)
    })
});

// Add a new, empty moveset
router.post('/newmoveset', function(req, res, next){
    var title = req.body.title;
    req.db.collection('movesets').insertOne({"title":title, "m1":null, "m2":null, "m3":null, "m4":null, "m5":null, "m6":null})
        .then(function(response){
            res.redirect('/movesets')})
        .catch(function(err){
            return next(err)
        })
});

module.exports = router;