/**
 * @author: Anita Mehrotra
 * @date: November 3, 2014
 */

// set up svg and map params
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

// color scale
var colorScale = [];
colorScale["en"] = "Indigo";
colorScale["es"] = "Crimson";
colorScale["pt"] = "Gold";
colorScale["de"] = "ForestGreen";
colorScale["fr"] = "Blue";

var color = d3.scale.ordinal()
	.domain(["English", "Espanol", "Portuguese", "Deutsche", "French"])
	.range(["Indigo", "Crimson", "Gold", "ForestGreen", "Blue"]);

// load data
var myData = [];
queue()
    .defer(d3.json, "data/world-50m.json")
    .defer(d3.csv, "data/aggregated-data.csv", function(d) { 
        myData[d.id] = d; 
    })
    .defer(d3.csv, "data/aggregated-data.csv")
    .await(ready);

function ready(error, world) {

	// draw map
	var countries = topojson.feature(world, world.objects.countries).features;

    svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d, i) {
        if (typeof( myData[parseInt(d.id)] ) != "undefined") {
            return d.color = colorScale[ myData[parseInt(d.id)].Language ];
        }
      })
      .style("opacity", "0.8");    

    // add legend
    drawLegend();

    // make slider
    var pvMax = 100, 
        pvMin = 0;

    var slider = d3.select("#slider")
        .append("input")
            .attr("class", "ui-slider-handle")
            .attr("type", "range")
            .attr("max", pvMax)
            .attr("min", pvMin)
            .style("width", "400px")
            .property("value", pvMin);
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
        .text(function(d) { return d; })
            .attr("font-family", "Tahoma")
            .attr("font-size", "10");
}



