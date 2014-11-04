/**
 * @author: Anita Mehrotra
 * @date: November 3, 2014
 */


var width = 960,
	height = 500,
	margin = 20;

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

var pvData = [];

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
queue()
    .defer(d3.json, "data/world-50m.json")
    .defer(d3.csv, "data/post-data-week37.csv", function(d) { 
        pvData[d.id] = d; 
    })
    .await(ready);

function ready(error, world) {

	// map
	var countries = topojson.feature(world, world.objects.countries).features;

	console.log(pvData);

    svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d) {
            if (typeof( pvData[d.id] ) != "undefined") {
                return d.color = colorScale[ pvData[d.id].Language ];
            }
        })
      .style("opacity", "0.8");


    // add legend
    var legend = d3.select("body").append("svg")
    		.attr("class", "legend")
			.attr("width", 150)
			.attr("height", 150)
    	.selectAll("g")
    		.data(color.domain().slice().reverse())
    	.enter().append("g")
    		.attr("transform", function(d, i) { return "translate(30," + (i*20) + ")"; });

    legend.append("rect")
    	.attr("width", 18)
    	.attr("height", 18)
    	.style("fill", color)
    	.style("opacity", "0.7");

    legend.append("text")
    	.attr("x", 24)
    	.attr("y", 9)
    	.attr("dy", ".35em")
    	.text(function(d) { return d; })
    		.attr("font-family", "Tahoma")
    		.attr("font-size", "10");

}





