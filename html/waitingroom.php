<?php
require_once(__DIR__ . '/header.html');
parse_str($_SERVER['QUERY_STRING'], $parameters);
?>
<style>
    <?php require_once(__DIR__ . '/waitingroom.css');?>
</style>
</head>
<body>
    <div class="title"<?php echo isset($parameters["type"])?' type="'.$parameters["type"].'"':'' ?><?php echo isset($parameters["id"])?' id="'.$parameters["id"].'"':''?><?php echo isset($parameters["text"])?' text="'.$parameters["text"].'"':'' ?>><?php echo $parameters["filename"]?></div>
    <div class="progress-text" filename="<?php echo $parameters["filename"]?>"></div>
        <div class="progress-bar">
        <div class="bar"></div>
    </div>
    <script src="/downloadprogress.js" async defer></script>
<?php
require_once(__DIR__ . '/footer.html');