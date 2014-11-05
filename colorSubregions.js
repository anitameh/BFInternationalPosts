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

var langFull = ["English", "Espanol", "Portuguese", "Deutsche", "French"];

// load data
queue()
    .defer(d3.json, "data/world-50m.json")
    .defer(d3.json, "data/aggregated-data.js")
    .defer(d3.csv, "data/unique-countries.csv")
    .await(ready);


function ready(error, world, pageviews, uniqueCountries) {

    // get label
    // var label = d3.select("#week");

	// draw map
	var countries = topojson.feature(world, world.objects.countries).features;

    // get country ids for countries that viewed content at some point
    var ids = [];
    uniqueCountries.forEach(function(d) {
        ids.push(parseInt(d.id));
    });

    // draw world map and color
    svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d, i) {
        if ( ids.indexOf(d.id) != -1 ) {
            return d.color = "purple"; // right now, colors all countries that have viewed BFpage at some point
        }
      })
      .style("opacity", "0.8");    

    // add legend
    drawLegend();

    // make slider
    var pvMax = 45, 
        pvMin = 36;

    var slider = d3.select("#slider")
            .append("input")
        .attr("class", "ui-slider-handle")
        .attr("type", "range")
        .attr("max", pvMax)
        .attr("min", pvMin)
        .style("width", "400px")
        .property("value", pvMin)
        .on("change", function(d) {
            pvMin = this.value;
        });

    // update
    var possibleColors = ["purple", "black", "gold", "green", "blue", "OrangeRed", "magenta", "Crimson", "pink", "lightsteelblue"];

    function update() {

        // label.text(pvMin); // update label
        console.log("pvMin = " + pvMin);

        slider.property("value", pvMin); // set slider

        d3.selectAll(".country").transition()
            .duration(150)
            .style("fill", function(d, i) {
                if ( ids.indexOf(d.id) != -1 ) {
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
}

