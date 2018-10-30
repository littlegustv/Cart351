<?php
if($_SERVER['REQUEST_METHOD'] == 'POST') {

  $data = new stdClass();
  $data->name = $_POST['Name'];
  $data->multiselect = $_POST['Multiselect'];
  $data->color = $_POST['Color'];
  $data->date = $_POST['Date'];

  $filename = $_FILES['Filename']['name'];
  move_uploaded_file($_FILES['Filename']['tmp_name'], 'images/' . $filename);

  $data->image = 'images/' . $filename;

  $json = json_encode($data);
  echo $json;
  exit;

}

 ?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
    <style media="screen">
      * {
        margin: 0;
        padding: 0;
      }
      html, body {
        height: 100%;
        width: 100%;
      }
      body {
        color: white;
        text-align: center;
      }
    </style>
    <script type="text/javascript" src="js/jquery.js"></script>
    <script type="text/javascript">
      $(document).ready(function (e) {
        $("#myForm").submit(function (e) {
          e.preventDefault();
          let form = $('#myForm')[0];
          let data = new FormData(form);

          $.ajax({
            type: "POST",
            enctype: "multipart/form-data",
            url: "index.php",
            data: data,
            processData: false,
            contentType: false,
            cache: false,
            timeout: 600000,
            success: function (response) {
              //console.log(response);
              let data = JSON.parse(response);
              let container = $('<div>');
              for (key in data) {
                if (key == "color") {
                  $('body').css('background', data[key]);
                } else if (key == "image") {
                  let row = $('<img>');
                  row.attr("src", data[key]);
                  container.append(row);
                } else {
                  let row = $('<p>');
                  row.text(key + ": " + data[key]);
                  container.append(row);
                }
              }
              $('body').append(container);
              console.log(data);
            },
            error: function () {
              console.log("error occurred");
            }
          })
        });
      });
    </script>
  </head>
  <body>
    <form id="myForm" class="" action="" method="post" enctype="multipart/form-data">
      <label for="">
        What is your name?
        <input type="text" name="Name" value="">
      </label>
      <select class="" name="Multiselect[]">
        <option value="Robespierre">Robespierre</option>
        <option value="Danton">Danton</option>
        <option value="Desmoulins">Desmoulins</option>
      </select>
      <input type="color" name="Color" value="">
      <input type="date" name="Date" value="">
      <input type="file" name="Filename" value="" size=10 required>
      <input type="submit" name="" value="Go!">
    </form>
  </body>
</html>
