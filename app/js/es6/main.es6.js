/* global google */
/* global AmCharts: true */
/* jshint unused:false */
/* jshint camelcase:false */

(function(){
  'use strict';

  $(document).ready(init);

  var map;
  var charts={};

  function init() {
    initMap(36,-86,3);
    $('#go').click(doAdd);
  }

  function doAdd() {
    doShow();
    let location = $('#loc').val().trim();
    let url = 'http://api.wunderground.com/api/8602561c1a1ca88c/forecast10day/q/'+location+'.json?callback=?';
    $.getJSON(url, addLocation);
  }

  function addLocation(cond) {
    let days = cond.forecast.simpleforecast.forecastday; // array of weather info
    let zip = $('#loc').val().trim();
    $('#loc').val('');
    $('#loc').focus();
    $('#graphs').append(`<div class='graph' data-zip=${zip}></div>`);
    makeNewChart(zip);
    days.forEach(w=>charts[zip].dataProvider.push({day: w.date.weekday_short,
                                                   highs: w.high.fahrenheit,
                                                   lows:  w.low.fahrenheit}) );
    charts[zip].validateData();
  }

  function labelChart(city) {
    $('#graphs').append(`<p class='graph-title'>${city}</p>`);
  }

  function htmlAddMarker(lat,lng,name,iconpath,zoom){
    var latLng = new google.maps.LatLng(lat, lng);
    new google.maps.Marker({map: map, position: latLng, title: name, icon: iconpath});
    map.setCenter(latLng);
    map.setZoom(zoom);
  }

  function doShow() {
    let location = $('#loc').val().trim();
    let geocoder = new google.maps.Geocoder();

    geocoder.geocode({address: location}, function(results, status){
        var name = results[0].formatted_address;
        var lat = results[0].geometry.location.lat();
        var long= results[0].geometry.location.lng();
        var city = results[0].address_components[1].short_name;
        var zip = results[0].address_components[0].short_name;
        labelChart(city);
        htmlAddMarker(lat,long,name, './media/flagicon.png',10);
      });
  }

  function initMap(lat, lng, zoom){
    let mapOptions = {center: new google.maps.LatLng(lat, lng), zoom: zoom, mapTypeId: google.maps.MapTypeId.ROADMAP};
    map = new google.maps.Map(document.getElementById('map'), myOptions);
  }

  // Map style
  var styles = [{'featureType':'water','stylers':[{'visibility':'on'},{'color':'#acbcc9'}]},{'featureType':'landscape','stylers':[{'color':'#f2e5d4'}]},{'featureType':'road.highway','elementType':'geometry','stylers':[{'color':'#c5c6c6'}]},{'featureType':'road.arterial','elementType':'geometry','stylers':[{'color':'#e4d7c6'}]},{'featureType':'road.local','elementType':'geometry','stylers':[{'color':'#fbfaf7'}]},{'featureType':'poi.park','elementType':'geometry','stylers':[{'color':'#c5dac6'}]},{'featureType':'administrative','stylers':[{'visibility':'on'},{'lightness':33}]},{'featureType':'road'},{'featureType':'poi.park','elementType':'labels','stylers':[{'visibility':'on'},{'lightness':20}]},{},{'featureType':'road','stylers':[{'lightness':20}]}];
  var myOptions = {
      zoom: 3,
      center: new google.maps.LatLng(39,-92),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: styles
      };

  function makeNewChart(zip) {
    let graph = $(`.graph[data-zip=${zip}]`)[0];
    charts[zip] = AmCharts.makeChart(graph, {
        'type': 'serial',
        'theme': 'dark',
        'pathToImages': 'http://www.amcharts.com/lib/3/images/',
        'legend': {
            'useGraphSettings': true
        },
        'dataProvider': [],
        'valueAxes': [{
            'id':'v1',
            'minimum':0,
            'maximum':100,
            'axisColor': '#FF6600',
            'axisThickness': 2,
            'gridAlpha': 0,
            'axisAlpha': 1,
            'position': 'left'
        }],
        'graphs': [{
            'valueAxis': 'v1',
            'lineColor': '#FF6600',
            'bullet': 'round',
            'bulletBorderThickness': 1,
            'hideBulletsCount': 30,
            'title': 'Hi Temp',
            'valueField': 'highs',
    		'fillAlphas': 0
        }, {
            'valueAxis': 'v1',
            'lineColor': '#FCD202',
            'bullet': 'square',
            'bulletBorderThickness': 1,
            'hideBulletsCount': 30,
            'title': 'Lo Temps',
            'valueField': 'lows',
    		'fillAlphas': 0
        }],
        'chartCursor': {
            'cursorPosition': 'mouse'
        },
        'categoryField': 'day',
        'categoryAxis': {
//            'parseDates': true,
            'axisColor': '#DADADA',
            'minorGridEnabled': true
        }
    });
  }

})();
