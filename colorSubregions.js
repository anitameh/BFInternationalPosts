/**
 * @author: Anita Mehrotra
 * @date: November 3, 2014
 */

// init: set up svg and map params
var width = 960,
	height = 500,
	margin = 20;

var attributeArray = [],
    currentAttribute = 0;

var projection = d3.geo.kavrayskiy7(),
    graticule = d3.geo.graticule();
 
var path = d3.geo.path()
    .projection(projection);
 
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// svg.append("rect")
//     .attr("width", "100%")
//     .attr("height", "100%")
//     .attr("fill", "black");

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);
 
svg.append("path")
    .datum(graticule.outline)
    .attr("class", "graticule outline")
    .attr("d", path);

// initialize other variables


// color scale
var color = d3.scale.ordinal()
	.domain(["en", "es", "pt", "de", "fr"])
	.range(["Indigo", "Crimson", "Gold", "ForestGreen", "Blue"]);

var englishColors = d3.scale.quantize()
    .range(colorbrewer.Blues[3]);

var espanolColors = d3.scale.quantize()
    .range(colorbrewer.YlGn[5]);

var langFull = ["English", "Espanol", "Portuguese", "Deutsche", "French"];

var firstWeekOfYear;

// load data
queue()
    .defer(d3.json, "data/world-50m.json")
    .defer(d3.json, "data/aggregated-data.js")
    .defer(d3.csv, "data/unique-countries.csv")
    .await(ready);


function ready(error, world, pageViews, uniqueCountries) {

    // get label
    // var label = d3.select("#week");

	// draw map
	var countries = topojson.feature(world, world.objects.countries).features;

    // get country ids for countries that viewed content at some point
    var justids = [];
    uniqueCountries.forEach(function(d) {
        justids.push(parseInt(d.id));
    });

    // initially color based on color of language
    firstWeekOfYear = pageViews[0].week;
    
    
    var initView = pageViews[0].info;

    var english = initView[0].pageviews;
    var englishIds = [];
    var englishPvs = [];
    english.forEach(function(d) {
        englishIds.push( d.id );
        englishPvs[d.id] = d.pv;
    });
    var enMax = d3.max(englishPvs);
    var enMin = d3.min(englishPvs);
    // console.log(enMin, enMax);
    englishColors.domain([enMin, enMax]);

    var espanol = initView[1].pageviews;
    var espanolIds = [];
    var espanolPvs = [];
    espanol.forEach(function(d) {
        espanolIds.push( d.id );
        espanolPvs[d.id] = d.pv;
    });
    // console.log(espanolPvs);
    var esMax = d3.max(espanolPvs);
    var esMin = d3.min(espanolPvs);
    espanolColors.domain([esMin, esMax])

    var portuguese = initView[2].pageviews;
    var portugueseIds = [];
    portuguese.forEach(function(d) {
        portugueseIds.push( d.id );
    });

    var deutsche = initView[3].pageviews;
    var deutscheIds = [];
    deutsche.forEach(function(d) {
        deutscheIds.push( d.id );
    });

    var french = initView[4].pageviews;
    var frenchIds = [];
    french.forEach(function(d) {
        frenchIds.push( d.id );
    });

    // draw initial world map with initial colors
    svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d, i) {
        if ( justids.indexOf(d.id) != -1 ) {
            if (englishIds.indexOf(d.id) != - 1) {
                return d.color = "blue";
                // console.log(englishColors( englishPvs[d.id] ));
                // return d.color = englishColors( englishPvs[d.id] );
            }
            else if (espanolIds.indexOf(d.id) != - 1) {
                return d.color = "green"; 
                // console.log( espanolColors( espanolPvs[d.id] ) );
                // return d.color = espanolColors( espanolPvs[d.id] );
            }
            else if (portugueseIds.indexOf(d.id) != - 1) {
                return d.color = "gold"; 
            }
            else if (deutscheIds.indexOf(d.id) != - 1) {
                return d.color = "red"; 
            }
            else if (frenchIds.indexOf(d.id) != - 1) {
                return d.color = "purple"; 
            }
        }
      })
      .style("opacity", "0.75");    

    // add legend
    drawLegend();

    // make slider
    var pvMax = d3.max(pageViews, function(d) { return d.week }), 
        pvMin = d3.min(pageViews, function(d) { return d.week });

    var slider = d3.select("#slider")
            .append("input")
        .attr("class", "ui-slider-handle")
        .attr("type", "range")
        .attr("max", pvMax)
        .attr("min", pvMin)
        .style("width", "200px")
        .property("value", pvMin)
        .on("change", function(d) {
            pvMin = this.value;
        });

    // update
    var possibleColors = ["purple", "black", "gold", "green", "blue", "OrangeRed", "magenta", "Crimson", "pink", "lightsteelblue"];

    function update() {

        // label.text(pvMin); // update label

        console.log(pvMin - firstWeekOfYear);

        slider.property("value", pvMin); // set slider

        d3.selectAll(".country").transition()
            .duration(200)
            .style("fill", function(d, i) {
                if ( justids.indexOf(d.id) != -1 ) {
                    // console.log("d.id = " + d.id); // country id
                    return d.color = possibleColors[pvMin-36];
                }
            });

        pvMin++;

    }

    // use this to activate update() function (method inherited from JQuery slider)
    setInterval(function() {
        if (pvMin <= pvMax) {
            update();
        }
    }, 1000);

}



function drawLegend() {

    var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + (i*20) + ")"; });

    legend.append("rect")
        .attr("x", 18)
        .attr("y", 380)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .style("opacity", "0.7");

    legend.append("text")
        .attr("x", 40)
        .attr("y", 389)
        .attr("dy", ".35em")
        .text(function(d, i) { return langFull[i]; })
            .attr("font-family", "Tahoma")
            .attr("font-size", "10");
            // .style("fill", "white");
}

