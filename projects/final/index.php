<?php
  session_start();
  session_destroy();
 ?>
<html>
  <head>
    <script src="js/jquery-3.3.1.min.js"></script>
    <script src="js/main.js"></script>
    <style>
      body {
        text-align: center;
      }
      canvas {
        width: 640px;
        height: 640px;
        margin: auto;
      }
      #images {
        display: none;
      }
    </style>
  </head>
  <body>
    <canvas height="320" width="320" id="canvas"></canvas>
    <section id="images">
      <img src="images/bird.png" alt="">
      <img src="images/birdprint.png" alt="">
      <img src="images/footprint.png" alt="">
      <img src="images/reigndeer.png" alt="">
      <img src="images/gingerbread.png" alt="">
      <img src="images/ornament.png" alt="">
      <img src="images/snowman.png" alt="">
      <img src="images/gift.png" alt="">
      <img src="images/wall.png" alt="">
      <img src="images/cobblestone.png" alt="">
    </section>
  </body>
</html>
