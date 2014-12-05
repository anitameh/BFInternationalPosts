// initialize layout params
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var WIDTH = 1000 - margin.left - margin.right,
    HEIGHT = 710 - margin.bottom - margin.top;



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
    .center([-10,-45])
    .scale(230);

var path2 = d3.geo.path()
    .projection(projection2);

// panel3
var projection3 = d3.geo.mercator()
    .center([180,-27])
    .scale(200);

var path3 = d3.geo.path()
    .projection(projection3);


// create main svg
var canvas = d3.select("#vis").append("svg").attr({
    width: WIDTH + margin.left + margin.right,
    height: HEIGHT + margin.top + margin.bottom
});

var svg = canvas.append("g").attr({
    transform: "translate(" + margin.left + "," + margin.top + ")"
});

var probe, 
    hoverData;

// initialize global vars
var GLOBALMIN = 0,
    GLOBALMAX = 12941, // ******* GET THIS FROM DATA *******
    DATES,
    interval,
    FRAMELENGTH = 300,
    INCREMENT = 20,
    SLIDERWIDTH = 500,
    isPlaying = false,
    currentFrame = 0;

var dateScale,
    sliderScale,
    slider,
    sliderMargin = 65;

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
    DATES = headers.slice(0, dateLength-1); // get dates for this post

    var myMin = 0,
        myMax = DATES.length-1;

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
    
    dateScale = createDateScale(DATES)
        .range([0,500]);

    createLegend();

    createSlider();

    // animate
    d3.select("#play").on("click", function() {
        isPlaying = true;
        animate();
    });

    d3.select("#pause").on("click", function() {
        // d3.event.stopPropagation();
    });

}


// compute radius so that AREA ~ pageviews
function computeRadius(x) {
    return Math.sqrt( x/3.14 );
}

// // compute time
// function computeTime(x) {
//     xx = (x+1)/10;
//     return 100*(-Math.log(xx));
//     // return INTERVAL - x*INCREMENT;
// }

function drawDay(m, tween) {

    currentDate = DATES[ m ];
    currentLanguage = "Language" + String(currentDate);

    panel0.selectAll(".circle0")
            .transition()
            .ease("linear")
            .duration(FRAMELENGTH)
            .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
            .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

    panel0.selectAll(".circle0")
        .transition()
        .ease("linear")
        .duration(FRAMELENGTH)
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

    panel1.selectAll(".circle1")
        .transition()
        .ease("linear")
        .duration(FRAMELENGTH)
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

    panel2.selectAll(".circle2")
        .transition()
        .ease("linear")
        .duration(FRAMELENGTH)
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

    panel3.selectAll(".circle3")
        .transition()
        .ease("linear")
        .duration(FRAMELENGTH)
        .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
        .style("fill", function(d) { return languageColors( d[currentLanguage] ); });
}


function animate() {
    interval = setInterval( function() {

        currentFrame++;
        if (currentFrame == DATES.length) currentFrame = 0;
        
        slider.value(currentFrame);
        drawDay( currentFrame, true);
        
        if (currentFrame == DATES.length-1) {
            clearInterval(interval);
            return;
        }

    }, FRAMELENGTH);
}

function createSlider() {

    sliderScale = d3.scale.linear()
        .domain([0, DATES.length-1]);

    var val = slider ? slider.value() : 0;
 

    slider = d3.slider()
                .scale( sliderScale )
                .on("slide", function(event, value) {
                    if ( isPlaying ) {
                        clearInterval(interval);
                    }
                    currentFrame = Math.round(value);
                    // update to this particular date
                    console.log( "currentFrame =", currentFrame );
                    drawDay( currentFrame, d3.event.type != "drag" );
                })
                .value(val);


    d3.select("#slider-container")
        .call( slider );

    // draw labels onto slider
    var sliderAxis = d3.svg.axis()
        .scale( dateScale )
        .orient("bottom")
        .tickFormat(function(d) {
            return (d.getMonth()+1) + "/" + d.getDate(); // the +1 accounts for UTC time
        });


    d3.select("#slider-container")
        .append("svg")
        .attr("width", dateScale.range()[1])
        .attr("height", 50)
        .append("g")
            .attr("transform", "translate(0,15)")
            .attr("class", "axis")
            .call( sliderAxis );

}


function createDateScale( DATES ) {
    var start = DATES[0],
        end = DATES[DATES.length-1];

    var start_again = start.slice(0,4) + "-" + start.slice(4,6) + "-" + start.slice(6, 8),
        end_again = end.slice(0,4) + "-" + end.slice(4,6) + "-" + end.slice(6, 8);

    var start_date = new Date(start_again),
        end_date = new Date(end_again);

    return d3.time.scale()
        .domain( [start_date, end_date] );

}

// function dateLabel(m) {
//     // date label
//     var theDate = DATES[m];
//     return "<span>" + theDate + "</span>";
// }

// make legend
function createLegend() {

    var g = panel2.append("g");

    var legend = g.append("g")
        .attr("id","legend");

    // colors
    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy", 130)
        .style("fill", "#67a9cf")
        .style("fill-opacity", 0.7);
    
    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",145)
        .style("fill", "#7FFF00")
        .style("fill-opacity", 0.7);

    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",160)
        .style("fill", "yellow")
        .style("fill-opacity", 0.7);
    
    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",175)
        .style("fill", "#FF1493")
        .style("fill-opacity", 0.7);

    legend.append("circle")
        .attr("r",5)
        .attr("cx",10)
        .attr("cy",190)
        .style("fill", "#BF5FFF")
        .style("fill-opacity", 0.7);


    legend.append("text")
        .text("English")
        .attr("x",25)
        .attr("y",133);

    legend.append("text")
        .text("Espanol")
        .attr("x",25)
        .attr("y",148);

    legend.append("text")
        .text("French")
        .attr("x",25)
        .attr("y",163);

    legend.append("text")
        .text("Portuguese")
        .attr("x",25)
        .attr("y",178);

    legend.append("text")
        .text("Deutsche")
        .attr("x",25)
        .attr("y",193);

    // sizes
    var sizes = [ GLOBALMAX/5, GLOBALMAX/2, GLOBALMAX ];

    for ( var i in sizes ) {

        legend.append("circle")
            .attr("r", parseInt( computeRadius(sizeScale( sizes[i] )) ))
            .attr("cx", 5 + parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))))
            .attr("cy", -5+8.5*parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) - parseInt(computeRadius(sizeScale( sizes[i] ))) )
            .attr("vector-effect","non-scaling-stroke")
            .style("fill", "none")
            .style("stroke", "darkgrey");

        legend.append("text")
            .text("Pageviews")
            .attr("x", 17)
            .attr("y", 215);

        legend.append("text")
            .text( parseInt(sizes[i]) )
            .attr("text-anchor", "middle" )
            .attr("x", 5 + parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) )
            .attr("y", -5+8.5*parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) - 2*parseInt(computeRadius(sizeScale( sizes[i] ))) + 14.5);
    }
}

