<?php

$approach = $_GET['wps'];
$start_point = $_GET['start_point'];
$distance_decay_function = 'false';

switch ($approach) {
    case "walkscore":
        $walking_radius = $_GET['radius'];
        $url = "http://webmapping.ucalgary.ca:8080/geoserver/ows?service=wps&version=1.0.0&request=Execute&Version=1.0.0&Identifier=gs:Management_WS&DataInputs=StartPoint=" . $start_point . ";Radius=" . $walking_radius . ";DistanceDecayFunction=" . $distance_decay_function;
        break;
    case "walkyourplace":
        $walking_radius = $_GET['radius'];
        $url = "http://webmapping.ucalgary.ca:8080/geoserver/ows?service=wps&version=1.0.0&request=Execute&Version=1.0.0&Identifier=gs:Management_WYP&DataInputs=StartPoint=" . $start_point . ";Radius=" . $walking_radius . ";DistanceDecayFunction=" . $distance_decay_function;
        break;
    case "bike":
        $biking_time_period = $_GET['biking_time_period'];
        $url = "http://webmapping.ucalgary.ca:8080/geoserver/ows?service=wps&version=1.0.0&request=Execute&Version=1.0.0&Identifier=gs:Management_Bike&DataInputs=StartPoint=" . $start_point . ";BikingTimePeriod=" . $biking_time_period . ";DistanceDecayFunction=" . $distance_decay_function;
        break;
    case "pedestrian":
        $walking_time_period = $_GET['walking_time_period'];
        $walking_speed = $_GET['walking_speed'];
        $url = "http://webmapping.ucalgary.ca:8080/geoserver/ows?service=wps&version=1.0.0&request=Execute&Version=1.0.0&Identifier=gs:Management_Pedestrian&DataInputs=StartPoint=" . $start_point . ";WalkingTimePeriod=" . $walking_time_period . ";WalkingSpeed=" . $walking_speed . ";DistanceDecayFunction=" . $distance_decay_function;
        break;
    case "transit":
        $walking_start_time = $_GET['walking_start_time'];
        $walking_time_period = $_GET['walking_time_period'];
        $walking_speed = $_GET['walking_speed'];
        $bus_waiting_time = $_GET['bus_waiting_time'];
        $bus_riding_time = $_GET['bus_riding_time'];
        $url = "http://webmapping.ucalgary.ca:8080/geoserver/ows?service=wps&version=1.0.0&request=Execute&Version=1.0.0&Identifier=gs:Management_Transit&DataInputs=StartPoint=" . $start_point . ";StartTime=" . $walking_start_time . ";WalkingTimePeriod=" . $walking_time_period . ";WalkingSpeed=" . $walking_speed . ";BusWaitingTime=" . $bus_waiting_time . ";BusRideTime=" . $bus_riding_time . ";DistanceDecayFunction=" . $distance_decay_function;
        break;
}


// is cURL installed yet?
if (!function_exists('curl_init')) {
    die('Sorry cURL is not installed!');
}
set_time_limit(0);
// OK cool - then let's create a new cURL resource handle
$ch = curl_init();
// Now set some options (most are optional)
// Set URL to download
curl_setopt($ch, CURLOPT_URL, $url);
// Include header in result? (0 = yes, 1 = no)
curl_setopt($ch, CURLOPT_HEADER, 0);
// Should cURL return or print out the data? (true = return, false = print)
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//The number of seconds to wait while trying to connect. Use 0 to wait indefinitely.
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
// Timeout in seconds
curl_setopt($ch, CURLOPT_TIMEOUT, 1000);
// Download the given URL, and return output
$output = curl_exec($ch);
// Close the cURL resource, and free system resources
curl_close($ch);

$xml_data = new SimpleXMLElement($output);
$result = $xml_data->xpath('//wps:LiteralData');
$result = (string)$result[0];

print_r($result);

return $result;
