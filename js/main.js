//////////////////////////Leaflet initialization - START ///////////////////////////////////////////////////////////////

var basemap = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attribution">CARTO</a>. Crime Data &copy; Calgary Police Service 2013. Design CC-BY <a href="https://ebrahim.planyourplace.ca/">Ebrahim Poorazizi</a>'
});

var map_center = new L.LatLng(51.057, -114.066);

var map = L.map('map', {
    center: [51.057, -114.066],
    zoom: 12,
    minZoom: 9,
    maxZoom: 18,
    layers: [basemap]
});

var southWest = new L.LatLng(50.68036, -114.52148),
    northEast = new L.LatLng(51.34434, -113.46714),
    bounds = new L.LatLngBounds(southWest, northEast);

map.setMaxBounds(bounds);

var sidebar = L.control.sidebar('sidebar').addTo(map);

var green_marker_icon = new L.Icon({
    iconUrl: 'css/images/marker-green.png',
    shadowUrl: 'css/images/marker-shadow.png',
    iconSize: [25, 41], // size of the icon
    shadowSize: [41, 41], // size of the shadow
    iconAnchor: [13, 40], // point of the icon which will correspond to marker's location
    shadowAnchor: [13, 40], // the same for the shadow
    popupAnchor: [0, -40] // point from which the popup should open relative to the iconAnchor
});

var lat = map_center.lat;
var lng = map_center.lng;
var marker = new L.Marker(map_center, {
    icon: green_marker_icon,
    draggable: true
}).addTo(map).bindPopup('Start Point').openPopup();

$('#start_point_pedestrian').val(lat.toString() + ',' + lng.toString());
$('#start_point_transit').val(lat.toString() + ',' + lng.toString());
$('#start_point_bike').val(lat.toString() + ',' + lng.toString());

marker.on('drag', function(e) {
    var point = e.target.getLatLng();
    var lat = point.lat;
    var lng = point.lng;
    $('#start_point_pedestrian').val(lat.toString() + ',' + lng.toString());
    $('#start_point_transit').val(lat.toString() + ',' + lng.toString());
    $('#start_point_bike').val(lat.toString() + ',' + lng.toString());
});

marker.on('move', function(e) {
    var point = e.target.getLatLng();
    var lat = point.lat;
    var lng = point.lng;
    $('#start_point_pedestrian').val(lat.toString() + ',' + lng.toString());
    $('#start_point_transit').val(lat.toString() + ',' + lng.toString());
    $('#start_point_bike').val(lat.toString() + ',' + lng.toString());
});

var legend = L.control({
    position: 'bottomright'
});
legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<div id="accessibility_legend"></div>';
    div.innerHTML += '<div id="crime_legend"></div>';
    return div;
};

var poi_panel = L.control({
    position: 'topright'
});
poi_panel.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<input type="checkbox" id="poi_data_check" name="poi_data_check" disabled="true"/><span id="poi_data_text" style="color: #a0a3a0; font-style: italic;">Point of Interests</span>';
    return div;
};


if (L.Browser.mobile || L.Browser.android || L.Browser.touch || L.Browser.msTouch) {
    $(".leaflet-control-zoom").css("visibility", "hidden");
}


//////////////////////////Leaflet initialization - END ///////////////////////////////////////////////////////////////

//////////////////////////////// WPS invocation ////////////////////////////////////////////////////////////////////

var walkshed_overlay = null;
var legend_overlay = true;
var poi_data_overlay = null;

