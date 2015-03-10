/*
    The SerGIS Project - sergis-server

    Copyright (c) 2015, SerGIS Project Contributors. All rights reserved.
    Use of this source code is governed by the MIT License, which can be found
    in the LICENSE.txt file.
 */

// This file holds configuration information for sergis-server.

// node modules
var path = require("path");

/**
 * Arguments passed via the command line (argv).
 */
var args = {};
(function () {
    var arg, name, value;
    for (var i = 2; i < process.argv.length; i++) {
        arg = process.argv[i];
        if (arg.indexOf("=") != -1) {
            name = arg.substring(0, arg.indexOf("="));
            value = arg.substring(arg.indexOf("=") + 1);
        } else {
            name = arg;
            value = true;
        }
        args[name] = value;
    }
})();


/**
 * Information about command-line arguments that can be passed to server.js.
 * @type Array.<Array.<String>>
 */
var argdata = [
    ["start-http-server", "Start the HTTP server."],
    ["start-socket-server", "Start the socket server."],
    ["http-server-origin=http://hostname:post", "Origin for the HTTP server (if separate from the socket server)"],
    ["socket-server-origin=http://hostname:port", "Origin for the socket server (if separate from the HTTP server)"],
    ["http-server-prefix=/path/prefix/by/server", "Prefix to the path added by a forwarding server"]
];


/**
 * SerGIS Server configuration.
 */
var config = module.exports = {
    /** Default server port */
    PORT: process.env.PORT || 3000,
    
    /** MongoDB server */
    MONGO_SERVER: "mongodb://localhost:27017/sergis-server",
    
    // ARGUMENT-OVERRIDDEN CONFIG
    
    /** Whether to start the HTTP server */
    ENABLE_HTTP_SERVER: !!args["start-http-server"],
    
    /** Whether to start the WebSockets (socket.io) server */
    ENABLE_SOCKET_SERVER: !!args["start-socket-server"],
    
    /** Origin for the HTTP server (only set if running separately as the socket.io server) */
    HTTP_ORIGIN: args["http-server-origin"] || "",
    
    /** Origin for the socket.io server (set to empty string if same as http server) */
    SOCKET_ORIGIN: args["socket-server-origin"] || "",
    
    /** The prefix to the path (i.e. if someone is serving us at /my-web-game/..., this would be "/my-web-game") */
    HTTP_PREFIX: args["http-server-prefix"] || "",
    
    /** Templates directory */
    TEMPLATES_DIR: path.join(__dirname, "templates"),
    
    /** Web resources directory (mapped to http://this-nodejs-server/lib/...) */
    RESOURCES_DIR: path.join(__dirname, "sergis-client", "lib"),
    
    /** Path to the index.html file for sergis-client */
    GAME_INDEX: path.join(__dirname, "sergis-client", "index.html"),

    /** Username regex */
    USERNAME_REGEX: /^[A-Za-z0-9~$"':;,.-_]+/,

    /** Username in URL regex (i.e. "/" + USERNAME_REGEX + "/"?) */
    USERNAME_URL_REGEX: /^\/([A-Za-z0-9~$"':;,.-_]*)\/?/,
    
    /** Information about command-line arguments that can be passed to server.js */
    argdata: argdata
};
