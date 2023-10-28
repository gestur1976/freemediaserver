const http = require('http')
const url = require('url')
const yt = require('youtube-search-without-api-key')
const { spawn } = require('node:child_process')
const fs = require('fs')
const os = require('os')
var sanitize = require('sanitize-filename')

// Set to true to get debug messages through the console
const DEBUG = true

// Set the path to the html directory and the path to the media server
const htmlPath = '/var/www/html'
const mediaServerPath = '/usr/local/mediaserver'

const urlPrefix = ''

// Get the number of CPU cores available to use with whisper-ctranslate2
const numCpuCores = os.cpus().length

// Search for videos on Youtube and return the results

async function youtubeSearch(queryObject, res, req, action) {
    var paramsYoutubeDL = []
    const searchText = queryObject.text
    const id = queryObject.id
    const restart = queryObject.restart
    const type = queryObject.type ? queryObject.type : 'audio'
    var format
    var outputFormat

    DEBUG && console.log(queryObject)

    const searchResults = await yt.search(searchText)

    if (DEBUG) {
        console.log(`Search text: ${searchText}`)
        console.log(searchResults)
    }

    if (action === 'search') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify(searchResults))
        res.end()
        return
    }

    const videos = searchResults.filter(video => video.id.videoId === id)

    if (videos.length) {
        DEBUG && console.log(videos[0])

        const title = videos[0].title
        const url_yt = videos[0].url
        const filename = sanitize(title).replace(/['\(\)\[\]\&#]/g, '')
        const uri = encodeURI(filename)
        const fullPath = htmlPath + '/' + filename
        let outputFormat = queryObject.output_format
            ? queryObject.output_format
            : 'webm'
        const format =
            'bestvideo[width<=1920][ext=' +
            outputFormat +
            ']+bestaudio[ext=' +
            outputFormat +
            ']/best[width<=1920][ext=' +
            outputFormat +
            ']/best'

        let paramsYoutubeDL

        DEBUG && console.log('outputFormat: ' + outputFormat)

        if (queryObject.type === 'audio') {
            paramsYoutubeDL = [
                '-x',
                '--audio-format',
                'mp3'
            ]
        } else {
            paramsYoutubeDL = [
                '-f',
                format,
                '--merge-output-format',
                outputFormat,
                '--prefer-ffmpeg'
            ]
        }
        
        const parameters = new URLSearchParams(
            'filename=' + uri + '&type=' + type + '&text=' + searchText + '&id=' + id
        )

        if (restart) {
            ;['.log', '.err', '.webm', '.mp4', '.mp3'].forEach(extension => {
                const filePath = fullPath + extension
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            })
        }

        if (fs.existsSync(fullPath + '.log')) {
            res.writeHead(302, {
                Location: urlPrefix + '/waitingroom.php?' + parameters
            })
            res.end()
            return
        }

        if (!type.localeCompare('video')) {
            if (fs.existsSync(fullPath + '.mp4')) {
                outputFormat = 'mp4'
                if (fs.existsSync(fullPath + '.webm')) {
                    fs.unlinkSync(fullPath + '.webm')
                }
                res.writeHead(302, {
                    Location: urlPrefix + '/player.php?filename=' + uri + '.mp4'
                })
                res.end()
                return
            } else {
                if (fs.existsSync(fullPath + '.webm')) {
                    res.writeHead(302, {
                        Location: urlPrefix + '/player.php?filename=' + uri + '.webm'
                    })
                    res.end()
                    return
                }
            }
        } else {
            if (fs.existsSync(fullPath + '.mp3')) {
                res.writeHead(302, {
                    Location: urlPrefix + '/' + uri + '.mp3'
                })
                res.end()
                return
            }
        }

        fs.appendFileSync(fullPath + '.log', '[download] 0% ETA 99:99')

        paramsYoutubeDL.push(
            '--socket-timeout',
            '10',
            '--retries',
            'infinite',
            '--output',
            fullPath + '.%(ext)s',
            url_yt
        )

        if (DEBUG) {
            console.log('youtube-dl')
            console.log(paramsYoutubeDL)
        }

        const youtube_dl = spawn(mediaServerPath + '/youtube-dl', paramsYoutubeDL, {
            detached: true,
            stdio: ['pipe', 'pipe', 'pipe']
        })

        youtube_dl.stdout.on('data', function (chunk) {
            if (chunk) fs.appendFileSync(fullPath + '.log', chunk)
        })

        youtube_dl.stderr.on('data', function (chunk) {
            if (chunk) fs.appendFileSync(fullPath + '.err', chunk)
        })

        youtube_dl.on('close', function (code, signal) {
            if (fs.existsSync(fullPath + '.log')) fs.unlinkSync(fullPath + '.log')
            if (
                !fs.existsSync(mediaServerPath + 'transcription/' + filename + '.vtt')
            ) {
                if (fs.existsSync(fullPath + '.webm')) {
                    const whisper_ctranslate2 = spawn(
                        '/usr/local/bin/whisper-ctranslate2',
                        [
                            '--model',
                            'small',
                            '--task',
                            'transcribe',
                            fullPath + '.webm',
                            '--output_format',
                            'vtt',
                            '--vad_filter',
                            'True',
                            '--output_dir',
                            htmlPath + '/transcription/',
                            '--compute_type',
                            'int8',
                            '--threads',
                            numCpuCores
                        ],
                        { detached: true, stdio: ['pipe', 'pipe', 'pipe'] }
                    )
                } else if (fs.existsSync(fullPath + '.mp4')) {
                    const whisper_ctranslate2 = spawn(
                        '/usr/local/bin/whisper-ctranslate2',
                        [
                            '--model',
                            'small',
                            '--task',
                            'transcribe',
                            fullPath + '.mp4',
                            '--output_format',
                            'vtt',
                            '--vad_filter',
                            'True',
                            '--output_dir',
                            htmlPath + '/transcription/',
                            '--compute_type',
                            'int8',
                            '--threads',
                            numCpuCores
                        ],
                        { detached: true, stdio: ['pipe', 'pipe', 'pipe'] }
                    )
                }
            }
        })

        res.writeHead(302, {
            Location: urlPrefix + '/waitingroom.php?' + parameters
        })
        res.end()
    }
}

// Create an HTTP server to serve the requests

http
    .createServer(function (req, res) {
        const reqURL = url.parse(req.url, true)
        const action = /[^/]+/.exec(reqURL.pathname).toString()
        const queryObject = url.parse(reqURL, true).query

        DEBUG && console.log('Available CPU Cores:' + numCpuCores)
        DEBUG && console.log('Request URL: ' + reqURL)
        DEBUG && console.log('Action: ' + action)

        if (queryObject.text) {
            youtubeSearch(queryObject, res, req, action)
        } else {
            res.end()
        }
    })
    .listen(7997, '0.0.0.0')
