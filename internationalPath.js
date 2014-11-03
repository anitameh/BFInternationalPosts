/**
 * @author: Anita Mehrotra
 * @date: October 28, 2014
*/

var width = 960,
	height = 600;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

var method = d3.geo.mercator().translate([width / 2, height / 2]);

var path = d3.geo.path().projection(method);

var g = svg.append("g");

// load data and wait
var pvData = [];
queue()
    .defer(d3.json, "world-50m.json")
    .defer(d3.csv, "post-data.csv", function(d) { 
        pvData[d.id] = d; 
    })
    .await(ready);

var colorScale = [];
colorScale["en"] = "darkblue";
colorScale["es"] = "red";
colorScale["pt"] = "yellow";
colorScale["de"] = "green";
colorScale["fr"] = "orange";

function ready(error, world) {
    var countries = topojson.feature(world, world.objects.countries).features;

	// create world map
    g.selectAll("path")
		.data(countries)
		.enter()
			.append("path")
			.attr("d", path);

    // bubble scale
    var radius = d3.scale.sqrt()
    .domain([0, 1e6])
    .range([0, 25]);

    // add bubbles
    g.attr("class", "bubble")
    .selectAll("circle")
        .data(countries)
    .enter().append("circle")
        .attr("transform", function(d) { 
            return "translate(" + path.centroid(d) + ")"; 
        })
        .attr("r", function(d) {
            if (typeof( pvData[d.id] ) != "undefined") {
                var myval = parseInt(pvData[d.id].Pageviews);
                return radius(myval);
            }
            else {
                return 0;
            }
        })
        .style("fill", function(d) {
            if (typeof( pvData[d.id] ) != "undefined") {
                return colorScale[ pvData[d.id].Language ];
            }
        })
        .style("opacity", "0.7")
        .style("stroke", "white");

    // make legend
    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - 80) + "," + (height - 30) + ")")
      .selectAll("g")
        .data([1e6, 3e6, 6e6])
      .enter().append("g")
        .attr("stroke", "black")
        .attr("fill-opacity", "0.1");

    legend.append("circle")
        .attr("cy", function(d) { return -radius(d); })
        .attr("r", radius);

    legend.append("text")
        .attr("y", function(d) { return -2 * radius(d); })
        .attr("dy", "1.3em")
        .text(d3.format(".1s"))
            .attr("font-size", "12");

}
