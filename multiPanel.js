// initialize layout params
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var WIDTH = 1000 - margin.left - margin.right,
    HEIGHT = 750 - margin.bottom - margin.top;


// create main svg
var svg = d3.select("body").append("svg")
    .attr("width", WIDTH)
    .attr("height", HEIGHT);


// create svg elements for each panel
var panel0 = d3.select("#panel0").append("svg").attr({
    width: (WIDTH - 40)/2,
    height: (HEIGHT - 10)/2
});

var panel1 = d3.select("#panel1").append("svg").attr({
    width: (WIDTH - 40)/2,
    height: (HEIGHT - 10)/2
});

var panel2 = d3.select("#panel2").append("svg").attr({
    width: (WIDTH - 40)/2,
    height: (HEIGHT - 10)/2
});

var panel3 = d3.select("#panel3").append("svg").attr({
    width: (WIDTH - 40)/2,
    height: (HEIGHT - 10)/2
});


// projections for map
// KEY:  panel0 = (0,0) = North + Central America
//       panel1 = (0,1) = Western Europe
//       panel2 = (1,0) = South America
//       panel3 = (1,1) = Australasia


// panel0
var projection0 = d3.geo.mercator()     // ******* HANDLE HAWAII, ALASKA *******
    .center([-50,19])
    .scale(350);

var path0 = d3.geo.path()
    .projection(projection0);

// panel1
var projection1 = d3.geo.mercator()
    .center([45,40])
    .scale(450);

var path1 = d3.geo.path()
    .projection(projection1);

// panel2
var projection2 = d3.geo.mercator()
    .center([-10,-42])
    .scale(250);

var path2 = d3.geo.path()
    .projection(projection2);

// panel3
var projection3 = d3.geo.mercator()
    .center([180,-25])
    .scale(200);

var path3 = d3.geo.path()
    .projection(projection3);


// initialize global vars
var GLOBALMIN = 0,
    GLOBALMAX = 12941, // ******* GET THIS FROM DATA *******
    DATES,
    INTERVAL = 400,
    INCREMENT = 20,
    SLIDERWIDTH = 500;


// scales
var languageColors = d3.scale.ordinal()
      .domain(["en", "es", "fr", "pt", "de"])
      .range(["#67a9cf", "#7FFF00", "yellow", "#FF1493", "#BF5FFF"]);
      
var sizeScale = d3.scale.linear()
    .domain([GLOBALMIN, GLOBALMAX])
    .range([0, 4000]);



// load data
queue()
    .defer(d3.json, "new-data/world-50m.json")
    .defer(d3.csv, "new-data/panel0-data.csv")
    .defer(d3.csv, "new-data/panel1-data.csv")
    .defer(d3.csv, "new-data/panel2-data.csv")
    .defer(d3.csv, "new-data/panel3-data.csv")
    .await(ready);



