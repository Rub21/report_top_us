/**********************
Get Data
***********************/

function mm_user(callback) {
    if (typeof reqwest === 'undefined') {
        throw 'CSV: reqwest required ';
    }
    var url = 'http://rub21.github.com/report_top_us/app/listtop50user.json?callback=callback';
    reqwest({
        url: url,
        type: 'jsonp',
        jsonpCallback: 'callback',
        success: response,
        error: response
    });

    function response(x) {
        var features = [];
        for (var j = 0; j < x.length; j++) {
            features.push(x[j]);
        };
        return callback(features);
    }
};

/**********************
For comma
***********************/
function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

/**********************
Map
***********************/
var map_id = 'ruben.map-kpe91wmi',
    map = mapbox.map('map');
map.addLayer(mapbox.layer().id(map_id));
map.centerzoom({
    lat: 41.474,
    lon: -101.034
}, 5);

var list_usser = [];
map.addLayer(mapbox.layer().id('ruben.users50_us', function() {
    map.interaction.off('off');
}));
map.setZoomRange(3, 6);
map.ui.zoomer.add();
map.ui.zoombox.add();
map.ui.hash.add();
map.ui.attribution.add().content('<a href="http://www.openstreetmap.org/">(c) OpenStreetMap contributors</a>');

mm_user(listUser);

function listUser(f) {
    list_usser = f;
    var suma = 0

    var o = '';
    for (var i = 0; i < list_usser.length; i++) {

        suma += list_usser[i].num_edit;
        var num_edit = addCommas(list_usser[i].num_edit);
        o += '<li  id="' + list_usser[i].user_id + '">' +
            '<a class="users" href="#' + list_usser[i].osm_user + '">' + list_usser[i].num_post + '. ' + list_usser[i].osm_user + ' (' + num_edit + ' edits)' +
            '</a>' +
            '</li>';
    };
    var o_ = '<li  id="s50" class="active"> <a class="users" href="#"> Top 50 mappers  (' + addCommas(suma) + '  edits)</a></li><li class="divider"></li>';
    o = o_ + o;
    $('#userlayers').append(o);
    $('#map').removeClass('loading');

};
/**********************
document ready
***********************/
$(document).ready(function() {
    $('#map').removeClass('loading');


    $('#userlayers').on('click', 'li', function(e) {

        $('#userlayers li').removeClass('active');

        $('.dropdown-toggle').html($(this).text() + '<b class="caret "></b>');

        $('#map').addClass('loading');
        var mbtiles_id = 'user' + $(this).attr('id') + "_us";


        removelayers();
        map.addLayer(mapbox.layer().id('ruben.' + mbtiles_id, function() {

                        map.interaction.auto();
            map.interaction.off('on');
            map.interaction.off('off');
            map.interaction.on({
                on: function(o) {
                    var mydiv = document.getElementById('interactive');
                    mydiv.style.display = 'block';
                    document.getElementById('osm_user').innerHTML = o.data.osm_user;
                    document.getElementById('edit_at').innerHTML = o.data.closed_at;
                    document.getElementById('num_changes').innerHTML = o.data.num_changes;
                },
                off: function(o) {
                    var mydiv = document.getElementById('interactive');
                    mydiv.style.display = 'none';
                }
            });

            
        }));
        map.interaction.refresh();
        $('#map').removeClass('loading');
        $(this).addClass('active');
    });

    function removelayers() {
        if (map.getLayers().length == 2) {
            map.removeLayerAt(1);
        }
    };
});