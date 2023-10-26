import http from "http";
import url from "url";
import yt from "youtube-search-without-api-key";
import spawn from "child_process";
import fs from "fs";
import sanitize from "sanitize-filename";

const DEBUG = false;

const htmlPath = '/var/www/html'
const mediaServerPath = '/usr/local/mediaserver'
const urlPrefix = '';

async function youtubeSearch(queryObject, res, req, action) {
    var params_youtube_dl = [];
    const searchText = queryObject.text;
    const id = queryObject.id;
    const restart = queryObject.restart;
    const type = queryObject.type ? queryObject.type : 'audio';
    var format;
    var outputFormat;

    DEBUG && console.log(queryObject);

    const searchResults = await yt.search(searchText);
    if (DEBUG) {
        console.log(`Search text: ${searchText}`);
        console.log(searchResults);
    }

    if (action === 'search') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify(searchResults));
        res.end();
        return;
    }

    videos = searchResults.filter(video => video.id.videoId === id);
    if (videos.length) {
        DEBUG && console.log(videos[0]);

        const title = videos[0].title;
        const url_yt = videos[0].url;
        const filename = sanitize(title).replace(/['\(\)\[\]\&#]/g, "");
        const uri = encodeURI(filename);
        const fullpath = htmlPath + '/' + filename;

        format = type.localeCompare('video') ? format = 'bestaudio' : 'bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best';
        outputFormat = queryObject.output_format ? queryObject.output_format : 'webm';
        format = 'bestvideo[width<=1920][ext=' + outputFormat + ']+bestaudio[ext=' + outputFormat + ']/best[width<=1920][ext=' + outputFormat + ']/best'
        params_youtube_dl = ['-f', format, '--merge-output-format', outputFormat, '--prefer-ffmpeg'];
        const parameters = new URLSearchParams('filename=' + uri + '&type=' + type + '&text=' + searchText + '&id=' + id);
        if (restart) {
            if (fs.existsSync(fullpath + '.log'))
                fs.unlinkSync(fullpath + '.log');
            if (fs.existsSync(fullpath + '.err'))
                fs.unlinkSync(fullpath + '.err');
            if (fs.existsSync(fullpath + '.webm'))
                fs.unlinkSync(fullpath + '.webm');
            if (fs.existsSync(fullpath + '.mp4'))
                fs.unlinkSync(fullpath + '.mp4');
            if (fs.existsSync(fullpath + '.mp3'))
                fs.unlinkSync(fullpath + '.mp3');
        }

        if (fs.existsSync(fullpath + '.log')) {
            res.writeHead(302, {
                'Location': urlPrefix + '/waitingroom.php?' + parameters
            });
            res.end();
            return;
        }

        if (!type.localeCompare('video')) {

            if (fs.existsSync(fullpath + '.mp4')) {
                outputFormat = 'mp4';
                if (fs.existsSync(fullpath + '.webm')) {
                    fs.unlinkSync(fullpath + '.webm')
                }
                res.writeHead(302, {
                    'Location': urlPrefix + '/player.php?filename=' + uri + '.mp4'
                });
                res.end();
                return;
            } else {
                if (fs.existsSync(fullpath + '.webm')) {
                    res.writeHead(302, {
                        'Location': urlPrefix + '/player.php?filename=' + uri + '.webm'
                    });
                    res.end();
                    return
                }
            }
        } else {
            if (fs.existsSync(fullpath + '.mp3')) {
                res.writeHead(302, {
                    'Location': urlPrefix + '/' + uri + '.mp3'
                });
                res.end();
                return;
            }
        }

        fs.appendFileSync(fullpath + '.log', '[download] 0% ETA 99:99');

        params_youtube_dl.push('--socket-timeout', '10', '--retries', 'infinite', '--output', (fullpath + '.%(ext)s'), url_yt);
        console.log('youtube-dl');
        console.log(params_youtube_dl);
        const youtube_dl = spawn(mediaServerPath + "/youtube-dl", params_youtube_dl, { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });

        youtube_dl.stdout.on('data', function(chunk) {
            if (chunk) fs.appendFileSync(fullpath + '.log', chunk);
        });
        youtube_dl.stderr.on('data', function(chunk) {
            if (chunk) fs.appendFileSync(fullpath + '.err', chunk);
        });
        youtube_dl.on('close', function(code, signal) {
            if (fs.existsSync(fullpath + '.log')) fs.unlinkSync(fullpath + '.log');
            if (!fs.existsSync(path + 'transcription/' + filename + '.vtt')) {
                if (fs.existsSync(fullpath + '.webm')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--print_colors', 'True', '--task', 'transcribe', fullpath + '.webm', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir', htmlPath + '/transcription/', '--compute_type', 'int8', '--threads', '"$(cat /proc/cpuinfo | grep "processor" | wc -l)"'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
                else if (fs.existsSync(fullpath + '.mp4')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--print_colors', 'True', '--task', 'transcribe', fullpath + '.mp4', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir', htmlPath + '/transcription/', '--compute_type', 'int8', '--threads', '"$(cat /proc/cpuinfo | grep "processor" | wc -l)"'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
            }
            /*
             *   Disabled ATM.
             */
            /*
            if (!fs.existsSync(path + 'translation/' + filename + '.vtt')) {
                if (fs.existsSync(fullpath + '.webm')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--print_colors', 'True', '--task', 'translate', fullpath + '.webm', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir', htmlPath + '/translation/', '--compute_type', 'int8', '--threads', '1'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
                else if (fs.existsSync(fullpath + '.mp4')) {
                    const whisper_ctranslate2 = spawn("/usr/local/bin/whisper-ctranslate2", ['--model', 'small', '--print_colors', 'True', '--task', 'translate', fullpath + '.mp4', '--output_format', 'vtt', '--vad_filter', 'True', '--output_dir',  htmlPath + '/translation/', '--compute_type', 'int8', '--threads', '1'], { detached: true, stdio: ['pipe', 'pipe', 'pipe'] });
                }
            }
            */
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
