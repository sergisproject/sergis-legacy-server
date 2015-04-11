/*
    The SerGIS Project - sergis-server

    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */

// This file handles everything having to do with serving the socket for
// sergis-author

// our modules
var config = require("../../config"),
    db = require("../db");


/**
 * Initialize the handler for connections to the "/author" socket.
 * This is called each time a new connection is made to the "/author" socket.
 *
 * @param socket - The Socket instance.
 * @param {Function} next - The function to call once we have initialized
 *        the socket on our end.
 */
module.exports = function (socket, next) {
    // init handler
    socket.on("init", function (sessionID, callback) {
        if (!sessionID) {
            return callback(false);
        }
        
        // Since we have a session ID, try looking up username from that
        db.getSessionByID(sessionID, function (err, session) {
            if (err || !session || !session.username) {
                // Nothing useful in the session
                return callback(false);
            }
            
            // Initialize the rest of the handlers
            initHandlers(socket, session.username);
            return callback(true);
        });
    });

    // Everything's initialized for us; move on!
    return next();
};


/**
 * Initialize all of the game storage-related handlers for a socket instance.
 */
function initHandlers(socket, username) {
    // getGameList function; args: [] --> Object<string, Date>
    socket.on("getGameList", function (args, callback) {
        db.author.getAll(username, function (err, gameList) {
            if (err) return callback(false);
            return callback(true, gameList);
        });
    });

    // loadGame function; args: [gameName] --> Object
    socket.on("loadGame", function (args, callback) {
        var gameName = args[0];
        db.author.get(username, gameName, function (err, jsondata) {
            if (err || !jsondata) return callback(false);
            return callback(true, jsondata);
        });
    });

    // saveGame function; args: [gameName, jsondata]
    socket.on("saveGame", function (args, callback) {
        var gameName = args[0], jsondata = args[1];
        // First, try creating it
        db.author.create(username, gameName, jsondata, function (err, didItAllGoWell) {
            if (err) return callback(false);
            if (didItAllGoWell) {
                // Yay, all done!
                return callback(true);
            } else {
                // It didn't go well, probably cause it already exists, so we need to update
                db.author.update(username, gameName, jsondata, function (err) {
                    if (err) return callback(false);
                    // Yay, all done for realz!
                    return callback(true);
                });
            }
        });
    });

    // renameGame function; args: [gameName, newGameName]
    socket.on("renameGame", function (args, callback) {
        var gameName = args[0], newGameName = args[1];
        db.author.get(username, gameName, function (err, jsondata) {
            if (err || !jsondata) return callback(false);
            db.author.delete(username, gameName, function (err) {
                if (err) return callback(false);
                db.author.create(username, newGameName, jsondata, function (err) {
                    if (err) return callback(false);
                    return callback(true);
                });
            });
        });
    });

    // removeGame function; args: [gameName]
    socket.on("removeGame", function (args, callback) {
        var gameName = args[0];
        db.author.delete(username, gameName, function (err) {
            if (err) return callback(false);
            callback(true);
        });
    });

    // checkGameName function; args: [gameName] --> number
    socket.on("checkGameName", function (args, callback) {
        var gameName = args[0];
        if (!gameName || !config.URL_SAFE_REGEX.test(gameName)) return callback(true, -1);
        // It's valid, check to see if it's taken
        db.author.get(username, gameName, function (err, jsondata) {
            if (err) return callback(false);
            return callback(true, jsondata ? 0 : 1);
        });
    });

    // previewGame and publishGame functions; args: [gameName] --> Object
    function pubviewGame(type, args, callback) {
        var gameName = args[0];
        // Make sure the game exists
        db.author.get(username, gameName, function (err, jsondata) {
            if (err || !jsondata) return callback(false);
            // Okay, it's good
            return callback(true, {
                url: config.HTTP_PREFIX + "/account/author/" + type,
                method: "POST",
                data: {
                    gameName: gameName
                },
                enctype: "multipart/form-data"
            });
        });
    }
    socket.on("previewGame", pubviewGame.bind(null, "preview"));
    socket.on("publishGame", pubviewGame.bind(null, "publish"));
}
