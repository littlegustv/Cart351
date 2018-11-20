<!--

brainstorming:

goal?
 - find key? (get out!)
 - find items? (scavenger hunt)
 -

events:
 - bird (shy)
 - tree (needs space)
 - ice (breaks on repeated use)
 - gifts (only one can have it!)
 - christmas ornaments (can be stepped on ?)
 - christmas lights
 - snowman
 - music/performance (depends on audience?)

-->
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
    </style>
  </head>
  <body>
    <canvas height="640" width="640" id="canvas"></canvas>
  </body>
</html>
