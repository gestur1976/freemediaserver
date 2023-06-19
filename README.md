# freemusicserver-cuda

## (This project is currently under development. Please do not clone it as it is not yet functional.)

https://hub.docker.com/r/gestur1976/freemusicserver-cuda

This is a music web server. Simply search for a song and within seconds, you can listen to it, watch it, or download it. It's that easy!

This project is a fork of gestur1976/free-music-web-server. This version utilizes the CUDA-accelerated version of ffmpeg and will support automatic subtitles using [Softcatala/whisper-ctranslate2](https://github.com/Softcatala/whisper-ctranslate2). This tool uses CTranslate2 and Faster-whisper, an OpenAI Whisper fork that is up to 4 times faster than openai/whisper, achieving the same accuracy while using less memory.

The project uses a [NVIDIA-CUDA Ubuntu](https://hub.docker.com/layers/nvidia/cuda/11.6.2-runtime-ubuntu20.04) based image with apache2, php8.0-fpm, node.js, and yt-dlp.

Upon launch, it starts a web server where you can search for a song (or anything else). It then downloads it from YouTube using yt-dlp, converts it to the required format using ffmpeg, and starts autoplaying within seconds.

You can either get the audio part of the video (.mp3) or the video itself (.webm or .mp4). Both are downloadable from the media player control menu.

To get it, use the following command:

```shell
docker run -d --name freemusicserver-cuda -p [local-port]:80 -v [local-htdocs-folder]:/var/www gestur1976/freemusicserver-cuda:latest
```
The -v option isn't mandatory, but as media files are downloaded into the htdocs folder, the container can become large. Therefore, it's recommended to map it to a local folder.

For example, to run it on port 7997 and use /var/www/freemusicserver as local storage, use the following commands:

```shell
mkdir -p /var/www/freemusicserver
docker run -d --name freemusicserver-cuda -p 7997:80 -v /var/www/freemusicserver:/var/www gestur1976/freemusicserver-cuda:latest
```

Then, point your browser to http://localhost:7997/ and enjoy.

To build the container yourself, clone the repository and run ./build.sh inside the folder.

Many thanks to [Ondřej Surý](https://github.com/oerdnj) for the apache and php repositories, the [yt-dlp](https://github.com/yt-dlp) team, and the [ffmpeg](https://ffmpeg.org/) team.