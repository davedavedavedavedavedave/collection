<?php
if ($_GET['action'] == 'list') {
	$list = [];
	foreach(glob(__DIR__."/*.json") as $file) {
		array_push($list, substr($file, strrpos($file, "/collection/data/")));
	}
	echo json_encode($list);
} else if ($_POST['action'] == 'write') {
	$user = getLogin();
	if (strlen($user) > 0) {
		file_put_contents(__DIR__."/".$user.".json", $_POST['data']);
		echo "success";
	} else {
		echo "error";
	}
} else if ($_GET['action'] == 'getMyName') {
	$user = getLogin();
	echo $user;
} else {
	echo "unkown command";
}

function getLogin() {
	// Create a stream
	$opts = array(
	  'http'=>array(
	    'method' => "GET",
	    'header' => "Cookie: PHPSESSID=".$_COOKIE['PHPSESSID']."\n"
	  )
	);

	$context = stream_context_create($opts);

	// Open the file using the HTTP headers set above
	$result = file_get_contents("https://ccgdb.uber.space/user/profile_edit", false, $context);
	preg_match('/<input type="text" name="username" id="username" value="(.*?)"/', $result, $user);
	if (count($user) < 2) {
		return "";
	}
	$user = $user[1];
	return $user;
}
