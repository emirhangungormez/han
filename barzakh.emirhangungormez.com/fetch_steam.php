<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$appId = '3849950'; // Barzakh: Star Gardener
$apiUrl = "https://store.steampowered.com/api/appdetails?appids=$appId";

// Fetch data from Steam
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
$json = curl_exec($ch);
curl_close($ch);

if ($json) {
    echo $json;
} else {
    echo json_encode(['error' => 'Could not fetch data from Steam.']);
}
