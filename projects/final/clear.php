<?php

class MyDB extends SQLite3
{
  function __construct()
  {
     $this->open('footprints.db');
  }
}

try {
	$db = new MyDB();

	$query = 'DELETE from footprints;';
	
	$result = $db->query($query);

}
catch(Exception $e)
{
   die($e);
}


?>