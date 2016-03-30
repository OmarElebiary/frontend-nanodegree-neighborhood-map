
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview
    var street = $("#street").val();
    var city = $("#city").val();
    var address = street + ', ' + city;
    var streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=600x400&location=' + address + '';
    $body.append('<img class="bgimg" src="'+ streetViewURL + '">');

    //Nytimes Ajax request
    var nytimesUrl = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?q='+city+'&page=2&sort=newest&api-key=f864dfaca900db5657cd2ef3ad0f7e7b:3:74841986';
    $.getJSON(nytimesUrl, function(data) {
        $nytHeaderElem.text('New York Times Articles About ' + city);
        articles = data.response.docs;
        for(var i = 0;i < articles.length;i++){
            var article = articles[i];
            $nytElem.append('<li class="article">'+'<a href="'+article.web_url+'">'+article.headline.main+'</a>'+'<p>'+article.snippet+'</p>'+'</li>');
        }
    });
    // YOUR CODE GOES HERE!

    return false;
};

$('#form-container').submit(loadData);
