var express = require('express');
var https = require('https');
var passport = require('passport');
var Account = require('../models/account');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var Pokedex = require('pokedex-promise-v2');
var P = new Pokedex();

// Gets home page
router.get('/', function(req, res) {
    res.render('index', {user: req.user});
});

// Register page
router.get('/register', function(req, res) {
    res.render('register', {});
});

// Passwords are salted & hashed automatically
router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            req.session.save(function(err){
                if(err){
                    return next(err)
                }
                res.redirect('/');
            })
        })
    })
});

router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

// View specific information about any pokemon
router.get('/pokemon', function(req, res, next){
    var name = req.query.pokemon;
    var lower_name = name.toLowerCase();

    // Getting most of the data ready
    function method1() {
        return P.getPokemonByName(lower_name)   // search only works with all-lowercase string
            .then(function (response) {
                var id = response['id'];
                var sprite = response['sprites']['front_default'];
                var shiny_sprite = response['sprites']['front_shiny'];
                var weight = response['weight'];
                var height = response['height'];
                var stats = response['stats'];
                var abilities = response['abilities'];
                var types = response['types'];
                var title_name = titleCase(name);
                var results = {
                    name: title_name, id: id, sprite: sprite, shiny_sprite: shiny_sprite, weight: weight,
                    height: height, stats: stats, abilities: abilities, types: types
                };
                return results
            }).catch(function (err) {
                res.render('index');
                return next(err)
        });
    }

    // Pass abilities list to extract effect strings
    function method2(x){
        return P.getAbilityByName(x['ability']['name'])
            .then(function(response){
                return response['effect_entries'][0]['short_effect']
            }).catch(function(err){
                res.render('index');
                return next(err)
            });
    }

    // Get data dict, then send abilities to method2 to extract effects, then combine these with data dict
    var ability_list = [];
    method1().then(function(data){
        for (var i = 0; i < data['abilities'].length; i++){
            method2(data['abilities'][i]).then(function(entry){
                ability_list.push(entry);
                if (ability_list.length == data['abilities'].length){
                    for (var j = 0; j < data['abilities'].length; j++){
                        data['abilities'][j].effect = ability_list[j]
                    }
                    res.render('pokemon', data)
                }
            });
        }
    });
});

// Sends back pokemon search results
router.get('/searchPokemon', function(req, res, next){
    var search = req.query.pokemon_name.toLowerCase();  // search doesn't work if any part is capitalized
    P.getPokemonByName(search)
        .then(function(response){
            var name = response['name'];
            var id = response['id'];
            var sprite = response['sprites']['front_default'];
            var title_name = titleCase(name);
            res.render('index', {sprite: sprite, pokemon: title_name, pokemon_id: id})})
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
            return req.db.collection('teams').findOne({"_id": ObjectId(req.body.id), "p6": null})
                .then(function (response) {
                    if (response && again) {
                        req.db.collection('teams').updateOne({"_id": ObjectId(req.body.id)}, {$set: {"p6": req.body.name}})
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

// Page asks user if they are sure they want to delete the team
router.get('/deleteTeam', function(req, res, next){
    var team_id = req.query.team;
    req.db.collection('teams').findOne({"_id": ObjectId(team_id)})
        .then(function(response){
            res.render('deleteTeam', {team: response})
        }).catch(function(err){
            res.render('teams');
            return next(err)
    })
});

// Delete a team, redirect to teams page
router.post('/deleteTeam', function(req, res, next){
    var team_id = req.body.team;
    req.db.collection('teams').removeOne({"_id": ObjectId(team_id)})
        .then(function(response){
            res.redirect('teams')
        }).catch(function(err){
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

// View more information about a move
router.get('/move', function(req, res, next){

    function getInfo() {
        return P.getMoveByName(req.query.move)
            .then(function (response) {
                var accuracy = response['accuracy'];
                var power = response['power'];
                var name = response['name'];
                var type = response['type']['name'];
                var stat_changes = response['stat_changes'];
                var effect_changes = response['effect_changes'];
                var effect = response['effect_entries'][0]['short_effect'];
                var pp = response['pp'];
                var damage_class = response['damage_class']['name'];
                var contest_type = response['contest_type']['name'];
                var contest_effect_url = response['contest_effect']['url'];
                var super_contest_effect_url = response['super_contest_effect']['url'];
                var title_name = titleCase(name);
                var results = {
                    accuracy: accuracy, power: power, name: title_name, type: type, stat_changes: stat_changes,
                    effect_changes: effect_changes, pp: pp, effect: effect, damage_class: damage_class,
                    contest_type: contest_type, contest_effect_url: contest_effect_url, super_contest_effect_url:
                    super_contest_effect_url
                };
                return results
            }).catch(function (err) {
            res.render('index');
            return next(err)
        })
    }

    function parseJson(url, callback){
        return https.get(url, function(res){
            var body = '';
            res.on('data', function(chunk){
                body += chunk
            });
            res.on('end', function(){
                var response = JSON.parse(body);
                callback(response)
            })
        })
    }

    getInfo().then(function(data){
        var a = data['contest_effect_url'].replace("http", "https");    // node doesn't like http, replace with https
        return parseJson(a, function(json1){
            data.contest_effect = json1['effect_entries'][0]['effect'];
            var b = data['super_contest_effect_url'].replace("http", "https");
            parseJson(b, function(json2){
                data.super_contest_effect = json2['flavor_text_entries'][0]['flavor_text'];
                res.render('move', data)
            })
        })
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

// Page asks user if they are sure they want to delete the moveset
router.get('/deleteMoveset', function(req, res, next){
    var moveset_id = req.query.moveset;
    req.db.collection('movesets').findOne({"_id": ObjectId(moveset_id)})
        .then(function(response){
            res.render('deleteMoveset', {moveset: response})
        }).catch(function(err){
            res.render('movesets');
            return next(err)
    })
});

// Delete a team, redirect to movesets page
router.post('/deleteMoveset', function(req, res, next){
    var moveset_id = req.body.moveset;
    req.db.collection('movesets').removeOne({"_id": ObjectId(moveset_id)})
        .then(function(response){
            res.redirect('movesets')
        }).catch(function(err){
        res.redirect('movesets');
        return next(err)
    })
});

// Page where user selects which pokemon from team to remove
router.get('/removeFromMoveset', function(req, res, next){
    var id = req.query.id;
    req.db.collection('movesets').findOne({'_id': ObjectId(id)})
        .then(function(response){
            res.render('removeFromMoveset', {moveset: response})
        }).catch(function(err){
            res.render('/');
            return next(err)
    })
});

// Remove pokemon from team, redirect to team page
router.post('/removeFromMoveset', function(req, res, next){
    var moveset = req.body.moveset;
    var move = req.body.move;
    req.db.collection('movesets').updateOne({'_id': ObjectId(moveset)}, {$set: {[move]: null}})
        .then(function(response){
            res.redirect('movesets')
        }).catch(function(err){
        res.redirect('movesets');
        return next(err)
    })
});

// Returns any string passed to it in titlecase
function titleCase(str) {
    var words = str.toLowerCase().split(' ');

    for(var x = 0; x < words.length; x++) {
        var letters = words[x].split('');
        letters[0] = letters[0].toUpperCase();
        words[x] = letters.join('');
    }
    return words.join(' ');
}

module.exports = router;