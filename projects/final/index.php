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
      main {
        max-width: 640px;
        margin: auto;
        text-align: left;
      }
    </style>
  </head>
  <body>
    <canvas height="320" width="320" id="canvas"></canvas>
    <main>
      <h4>instructions</h4>
      <p>use LEFT and RIGHT arrow keys to turn.  collect all the items on your list, but be careful about the impact you have</p>
    </main>
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
