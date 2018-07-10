<?php
header('Access-Control-Allow-Origin: *');
$version = array ('version'=>'1.0.3');
echo json_encode($version);
?>