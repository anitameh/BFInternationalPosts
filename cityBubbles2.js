/**
 * @author: Anita Mehrotra
 * @date: November 14, 2014
 */

// init: set up svg and map params
var width = 960,
  height = 600;

var projection = d3.geo.mercator()
    .center([0,20])
    .scale(150);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var path = d3.geo.path()
    .projection(projection);

// initialize global variables
var SLIDERWIDTH = 500,
    GLOBALMIN = 0,
    GLOBALMAX = 12941;

// load and display the World
queue()
    .defer(d3.json, "new-data/world-50m.json")
    .defer(d3.json, "new-data/all-city-language-data.js")
    .defer(d3.csv, "new-data/cities.csv")
    .await(ready);


// create viz
function ready(error, world, PV, cities) {




    // initialize variables
    var myMin = 0,
        myMax = PV.length;



    // scales
    var sizeScale = d3.scale.linear()
        .domain([GLOBALMIN, GLOBALMAX])
        .range([0, 100]);



    // add tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);



    // draw world map
    svg.selectAll("path")
      .data(topojson.object(world, world.objects.countries).geometries)
          .enter().append("path")
              .attr("d", path)
              .attr("class", "country");



    // console.log(pageviews[0]);
    var currentDate = 0;
    var currentData = (PV[ currentDate ].info)[0].pageviews; // 0 => we are assuming the post was first written in english

    var bubbles = svg.selectAll("circle")
        .data( currentData )
        .enter().append("circle")
        .attr("cx", function(d) { return projection([d.LON, d.LAT])[0]; })
        .attr("cy", function(d) { return projection([d.LON, d.LAT])[1]; })
        .attr("r", function(d) { return sizeScale( d.pv ); })
        .attr("class", "circle");



    // hover labels
    bubbles
        .on("mouseover", function(d) {
          div.transition()
              .duration(200)
              .style("opacity", 0.85);
          div.html( function() { 
              return "<strong>" + d.city + "</strong>" + "<br> <font size='1'>" + 
                d.pv + " pageviews </font>" +
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
    d3.select("#play")
        .attr("title", "Play")
        .on("click", function() {
            console.log("hey");
        });




    // update slider and bubbles (inherited from jQuery UI slider)
    // function update() {

    //     // update slider value
    //     var currently = myMin;
    //     if (currently === myMax) {
    //       return false;
    //     }

    //     slider.property("value", myMin); 

    //     // get pageviews info
    //     var currentdate = pageviews[currently].week;
    //     var currentPvs = [];
    //     pageviews.forEach(function(d) {
    //         if (d.week == currentdate) {
    //             pvs = (d.info[0]).pageviews;
    //             pvs.forEach(function(dd) {
    //                 currentPvs[dd.city] = dd.pv;
    //             });
    //         }
    //     });

    //     // update bubble size
    //     d3.selectAll(".circle").transition()
    //         .duration(200)
    //         .attr("r", function(d, i) {
    //             return sizeScale( currentPvs[d.City] );
    //         });
    //         // .attr("fill", function() {
    //         //   return colorScale( )
    //         // });


    //     // update hover tools
    //     bubbles
    //         .on("mouseover", function(d) {
    //           div.transition()
    //               .duration(200)
    //               .style("opacity", 0.85);
    //           div.html( function() { 
    //               return "<strong>" + d.City + "</strong>" + "<br> <font size='1'>" + 
    //                 currentPvs[d.City] + " pageviews </font>" +
    //                 "<br> <font size='1'><font color='grey'> DAY " + String(currently) + "</font></font>"; 
    //             })
    //             .style("left", (d3.event.pageX) + "px")
    //             .style("top", (d3.event.pageY - 28) + "px");
    //         })
    //         .on("mouseout", function(d) {
    //           div.transition()
    //               .duration(350)
    //               .style("opacity", 0);
    //         });

    //     myMin++;



    // }

    // // use this to activate update() (also inherited from jQuery slider)
    // setInterval( function() {
    //     if (myMin <= myMax) {
    //         update();
    //     }
    // }, 400);

    
}