function call_wps(approach) {
    var start_point;
    var biking_time_period;
    var walking_time_period;
    var walking_speed;
    var walking_start_time;
    var walking_speed_amount;
    var params;

    switch (approach) {
        case "bike":
            start_point = $('#start_point_bike').val();
            biking_time_period = $('#biking_time_period_amount').val() * 60;
            params = "origin=" + start_point + "&threshold=" + biking_time_period + "&mode=BICYCLE";
            break;
        case "pedestrian":
            start_point = $('#start_point_pedestrian').val();
            walking_time_period = $('#walking_time_period_amount_pedestrian').val() * 60;
            walking_speed_amount = $('#walking_speed_amount_pedestrian').val();
            switch (walking_speed_amount) {
                case '3':
                    walking_speed = .83;
                    break;
                case '3.5':
                    walking_speed = .97;
                    break;
                case '4':
                    walking_speed = 1.11;
                    break;
                case '4.5':
                    walking_speed = 1.25;
                    break;
                case '5':
                    walking_speed = 1.38;
                    break;
                case '5.5':
                    walking_speed = 1.52;
                    break;
                case '6':
                    walking_speed = 1.67;
                    break;
            }
            params = "origin=" + start_point + "&threshold=" + walking_time_period + "&walking_speed=" + walking_speed + "&mode=WALK";
            break;
        case "transit":
            start_point = $('#start_point_transit').val();
            walking_time_period = $('#walking_time_period_amount_transit').val() * 60;
            walking_speed_amount = $('#walking_speed_amount_transit').val();
            switch (walking_speed_amount) {
                case '3':
                    walking_speed = .83;
                    break;
                case '3.5':
                    walking_speed = .97;
                    break;
                case '4':
                    walking_speed = 1.11;
                    break;
                case '4.5':
                    walking_speed = 1.25;
                    break;
                case '5':
                    walking_speed = 1.38;
                    break;
                case '5.5':
                    walking_speed = 1.52;
                    break;
                case '6':
                    walking_speed = 1.67;
                    break;
            }
            walking_start_time = $('#walking_start_time').val() + ":00";
            params = "origin=" + start_point + "&threshold=" + walking_time_period + "&walking_speed=" + walking_speed + "&mode=WALK,TRANSIT";
            break;
    }


    $.ajax({
        url: "http://localhost:3000/api/score?" + params,
        beforeSend: function(xhr) {
            if (checkBoundary(start_point)) {
                $.blockUI({
                    css: {
                        border: 'none',
                        padding: '15px',
                        backgroundColor: '#000',
                        'border-radius': '10px',
                        '-webkit-border-radius': '10px',
                        '-moz-border-radius': '10px',
                        opacity: .5,
                        color: '#fff'
                    }
                });
            } else {
                $('#out_of_bound_error').dialog();
                xhr.abort();
            }
        },
        success: function(data, status) {
            var results = data.features[0]
            var poi_data = data.features[1]
            var poi_score = results.properties.score;
            var color = results.properties.color;
            var crime_index = results.properties.crime_index;
            var geojson_overlay;

            var shed_style = {
                "color": color,
                "weight": 5,
                "opacity": 0.60
            };

            geojson_overlay = L.geoJson(results, {
                style: shed_style
            });

            //overlay legend
            $('#accessibility_score').val(poi_score);
            $('#crime_index').val(crime_index);

            if (!legend_overlay) {
                $('div').remove('.info');
                legend_overlay = true;
            }

            accessibility_legend();
            crime_legend();

            legend.addTo(map);
            legend_overlay = false;

            var poi_score_color;
            if (poi_score >= 0 && poi_score < 20) {
                poi_score_color = '#ED1C24';
            } else if (poi_score >= 20 && poi_score < 40) {
                poi_score_color = '#F7941E';
            } else if (poi_score >= 40 && poi_score < 60) {
                poi_score_color = '#FFF200';
            } else if (poi_score >= 60 && poi_score < 80) {
                poi_score_color = '#8DC63F';
            } else if (poi_score >= 80 && poi_score <= 100) {
                poi_score_color = '#39B54A';
            }

            marker.bindPopup('<div>Score:</div><br><div style="font-size: 36px; margin-top: -20px; margin-bottom: -5px; color: ' + poi_score_color + '"><b>' + poi_score + '</b></div>').openPopup();

            //overlay poi data
            if (poi_data_overlay != null) {
                map.removeLayer(poi_data_overlay);
                poi_data_overlay = null;
            }

            //overlay poi panel
            poi_panel.addTo(map);

            if (poi_data.features.length > 0) {
                $('#poi_data_check').removeAttr("disabled");
                $('#poi_data_text').css("font-style", "normal");
                $('#poi_data_text').css("color", "#333333");
                $('#poi_data_check').click(function() {
                    if ($(this).is(':checked')) {
                        if (poi_data_overlay == null) {
                            if (poi_data != 'NULL') {
                                poi_data_overlay = show_poi_data(poi_data);
                                map.addLayer(poi_data_overlay);
                                map.fitBounds(poi_data_overlay.getBounds());
                            }
                        }
                    } else {
                        map.removeLayer(poi_data_overlay);
                        poi_data_overlay = null;
                    }
                });
            } else {
                $('#poi_data_check').attr("disabled", true);
                $('#poi_data_text').css("font-style", "italic");
                $('#poi_data_text').css("color", "#a0a3a0");
            }

            var walkshed_bound = geojson_overlay.getBounds();
            map.fitBounds(walkshed_bound);

            if (walkshed_overlay != null) {
                map.removeLayer(walkshed_overlay);
            }

            geojson_overlay.addTo(map);

            walkshed_overlay = geojson_overlay;
            // } else {
            //     $("#out_of_bound_error").dialog();
            //     $.unblockUI();
            // }

        },
        complete: function() {
            $.unblockUI();
        }
    });
}


