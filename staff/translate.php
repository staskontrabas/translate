<?
$word = $_REQUEST['word'];

$contents = file_get_contents('search-word-translation.json'); 
$obj = json_decode($contents);

$mean = false;
foreach($obj as $k){
	if($k -> text == $word){
		$mean = $k;
	}
}
echo json_encode($mean);
//print '<pre>';
//print_r($mean);//[0] -> translation);
//print '</pre>';


?>