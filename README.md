# freemediaserver

https://hub.docker.com/r/gestur1976/freemediaserver

This is a music web server in a Docker container. Simply search for a song and within seconds, you can listen to it, watch it, or download it. It's that easy!

The project uses [ubuntu:focal](https://hub.docker.com/layers/library/ubuntu/focal/images/sha256-554e40b15453c788ec799badf0f1ad05c3e5c735b53f940feb8f27cf2ec570c5?context=explore) as base image with apache2, php8.0-fpm, node.js, yt-dlp and ffmpeg.

Upon launch, it starts a web server where you can search for a song (or anything else). It then downloads it from YouTube using yt-dlp, converts it to the required format using ffmpeg, and starts autoplaying within seconds. It also generates video subtitles using [whisper-ctranslate2](https://github.com/Softcatala/whisper-ctranslate2).

You can either get the audio part of the video (.mp3) or the video itself (.webm or .mp4). Both are downloadable from the media player control menu.

To get it, use the following command:

```shell
docker run -d --name freemediaserver -p [local-port]:80 -v [local-htdocs-folder]:/var/www gestur1976/freemediaserver:latest
```
The -v option isn't mandatory, but as media files are downloaded into the htdocs folder, the container can become large. Therefore, it's recommended to map it to a local folder.

For example, to run it on port 7997 and use /var/www/freemediaserver as local storage, use the following commands:

```shell
mkdir -p /var/www/freemediaserver
docker run -d --name freemediaserver -p 7997:80 -v /var/www/freemediaserver:/var/www gestur1976/freemediaserver:latest
```

Then, point your browser to http://localhost:7997/ and enjoy.

To build the container yourself, clone the repository and run ./build.sh inside the folder.

Many thanks to [Ondřej Surý](https://github.com/oerdnj) for the apache and php repositories, the [yt-dlp](https://github.com/yt-dlp) team, and the [ffmpeg](https://ffmpeg.org/) team.
