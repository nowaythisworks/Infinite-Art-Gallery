// basic express server
var express = require('express');
var app = express();
var cors = require('cors');

app.use(cors({
    origin: true
}));

var fs = require('fs');
const https = require('https');
const http = require('http');

// serve anything in the static folder
app.use(express.static("."));

console.log('Server Running');

// Listen both http and https
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
    key: fs.readFileSync('privkey.pem'),
    cert: fs.readFileSync('fullchain.pem')
}, app);

httpServer.listen(80);
httpsServer.listen(443);

// image server for art gallery

const request = require('request');

let Jimp = require('jimp')

const urls = [
    "https://www.reddit.com/r/Art/random.json",
    "https://www.reddit.com/r/drawing/random.json",
    "https://www.reddit.com/r/ImaginaryLandscapes/random.json",
    "https://www.reddit.com/r/Watercolor/random.json",
    "https://www.reddit.com/r/painting/random.json",
    "https://www.reddit.com/r/sketches/random.json",
    "https://www.reddit.com/r/doodles/random.json"
]

var options = {
    url: urls[Math.floor(Math.random() * urls.length)] + '?obey_over18=true',
    headers: {
        'User-Agent': 'MY IPHONE 7s'
    }
};


// mobile request
app.get('/random-image', (req, res) => {
    console.log("Received Request");
    // res.setHeader("Content-Security-Policy", "img-src 'self' data:; default-src 'self' *");

    request(options, function (error, response, body) {
        // if response.body contains the text "Bad Request", return error
        if (response.body.includes("Bad Request")) {
            // send the error.png file in the local directory
            res.sendFile(__dirname + '/error.png');
        }
        else
        {
            let data = JSON.parse(response.body);
            const url = data[0].data.children[0].data.url;
            const metadata = data[0].data.children[0].data.title + " by " + data[0].data.children[0].data.author;
    
            request({
                url: url,
                encoding: null
            },
            (err, resp, buffer) => {
                if (!err && resp.statusCode === 200) {
                    // add the metadata onto the image as a watermark
                    Jimp.read(buffer, (err, image) => {
                        if (err) throw err;
                        Jimp.loadFont(Jimp.FONT_SANS_64_WHITE).then(font => {
                            image.print(font, 0, 0, metadata, image.bitmap.width);
                            // send back to client as .png file
                            image.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
                                res.writeHead(200, {
                                    'Content-Type': 'image/png',
                                    'Content-Length': buffer.length
                                });
                                res.end(buffer);
                            });
                        });
                    });
                }
            });
        }
    });
})

// pc/desktop metadata
app.get('/random-image-identify', (req, res) => {
    
    request(options, function (error, response, body) {
        // if response.body contains the text "Bad Request", return error
        if (response.body.includes("Bad Request")) {
            // send the error.png file in the local directory
            res.sendFile(__dirname + '/error.png');
        }
        else
        {
            let data = JSON.parse(response.body);
            const url = data[0].data.children[0].data.url;
            const metadata = data[0].data.children[0].data.title + " by " + data[0].data.children[0].data.author;
    
            res.send(metadata + "|||||" + url);
        }
    });
});

// pc/desktop image
app.get('/get-image-direct', (req, res) => {
    // returns the image only, as a buffer, based on the ID provided via params
    console.log("Received Request");
    // get the param url
    const passedUrl = req.query.url;
    if (!passedUrl) {
        res.send("No URL Provided");
    } else {
        request(options, function (error, response, body) {
            // if response.body contains the text "Bad Request", return error
            if (response.body.includes("Bad Request")) {
                // send the error.png file in the local directory
                res.sendFile(__dirname + '/error.png');
            }
            else
            {
                request({
                    url: passedUrl,
                    encoding: null
                },
                (err, resp, buffer) => {
                    if (!err && resp.statusCode === 200) {
                        res.writeHead(200, {
                            'Content-Type': 'image/png',
                            'Content-Length': buffer.length
                        });
                        res.end(buffer);
                    }
                });
            }
        });
    }
})
