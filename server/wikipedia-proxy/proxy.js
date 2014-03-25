/*
 * Copyright (C) 2014 Jasper Zonneveld
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Module dependencies.
 */
 
var http = require('http')
, request = require('request')
, url = require('url')
, fs = require('fs');

var sBaseUrl = "http://linkedtv.project.cwi.nl/wikiproxy/";

http.createServer(function(req, res) {
    var url_parts = url.parse(req.url, true);
    var sBase = decodeURIComponent(url_parts.query.base);

    request({uri: 'http://nl.m.wikipedia.org'+url_parts.pathname}, function(err, response, body){
        //Just a basic error check
        if(err && response.statusCode !== 200){console.log('Request error.');}

        // Add base-url
        body = body.replace("<head>","<head>\n<base href=\""+sBaseUrl+"\">");

        // Remove first slash from all links so the base url is used
        body = body.replace(/href="\/w/g, "href=\"w");

        if (url_parts.query.base) {
            // Add base param to urls
            body = body.replace(/href="wiki\/(.*?)"/g, "href=\"wiki/$1?base="+encodeURIComponent(url_parts.query.base)+"\"");

            // Inject styles and scripts from include file
            fs.readFile('include.html', 'utf8', function(err, data) {
                if (err) throw err;
                // Insert base-url
                data = data.replace(/\[sBase\]/g, sBase);
                // Append to head
                body = body.replace("</head>","\n"+data+"\n</head>");

                res.writeHeader(200, {"Content-Type": "text/html"});
                res.write(body);
                res.end();
            });
        } else {
            res.writeHeader(200, {"Content-Type": "text/html"});
            res.write(body);
            res.end();
        }
    });
}).listen(6634);

