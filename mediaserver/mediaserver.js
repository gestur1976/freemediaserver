const http = require("http");
const url = require('url');
const yt = require('youtube-search-without-api-key');
const { spawn } = require('node:child_process');
const {appendFileSync, existsSync, unlinkSync} = require('fs');
var sanitize = require("sanitize-filename");
const { fstat } = require("fs");
const path = '/var/www/html'
const mediaserverpath = '/usr/local/mediaserver'
const urlPrefix = '';

async function youtubeSearch(queryObject, res, req, action) {
    console.log(queryObject);
    var params_youtube_dl = [];
    const text = queryObject.text;
    const id = queryObject.id;
    const restart = queryObject.restart;
    const type = queryObject.type ? queryObject.type : 'audio';
    var format;
    var outputFormat;

    if (action === 'search') {
        const search_results = await (await yt.search(text));
        console.log('Text: ' + text);
        console.log(search_results);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(search_results));
        res.end();
        return;
    }

    const search_results = await (await yt.search(text));
    const videos = search_results.map(video => video).filter(video => video["id"]["videoId"] === id);

    if (videos.length) {
        const title = videos[0].title;
        const url_yt = videos[0].url;
        const filename = sanitize(title).replace(/['\(\)\[\]\&#]/g, "");
        const uri = encodeURI(filename);
        const fullpath = path + '/' + filename;
        let outputFormat = queryObject.output_format ? queryObject.output_format : 'webm';
        let format = 'bestvideo[width<=1920][ext=' + outputFormat + ']+bestaudio[ext=' + outputFormat + ']/best[width<=1920][ext=' + outputFormat + ']/best'
        params_youtube_dl = ['-f', format, '--merge-output-format', outputFormat, '--prefer-ffmpeg'];
        const parameters = new URLSearchParams('filename=' + uri + '&type=' + type + '&text=' + text + '&id=' + id);

        if (restart) {
            if (existsSync(fullpath + '.log'))
                unlinkSync(fullpath + '.log');
            if (existsSync(fullpath + '.err'))
                unlinkSync(fullpath + '.err');
            if (existsSync(fullpath + '.webm'))
                unlinkSync(fullpath + '.webm');
            if (existsSync(fullpath + '.mp4'))
                unlinkSync(fullpath + '.mp4');
            if (existsSync(fullpath + '.mp3'))
                unlinkSync(fullpath + '.mp3');
        }

        if (existsSync(fullpath + '.log')) {
            res.writeHead(302, {
                'Location': urlPrefix + '/waitingroom.php?' + parameters
            });
            res.end();
            return;
        }

        if (type === 'video') {
            if (existsSync(fullpath + '.mp4')) {
                if (existsSync(fullpath + '.webm')) {
                    unlinkSync(fullpath + '.webm')
                }
                res.writeHead(302, {
                    'Location': urlPrefix + '/player.php?filename=' + uri + '.mp4'
                });
                res.end();
                return;
            } else {
                if (existsSync(fullpath + '.webm')) {
                    res.writeHead(302, {
                        'Location': urlPrefix + '/player.php?filename=' + uri + '.webm'
                    });
                    res.end();
                    return
                }
            }
        } else {
            if (existsSync(fullpath + '.mp3')) {
                res.writeHead(302, {
                    'Location': urlPrefix + '/' + uri + '.mp3'
                });
                res.end();
                return;
            }
        }

        appendFileSync(fullpath + '.log', '[download] 0% ETA 99:99');
        params_youtube_dl.push('--socket-timeout', '10', '--retries', 'infinite', '--output', (fullpath + '.%(ext)s'), url_yt);

        const youtube_dl = spawn(mediaserverpath + "/youtube-dl", params_youtube_dl, { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });

        youtube_dl.stdout.on('data', function(chunk) {
            if (chunk) appendFileSync(fullpath + '.log', chunk);
        });

        youtube_dl.stderr.on('data', function(chunk) {
            if (chunk) appendFileSync(fullpath + '.err', chunk);
        });

        youtube_dl.on('close', function(code, signal) {
            if (existsSync(fullpath + '.log')) unlinkSync(fullpath + '.log');
            if (!existsSync(path + 'transcription/' + filename + '.vtt')) {
                if (existsSync(fullpath + '.webm')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--task', 'transcribe', fullpath + '.webm', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir', path + '/transcription/', '--compute_type', 'int8'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
                else if (existsSync(fullpath + '.mp4')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--task', 'transcribe', fullpath + '.mp4', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir', path + '/transcription/', '--compute_type', 'int8'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
            }
            if (!existsSync(path + 'translation/' + filename + '.vtt')) {
                if (existsSync(fullpath + '.webm')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--task', 'translate', fullpath + '.webm', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir', path + '/translation/', '--compute_type', 'int8'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
                else if (existsSync(fullpath + '.mp4')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--task', 'translate', fullpath + '.mp4', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir',  path + '/translation/', '--compute_type', 'int8'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
            }
        });

        res.writeHead(302, {
            'Location': urlPrefix + '/waitingroom.php?' + parameters
        });
        res.end();
    }
}

http.createServer(function(req, res) {
    const request_url = url.parse(req.url, true);
    console.log('Request URL: ' + request_url);
    const action = /[^/]+/.exec(request_url.pathname).toString();
    console.log('Action: ' + action);
    const queryObject = url.parse(request_url, true).query;

    if (queryObject.text) {
        youtubeSearch(queryObject, res, req, action);
    } else {
        res.end();
    }

}).listen(7997, "0.0.0.0");