console.clear();

var lastprogress = '0%';
var lasteta = '';
var retries = 0;
var percent = 0;
const fileprefix = '/' + document.querySelector('div.progress-text').getAttribute('filename');
const logfile = fileprefix + '.log';
const errorfile = fileprefix + '.err';

function setProgress(progress, eta, ffmpeg) {
    if (ffmpeg) {
        retries = 0;
        (document.querySelector(".progress-text") || []).innerText = '100% - Converting format...';

        //lastprogress = progress;
        //percentmatch = ffmpeg ? 100 : /^[ ]*[0-9]+/g.exec(progress);
        //percent = percentmatch.length ? parseInt(percentmatch[0]) : 0;
        percent = 100;

    } else {
        console.log("Progress: " + progress);
        console.log("LastProgress: " + lastprogress);
        if (!progress.localeCompare(lastprogress)) {
            retries++;
            console.log("Retry: " + retries);
            if (retries >= 10) {
                document.querySelector(".progress-text").innerText = "Download error! Restarting...";
                document.querySelector(".progress-text").setAttribute('style', 'color: tomato');
                const text = document.querySelector('div.title').getAttribute('text');
                const type = document.querySelector('div.title').getAttribute('type');
                const id = document.querySelector('div.title').getAttribute('id');
                const params = new URLSearchParams('text=' + text + '&id=' + id + (type ? '&type=' + type : '') + '&restart=1');
                window.location.replace('/mediaserver/download?' + params.toString());
                window.clearInterval(timer);
            }
        } else {
            retries = 0;
            lastprogress = progress;
            if (ffmpeg) {
                percent = 100;
            } else {
                percentmatch = /^[0-9]+/g.exec(progress) || [];
                if (percentmatch.length) {
                    percent = percentmatch[0];
                }
            }
        }
        //tiemporestante = ffmpeg ? 'Converting format...' : /[0-9\:]+[ ]*$/.exec(progress);
        if (percent) {
            const rojo = (100 - percent) * 256 / 100;
            const verde = 256 - rojo;
            const azul = rojo / 2;
            document.querySelector('div.bar').setAttribute('style', `width: ${percent}%; background-color: rgb(${rojo}, ${verde}, ${azul})`);

            if (eta) {
                document.querySelector(".progress-text").innerText = (`${percent} % - ${eta}`);
            }
        }
    }
}

async function fetchLog() {

    let response = null;
    try {
        response = await fetch(logfile);
    } catch (error) {
        location.reload();
    }

    if (response && response.status == 200) {
        let contenido = await response.text();
        let progress = '';
        let eta = '';
        const data = /[^\r^\n]+$/g.exec(contenido) || [];
        const ffmpeg = !!/ffmpeg|merging/gi.exec(data) || [];
        const downloadprogressmatch = (/.download.*$/gi.exec(data) || []);
        if (downloadprogressmatch.length) {
            downloadprogress = downloadprogressmatch[0];
            progressmatch = /[0-9]+(\.[0-9]+)?[%]/g.exec(downloadprogress) || [];
            progress = progressmatch.length ? progressmatch[0] : lastprogress;
            etamatch = /ETA[ ]*[0-9]+(\:[0-9]+)+/g.exec(downloadprogress) || [];
            eta = etamatch.length ? etamatch[0] : 'ETA (estimating)';
        }
        if (progress) {
            setProgress(progress, eta, ffmpeg.length);
        }
    } else {
        const text = document.querySelector('div.title').getAttribute('text');
        const type = document.querySelector('div.title').getAttribute('type');
        const id = document.querySelector('div.title').getAttribute('id');
        var parameters = 'text=' + text;
        var params;
        if (type) {
            parameters = parameters + '&type=' + type;
        }
        if (id) {
            parameters = parameters + '&id=' + id;
        }
        params = new URLSearchParams(parameters);
        window.location.replace('/mediaserver/download?' + params.toString());
        window.clearInterval(timer);
    }
}
const timer = setInterval(function() {
    fetchLog();
}, 2000);