////////////////////////////// WPS invocation - END ////////////////////////////////////////////////////////////////////

////////////////////////////// Show POI - START ////////////////////////////////////////////////////////////////////////

function show_poi_data(poi_data) {
    var _markers = new L.MarkerClusterGroup({
        showCoverageOnHover: false
    });

    var geoJsonLayer = L.geoJson(poi_data, {
        onEachFeature: function(feature, layer) {
            setGeoJsonFeatureIcon(feature, layer);
            setGeoJsonFeaturePopup(feature, layer);
        }
    });
    _markers.addLayer(geoJsonLayer);
    return _markers;
}

function setGeoJsonFeatureIcon(feature, layer) {
    if (feature.properties && feature.properties.icon) {
        layer.setIcon(new L.Icon({
            iconUrl: encodeURI(`data:image/svg+xml,${feature.properties.icon}`).replace('#','%23'),
            iconAnchor: [10, 0], // point of the icon which will correspond to marker's location
            popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
        }));
    }
}

function setGeoJsonFeaturePopup(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
    }
}

////////////////////////////// Show POI - END ////////////////////////////////////////////////////////////////////////

///////////////////////////// Slider setting - START /////////////////////////////////////////////////////

$("#biking_time_period").slider({
    value: 15,
    min: 0,
    max: 20,
    step: 1,
    slide: function(event, ui) {
        $("#biking_time_period_amount").val(ui.value);
    }
});
$("#biking_time_period_amount").val($("#biking_time_period").slider("value"));

$("#walking_time_period_pedestrian").slider({
    value: 15,
    min: 0,
    max: 20,
    step: 1,
    slide: function(event, ui) {
        $("#walking_time_period_amount_pedestrian").val(ui.value);
    }
});
$("#walking_time_period_amount_pedestrian").val($("#walking_time_period_pedestrian").slider("value"));

$("#walking_speed_pedestrian").slider({
    value: 5,
    min: 3,
    max: 6,
    step: .5,
    slide: function(event, ui) {
        $("#walking_speed_amount_pedestrian").val(ui.value);
    }
});
$("#walking_speed_amount_pedestrian").val($("#walking_speed_pedestrian").slider("value"));

$("#walking_time_period_transit").slider({
    value: 15,
    min: 0,
    max: 20,
    step: 1,
    slide: function(event, ui) {
        $("#walking_time_period_amount_transit").val(ui.value);
    }
});
$("#walking_time_period_amount_transit").val($("#walking_time_period_transit").slider("value"));

$("#walking_speed_transit").slider({
    value: 5,
    min: 3,
    max: 6,
    step: .5,
    slide: function(event, ui) {
        $("#walking_speed_amount_transit").val(ui.value);
    }
});
$("#walking_speed_amount_transit").val($("#walking_speed_transit").slider("value"));

////////////////////////////// Slider setting - END //////////////////////////////////////////////////////////////////

///////////////////////////// Time Spinner setting - START ////////////////////////////////////////////////////////////