function ready(error, world, PV0, PV1, PV2, PV3) {

    // draw world map
    panel0.selectAll("path")
      .data(topojson.object(world, world.objects.countries).geometries)
          .enter().append("path")
              .attr("d", path0)
              .attr("class", "country");

    panel1.selectAll("path")
      .data(topojson.object(world, world.objects.countries).geometries)
          .enter().append("path")
              .attr("d", path1)
              .attr("class", "country");

    panel2.selectAll("path")
      .data(topojson.object(world, world.objects.countries).geometries)
          .enter().append("path")
              .attr("d", path2)
              .attr("class", "country");

    panel3.selectAll("path")
      .data(topojson.object(world, world.objects.countries).geometries)
          .enter().append("path")
              .attr("d", path3)
              .attr("class", "country");



    // create bubbles for initial view // ****** MOVE THIS TO UPDATE (DON'T NEED IT HERE) *******
    var headers = d3.keys( PV0[0] );
    var dateLength = (headers.length-2)/2; // always even because each date col has a corresponding language col
    DATES = headers.slice(0, dateLength); // get dates for this post

    var myMin = 0,
        myMax = DATES.length-1;
        // SLIDERWIDTH = DATES.length*20;



    var currentDate = DATES[0];
    var currentLanguage = "Language" + String(currentDate);

    var bubbles0 = panel0.selectAll("circle")
        .data( PV0 )
        .enter().append("circle")
        .attr("cx", function(d) { return projection0([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
        .attr("cy", function(d) { return projection0([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .attr("class", "circle0");

    var bubbles1 = panel1.selectAll("circle")
        .data( PV1 )
        .enter().append("circle")
        .attr("cx", function(d) { return projection1([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
        .attr("cy", function(d) { return projection1([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .attr("class", "circle1");

    var bubbles2 = panel2.selectAll("circle")
        .data( PV2 )
        .enter().append("circle")
        .attr("cx", function(d) { return projection2([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
        .attr("cy", function(d) { return projection2([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .attr("class", "circle2");

    var bubbles3 = panel3.selectAll("circle")
        .data( PV3 )
        .enter().append("circle")
        .attr("cx", function(d) { return projection3([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
        .attr("cy", function(d) { return projection3([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .attr("class", "circle3");



    // add tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);



    // create slider
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



    // create legend
    createLegend();


    // update 
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
        d3.selectAll(".circle0").transition()
            .duration(200)
            .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
            .style("fill", function(d) { return languageColors( d[currentLanguage] ); });


        d3.selectAll(".circle1").transition()
            .duration(200)
            .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
            .style("fill", function(d) { return languageColors( d[currentLanguage] ); });


        d3.selectAll(".circle2").transition()
            .duration(200)
            .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
            .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

        d3.selectAll(".circle3").transition()
            .duration(200)
            .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
            .style("fill", function(d) { return languageColors( d[currentLanguage] ); });


        // update
        myMin++;
    }


    // move slider (setInterval inherited from jQuery)
    setInterval( function() {
        if (myMin <= myMax-1) {
            console.log("myMin =", myMin);
            update();
        }
    }, 100);   

    
}


// compute radius so that AREA ~ pageviews
function computeRadius(x) {
    return Math.sqrt( x/3.14 );
}


// compute time
function computeTime(x) {
    xx = (x+1)/10;
    return 100*(-Math.log(xx));
    // return INTERVAL - x*INCREMENT;
}

// make legend (size)
function createLegend() {

    var g = panel2.append("g");

    var legend = g.append("g")
        .attr("id","legend");

    // colors
    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy", 150)
        .style("fill", "#67a9cf")
        .style("fill-opacity", 0.7);
    
    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",165)
        .style("fill", "#7FFF00")
        .style("fill-opacity", 0.7);

    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",180)
        .style("fill", "yellow")
        .style("fill-opacity", 0.7);
    
    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",195)
        .style("fill", "#FF1493")
        .style("fill-opacity", 0.7);

    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",210)
        .style("fill", "#BF5FFF")
        .style("fill-opacity", 0.7);


    legend.append("text")
        .text("English")
        .attr("x",25)
        .attr("y",153);

    legend.append("text")
        .text("Espanol")
        .attr("x",25)
        .attr("y",168);

    legend.append("text")
        .text("French")
        .attr("x",25)
        .attr("y",183);

    legend.append("text")
        .text("Portuguese")
        .attr("x",25)
        .attr("y",198);

    legend.append("text")
        .text("Deutsche")
        .attr("x",25)
        .attr("y",213);

    // sizes
    var sizes = [ GLOBALMAX/5, GLOBALMAX/2, GLOBALMAX ];

    for ( var i in sizes ) {

        legend.append("circle")
            .attr("r", parseInt( computeRadius(sizeScale( sizes[i] )) ))
            .attr("cx", 5 + parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))))
            .attr("cy", 20 + 8.5*parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) - parseInt(computeRadius(sizeScale( sizes[i] ))) )
            .attr("vector-effect","non-scaling-stroke")
            .style("fill", "none")
            .style("stroke", "darkgrey");

        legend.append("text")
            .text("Pageviews")
            .attr("x", 17)
            .attr("y", 238);

        legend.append("text")
            .text( parseInt(sizes[i]) )
            .attr("text-anchor", "middle" )
            .attr("x", 5 + parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) )
            .attr("y", 20 + 8.5*parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) - 2*parseInt(computeRadius(sizeScale( sizes[i] ))) + 14.5);
    }
}


