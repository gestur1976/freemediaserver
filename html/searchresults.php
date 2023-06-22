<?php
require_once(__DIR__ . '/header.html');
parse_str($_SERVER['QUERY_STRING'], $parameters);
?>
<style>
    body {
        background-color: #000 !important;
        color: #fff;
    }
    h5.card-title {
        min-height: 5rem;
    }

</style>
</head>
<?php
        $mediaServerUrl=$_SERVER["REQUEST_SCHEME"] . '://' . $_SERVER["SERVER_NAME"] .'/mediaserver';
        $jsonSearchResults=file_get_contents($mediaServerUrl . '/search?'.$_SERVER['QUERY_STRING']);
        $songsArray=json_decode($jsonSearchResults, true);
?>
<body>
    <div class="container mt-5 bg-dark text-light">
        <div class="row row-cols-1 row-cols-sm- row-cols-md-2 row-cols-lg-2 row-cols-xl-3 row-cols-xxl-3">
            <?php
                foreach ($songsArray as $song) {
            ?>
                <div class="col">
                    <div class="card bg-dark mt-4">
                        <img src="<?php echo $song["snippet"]["thumbnails"]["url"] ?>" class="card-img-top" alt="<?php echo $song["title"] ?>">
                        <div class="card-body bg-dark">
                            <h5 class="card-title text-warning"><?php echo $song["title"] ?></h5>
                            <p class="card-text">Length: <?php echo $song["duration_raw"] ?><br>
                            Views: <?php echo $song["views"] ?></p>
                            <a href="<?php echo '/mediaserver/download?id=' . $song["id"]["videoId"] . '&text='.$parameters["text"] . (isset($parameters["type"]) ? '&type='.$parameters["type"] : '') ?>" class="btn btn-warning">Choose</a>
                        </div>
                    </div>
                </div>
            <?php
                }
            ?>
        </div>
    </div>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    <?php
    require_once(__DIR__ . '/footer.html');