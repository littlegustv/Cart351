<?php

session_start();

if (!isset($_SESSION['start_time']))
{
    $str_time = time();
    $_SESSION['start_time'] = $str_time;
}
// echo $_SESSION['start_time'];


// var_dump($_POST["data"]);

class MyDB extends SQLite3
   {
      function __construct()
      {
         $this->open('footprints.db');
      }
   }

try
{
   $db = new MyDB();
   // $query = 'create table footprints (id INTEGER PRIMARY KEY NOT NULL, x INTEGER, y INTEGER, angle INTEGER, step INTEGER, session_time DATETIME )';
   // $result = $db->exec($query);
   // if (!$result) {
   //   die($db->lastErrorMessage());
   // }
   // echo 'connected to database';

   if ($_POST['data']) {
     $query = 'INSERT INTO footprints (x, y, angle, step, session_time) VALUES (' . $_POST['data']['x'] . ', ' . $_POST['data']['y'] . ', ' . $_POST['data']['angle'] . ', ' . $_POST['data']['step'] .', ' . $_SESSION['start_time'] . ')';
     $result = $db->exec($query);
     if (!$result) {
       die($db->lastErrorMsg());
     }
   } else {
     $query = 'SELECT distinct session_time from footprints order by session_time desc limit 50';
     $result = $db->query($query);
     $rows = array();
     while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
       $rows[] = $row;
     }
     $end = end($rows);
     // var_dump($end);
     // die();
     if ($end) {
       $query = 'SELECT * from footprints WHERE session_time > ' . $end['session_time'] . ' ORDER BY session_time, id';
     } else {
       $query = 'SELECT * from footprints ORDER BY session_time, id';       
     }
     // echo($query);
     // die();
     $result = $db->query($query);
     $data = array();
     while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
       $data[] = $row;
     }
     echo json_encode($data);
   }
}
catch(Exception $e)
{
   die($e);
}

 ?>