$.widget("ui.timespinner", $.ui.spinner, {
    options: {
        // seconds
        step: 60 * 1000,
        // hours
        page: 60
    },

    _parse: function(value) {
        if (typeof value === "string") {
            // already a timestamp
            if (Number(value) == value) {
                return Number(value);
            }
            return +Globalize.parseDate(value);
        }
        return value;
    },

    _format: function(value) {
        return Globalize.format(new Date(value), "t");
    }
});
var current_time = new Date();
var current_hour = current_time.getHours();
var current_minute = current_time.getMinutes();
current_time = current_hour + ":" + current_minute;
$("#walking_start_time").timespinner();
Globalize.culture("de-DE");
$("#walking_start_time").timespinner("value", current_time);

///////////////////////////// Time Spinner setting - END ////////////////////////////////////////////////////////////

////////////////////////////////////// Legend - START /////////////////////////////////////////////////////

function accessibility_legend() {
    var margin = {
            top: 5,
            right: 15,
            bottom: 20,
            left: 120
        },
        width = 150,
        height = 50 - margin.top - margin.bottom;

    var chart = d3.bullet()
        .width(width)
        .height(height);

    d3.json("accessibility_legend_init.json", function(error, data) {
        var svg = d3.select("#accessibility_legend").selectAll("svg")
            .data(data)
            .enter().append("svg")
            .attr("class", "bullet")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(chart);

        var title = svg.append("g")
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + height / 2 + ")");

        title.append("text")
            .attr("class", "title")
            .text(function(d) {
                return d.title;
            });

        title.append("text")
            .attr("class", "subtitle")
            .attr("dy", "1em")
            .text(function(d) {
                return d.subtitle;
            });

        svg.datum(update_accessibility_value).call(chart.duration(1000));
    });
}

function update_accessibility_value(d) {
    var new_value = $('#accessibility_score').val();
    d.value = get_value(d, new_value);
    d.markers = d.markers.map(d.value);
    d.measures = d.measures.map(d.value);
    return d;
}

function crime_legend() {
    var margin = {
            top: 5,
            right: 15,
            bottom: 20,
            left: 120
        },
        width = 150,
        height = 50 - margin.top - margin.bottom;

    var chart = d3.bullet()
        .width(width)
        .height(height);

    d3.json("crime_legend_init.json", function(error, data) {
        var svg = d3.select("#crime_legend").selectAll("svg")
            .data(data)
            .enter().append("svg")
            .attr("class", "bullet")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .call(chart);

        var title = svg.append("g")
            .style("text-anchor", "end")
            .attr("transform", "translate(-6," + height / 2 + ")");

        title.append("text")
            .attr("class", "title")
            .text(function(d) {
                return d.title;
            });

        title.append("text")
            .attr("class", "subtitle")
            .attr("dy", "1em")
            .text(function(d) {
                return d.subtitle;
            });

        svg.datum(update_crime_value).call(chart.duration(1000));
    });
}

function update_crime_value(d) {
    var new_value = $('#crime_index').val();
    d.value = get_value(d, new_value);
    d.markers = d.markers.map(d.value);
    d.measures = d.measures.map(d.value);
    return d;
}

function get_value(d, num) {
    return function(d) {
        return num;
    };
}

///////////////////////////////// Legend - END ///////////////////////////////////////////////////////////////////////

//////////////////////////// Adding geocoder control - START ///////////////////////////////////////////////////////////
function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ])[1]
    );
}

var regionParameter = getURLParameter('region');
var region = (regionParameter === 'undefined') ? '' : regionParameter;

var geocoder_control = new L.Control.GeoSearch({
    provider: new L.GeoSearch.Provider.Esri({
        region: region
    })
}).addTo(map);

//////////////////////////// Adding geocoder control - END ///////////////////////////////////////////////////////////


function checkBoundary(point) {
    var _polygon = L.geoJson(calgary_boundary);
    var _coordinates = point.split(',');
    var _point = L.latLng(parseFloat(_coordinates[0]), parseFloat(_coordinates[1]));

    point_in_polygon = leafletPip.pointInLayer(_point, _polygon);
    if (point_in_polygon.length > 0) {
        return true;
    } else {
        return false;
    }
}
