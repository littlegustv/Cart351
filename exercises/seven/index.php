<?php
  session_start();
  $_SESSION['Name'] = $_POST['Name'];
 ?>
<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>HELLO, <?php echo $_SESSION['Name']; ?></title>
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
        background: <?php echo $_POST['Color']; ?>;
        color: white;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <form class="" action="" method="post">
      <label for="">
        What is your name?
        <input type="text" name="Name" value="<?php echo $_POST['Name']; ?>">
      </label>
      <select class="" name="Multiselect[]">
        <option value="Robespierre">Robespierre</option>
        <option value="Danton">Danton</option>
        <option value="Desmoulins">Desmoulins</option>
      </select>
      <input type="color" name="Color" value="<?php echo $_POST['Color']; ?>">
      <input type="date" name="Date" value="<?php echo $_POST['Date']; ?>">
      <input type="submit" name="" value="Go!">
    </form>
    <h1>
     <?php echo $_POST['Date']; ?>
    </h1>
    <p>
      <?php var_dump($_POST['Multiselect']); ?>
    </p>
  </body>
</html>
