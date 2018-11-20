<?php
//check if there has been something posted to the server to be processed
if($_SERVER['REQUEST_METHOD'] == 'POST')
{
    $sampleDataAsIfInAFile = array("smarties","twix","snickers","maltesers","flake","wunderbar","mars");
    $sampleDataAsIfInAFile2 = array("oranges","apples","peppers","carrots","grapes","grapefruits","kumquats");
// need to process -> we could save this data ...
 $xPos = $_POST['xpos'];
 $yPos = $_POST['ypos'];
 $color = $_POST['color'];
 $action = $_POST['action'];
 $id = $_POST['id'];
 //do some silly processing:
 $newPos = $xPos+$yPos;
 //lets choose a word from our "data file" based on the sum of the x and y pos...
 //there are 2 possible actions choose the word depending on action...
 if($action =="theCanvas"){
    $data = new stdClass();
    $data->target = new stdClass();
    $data->target->x = $xPos;
    $data->target->y = $yPos;
    $data->id = $id;
    $data->mode = "focus";
  }
  else{
    $data =  new stdClass();
    $data->mode = "unify";
    $data->id = $id;
    $data->color = $color;
  }

    //package the data and echo back...
    // $myPackagedData=new stdClass();
    // $myPackagedData->word = $dataToSend;
     // Now we want to JSON encode these values to send them to $.ajax success.
    $myJSONObj = json_encode($data);
    echo $myJSONObj;
    exit;
}//POST
?>

<!DOCTYPE html>
<html>
<head>
<title>USING JQUERY AND AJAX AND CANVAS </title>
<!-- get JQUERY -->
  <script src = "libs/jquery-3.3.1.min.js"></script>
<style>
body{
  margin:0;
  padding:0;
}
canvas{
  background:black;
  margin:0;
  padding:0;
}
#b{
  background:purple;
  color:white;
  margin:5px;
  text-align: center;
  padding: 5px;
  width:10%;
}
</style>
</head>
<body>
<div id = "b"><p>CLICK BUTTON</p></div>

<canvas id="myCanvas" width=500 height=500></canvas>
<!-- here we put our JQUERY -->
<script>

var init = 0;

class Shape {
  constructor (x, y, color) {
    this.position = {x: x, y: y};
    this.velocity = {x: 10, y: 10};
    init++;
    this.id = init;
    this.color = color;
  }
  draw (ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.position.x - 10, this.position.y - 10, 20, 20);
  }
  update (dt) {
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;
  }
}

class Circle extends Shape {
  draw (ctx) {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 10, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

$(document).ready (function(){
  //declare some global vars ...

  let shapes = [];

  let a = new Shape(10, 10, "blue");
  let b = new Shape(40, 80, "red");
  shapes.push(a);
  shapes.push(b);

  let circle = new Circle(120, 120, "green");
  shapes.push(circle);
  
  // let x =10;
  // let y =10;
  let theWord = "";
  let theWord2 = "";
  //start ani
  goAni();
  // when we click on the canvas somewhere and the collision detection returns true ...

  $('#myCanvas').on("mousedown",function(event){
  //  console.log("mouseover on canvas");
    let clicked = checkCollision(event);
    if( clicked !== false ) {
      let data = new FormData();
      data.append('action', 'theCanvas');
      data.append('xpos', clicked.position.x);
      data.append('ypos', clicked.position.y);
      data.append('id', clicked.id);
      data.append('color', clicked.color);
      sendData(data);
    }
  });
  // if we click on the button other stuff happens ...
    $( "#b" ).click(function( event ) {
      //stop submit the form, we will post it manually. PREVENT THE DEFAULT behaviour ...
      event.preventDefault();
      console.log("button clicked");
      let data = new FormData();
      data.append('action', 'theButton');
      data.append('xpos', circle.position.x);
      data.append('ypos', circle.position.y);
      data.append('color', circle.color);
      data.append('id', circle.id);
      sendData(data);

     });

     function sendData(data){
       $.ajax({
             type: "POST",
             enctype: 'multipart/form-data',
             url: "PHPEx.php",
             data: data,
             processData: false,//prevents from converting into a query string
             contentType: false,
             cache: false,
             timeout: 600000,
             success: function (response) {
             let result = JSON.parse(response);
             console.log(result);
             if(result.mode === "focus"){
                for (let i = 0; i < shapes.length; i++) { 
                  if (shapes[i].id != parseInt(result.id)) {                    
                    let theta = Math.atan2(parseInt(result.target.y) - shapes[i].position.y,  parseInt(result.target.x) - shapes[i].position.x);
                    shapes[i].velocity = {x: Math.cos(theta) * 40, y: Math.sin(theta) * 40};
                    console.log(theta, shapes[i].velocity);
                  }                 
                }
             }
             else if (result.mode == "unify" ) {
                for (let i = 0; i < shapes.length; i++) {
                  if (shapes[i].id != parseInt(result.id)) {
                    shapes[i].color = result.color;
                  } else {
                    shapes[i].color = "pink";
                  }
                }
             }

         },
         error:function(){
           console.log("error occured");
         }
       });
     } //end sendData

    function goAni(){
      let canvas = document.getElementById('myCanvas');
      let canvasContext = canvas.getContext('2d');

      let st = new Date();

      requestAnimationFrame(runAni);

     function runAni(){

      let nt = new Date();
      let dt = (nt - st) / 1000;
      st = nt;

     //need to reset the background :)
     // clear the canvas ...
     canvasContext.clearRect(0, 0, canvas.width, canvas.height);
     
     for (let i = 0; i < shapes.length; i++) {
      shapes[i].update(dt);
     }

     for (let i = 0; i < shapes.length; i++) {
      shapes[i].draw(canvasContext);
     }

     canvasContext.font = "40px Arial";
     canvasContext.fillStyle = "#B533FF";
     canvasContext.fillText(theWord,canvas.width/2 - (theWord.length/2*20),canvas.height/2);


     canvasContext.fillStyle = "#FF9033";
     canvasContext.fillText(theWord2,canvas.width/2 - (theWord2.length/2*20),canvas.height/4);
     requestAnimationFrame(runAni);
   }

  }
  function checkCollision(event){
    let domRect = document.getElementById("myCanvas").getBoundingClientRect();
    for (let i = 0; i < shapes.length; i++) {
      if(shapes[i].position.x>event.clientX-20 && shapes[i].position.x<event.clientX+20 && shapes[i].position.y >(event.clientY-domRect.top)-20 && shapes[i].position.y<((event.clientY-domRect.top)+20))
      {
        return shapes[i];
      }      
    }
    return false;
  }
}); //document ready
</script>
</body>
</html>
