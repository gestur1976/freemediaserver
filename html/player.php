<?php
require_once(__DIR__ . '/header.html');
parse_str($_SERVER['QUERY_STRING'], $parameters);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <style>
        body {
            background-color: black;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        video {
            max-width: 100%;
            max-height: 100%;
        }
    </style>
</head>
<body>
    <?php
    $file=isset($parameters["filename"]) ? $parameters['filename'] : '';
    $parts=explode('.', $file);
    $nparts=sizeof($parts);
    if ( $nparts > 0 )  {
        unset($parts[$nparts - 1]);
        $fileWithoutExtension=implode('.', $parts);
    }
    else {
        $fileWithoutExtension=$file;
    }
    //$subtitle = preg_replace('/\.[^.]+$/', '', $file).'.vtt'; // replace with your subtitle
    //$subtitle = preg_replace('/\.[^.]+$/', '', $file).'.vtt'; // replace with your subtitle file path

    echo '<video controls crossorigin="anonymous">
        <source src="' . $file . '" type="video/mp4">';
        if ( file_exists ($fileWithoutExtension.'.vtt') ) {
            echo '<track kind="captions" src="'.$fileWithoutExtension.'.vtt" srclang="en" label="Transcription" default>
            <track label="Transcription" kind="subtitles" srclang="en" src="'.$fileWithoutExtension.'.vtt" default>';
            if ( file_exists ($fileWithoutExtension.'.en.vtt') ) {
                echo '<track kind="subtitles" src="'.$fileWithoutExtension.'.en.vtt" srclang="en" label="English (translated)" default>
                <track label="English (translated)" kind="subtitles" srclang="en" src="'.$fileWithoutExtension.'.en.vtt" default>';
            }
        }
        echo 'Your browser does not support the video tag.
    </video>';
    ?>
</body>
</html>