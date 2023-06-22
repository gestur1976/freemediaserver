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
    //$subtitle = preg_replace('/\.[^.]+$/', '', $file).'.vtt'; // replace with your subtitle file path

    echo '<video controls crossorigin="anonymous">
        <source src="' . $file . '" type="video/mp4">
        <track label="English" kind="subtitles" srclang="en" src="'.$file.'.vtt" default>
        Your browser does not support the video tag.
    </video>';
    ?>
</body>
</html>