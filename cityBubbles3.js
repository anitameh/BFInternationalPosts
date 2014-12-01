/**
 * @author: Anita Mehrotra
 * @date: November 14, 2014
 */

// init: set up svg and map params
var width = 900,
  height = 960;

var projection = d3.geo.stereographic()
    .scale(245)
    .translate([width / 2, height / 2])
    .rotate([-20, 0])
    .clipAngle(180 - 1e-4)
    .clipExtent([[0, 0], [width, height]])
    .precision(.1);

// var projection = d3.geo.mercator()
//     .center([0,20])
//     .scale(150);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geo.path()
    .projection(projection);

// initialize global variables
var SLIDERWIDTH = 500,
    GLOBALMIN = 0,
    GLOBALMAX = 12941,
    DATES;

// color scale
var languageColors = d3.scale.ordinal()
      .domain(["en", "es", "fr", "pt", "de"])
      .range(["#67a9cf", "green", "yellow", "Crimson", "purple"]);

// load data
queue()
    .defer(d3.json, "new-data/world-50m.json")
    .defer(d3.csv, "new-data/all-city-language-data.csv")
    .defer(d3.csv, "new-data/cities.csv")
    .await(ready);


// draw world map
var graticule = d3.geo.graticule();

svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

// create viz
function ready(error, world, PV, cities) {


    // get dates for this post
    var headers = d3.keys( PV[0] );
    var dateLength = (headers.length-2)/2; // always even because each date col has a corresponding language col
    DATES = headers.slice(0, dateLength);


    // initialize variables
    var myMin = 0,
        myMax = DATES.length-1;


    // size (of bubbles) scale
    var sizeScale = d3.scale.linear()
        .domain([GLOBALMIN, GLOBALMAX])
        .range([0, 10]);


    // add tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // draw rest of world map
    svg.insert("path", ".graticule")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

    svg.insert("path", ".graticule")
      .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
      .attr("class", "boundary")
      .attr("d", path);


    // create bubbles
    var currentDate = DATES[0];
    var currentLanguage = "Language" + String(currentDate);

    var bubbles = svg.selectAll("circle")
        .data( PV )
        .enter().append("circle")
        .attr("cx", function(d) { return projection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
        .attr("cy", function(d) { return projection([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
        .attr("r", function(d) { 
            return Math.log( 1+d[currentDate] ); 
        })
        .style("fill", function(d) { return languageColors( d[currentLanguage] ); })
        // .style("stroke", function(d) { return languageColors( d[currentLanguage] ); })
        .attr("class", "circle");


    // hover labels
    bubbles
        .on("mouseover", function(d) {
            // tooltip
            div.transition()
              .duration(200)
              .style("opacity", 0.85);
            div.html( function() { 
              return "<strong>" + d.City + "</strong>" + "<br> <font size='1'>" + 
                d[currentDate] + " pageviews </font>" +
                "<br> <font size='1'><font color='grey'> DAY 1 </font></font>"; 
            })
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
          div.transition()
              .duration(350)
              .style("opacity", 0);
        });



    // append slider
    var slider = d3.select("#slider")
            .append("input")
        .attr("class", "ui-slider-handle")
        .attr("type", "range")
        .attr("max", myMax-1)
        .attr("min", myMin)
        .style("width", String(SLIDERWIDTH) + "px")
        .property("value", myMin)
        .on("change", function(d, i) {
            myMin = this.value;
        });

    // play button
    // d3.select("#play")
    //     .attr("title", "Play")
    //     .on("click", function() {
    //         console.log("hey");
    //     });




    // update slider and bubbles (inherited from jQuery UI slider)
    function update() {

        // update slider value
        var currentDate = myMin;
        if (currentDate === myMax) {
          return false;
        }

        slider.property("value", myMin); 
        currentDate = DATES[ myMin ];
        currentLanguage = "Language" + String(currentDate);
        

        // update bubble size and colors
        d3.selectAll(".circle").transition()
            .duration(200)
            .attr("r", function(d) { return Math.log( 1+d[currentDate] ); })
            .style("fill", function(d) { return languageColors( d[currentLanguage] ); });
            // .style("stroke", function(d) { return languageColors( d[currentLanguage] ); });



        // hover labels
        bubbles
            .on("mouseover", function(d) {
                div.transition()
                  .duration(200)
                  .style("opacity", 0.85);
                div.html( function() { 
                  return "<strong>" + d.City + "</strong>" + "<br> <font size='1'>" + 
                    d[currentDate] + " pageviews </font>" +
                    "<br> <font size='1'><font color='grey'> DAY 1 </font></font>"; 
                })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                div.transition()
                  .duration(350)
                  .style("opacity", 0);
            });



        // increment
        myMin++;



    }

    // use this to activate update() (also inherited from jQuery slider)
    setInterval( function() {
        if (myMin <= myMax) {
            update();
        }
    }, 400);

    
}

// function createLegend(){

//   var legend = g.append("g").attr("id","legend").attr("transform","translate(560,10)");

//   legend.append("circle").attr("class","gain").attr("r",5).attr("cx",5).attr("cy",10)
//   legend.append("circle").attr("class","loss").attr("r",5).attr("cx",5).attr("cy",30)

//   legend.append("text").text("jobs gained").attr("x",15).attr("y",13);
//   legend.append("text").text("jobs lost").attr("x",15).attr("y",33);

//   var sizes = [ 10000, 100000, 250000 ];
//   for ( var i in sizes ){
//     legend.append("circle")
//       .attr( "r", circleSize( sizes[i] ) )
//       .attr( "cx", 80 + circleSize( sizes[sizes.length-1] ) )
//       .attr( "cy", 2 * circleSize( sizes[sizes.length-1] ) - circleSize( sizes[i] ) )
//       .attr("vector-effect","non-scaling-stroke");
//     legend.append("text")
//       .text( (sizes[i] / 1000) + "K" + (i == sizes.length-1 ? " jobs" : "") )
//       .attr( "text-anchor", "middle" )
//       .attr( "x", 80 + circleSize( sizes[sizes.length-1] ) )
//       .attr( "y", 2 * ( circleSize( sizes[sizes.length-1] ) - circleSize( sizes[i] ) ) + 5 )
//       .attr( "dy", 13)
//   }

// }




