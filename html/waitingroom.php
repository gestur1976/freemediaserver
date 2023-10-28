<?php
require_once(__DIR__ . '/header.html');
parse_str($_SERVER['QUERY_STRING'], $queryParameters);
?>
<link rel="stylesheet" href="/waitingroom.css">
</head>
<body>
    <div class="title"<?php echo isset($queryParameters["type"])?' type="'.$queryParameters["type"].'"':'' ?><?php echo isset($queryParameters["id"])?' id="'.$queryParameters["id"].'"':''?><?php echo isset($queryParameters["text"])?' text="'.$queryParameters["text"].'"':'' ?>><?php echo $queryParameters["filename"]?></div>
    <div class="progress-text" filename="<?php echo $queryParameters["filename"]?>"></div>
        <div class="progress-bar">
        <div class="bar"></div>
    </div>
    <script src="/downloadprogress.js" async defer></script>
<?php
require_once(__DIR__ . '/footer.html');
?>

