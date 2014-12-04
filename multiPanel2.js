// initialize layout params
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var WIDTH = 1000 - margin.left - margin.right,
    HEIGHT = 750 - margin.bottom - margin.top;



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
    FRAMELENGTH = 500,
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


    // add probe to map-container
    probe = d3.select("svg").append("div")
        .attr("id", "probe");

    // ??
    // d3.select("body")
    //     .append("div")
    //     .attr("id","loader")
    //     .style("top",d3.select("#play").node().offsetTop + "px");
        // .style("height",d3.select("#date").node().offsetHeight + d3.select("#map-container").node().offsetHeight + "px");


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

    
    dateScale = createDateScale(DATES)
        .range([0,500]);

    createLegend();

    createSlider();
}
//     var bubbles1 = panel1.selectAll("circle")
//         .data( PV1 )
//         .enter().append("circle")
//         .attr("cx", function(d) { return projection1([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
//         .attr("cy", function(d) { return projection1([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
//         .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//         .attr("class", "circle1");

//     var bubbles2 = panel2.selectAll("circle")
//         .data( PV2 )
//         .enter().append("circle")
//         .attr("cx", function(d) { return projection2([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
//         .attr("cy", function(d) { return projection2([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
//         .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//         .attr("class", "circle2");

//     var bubbles3 = panel3.selectAll("circle")
//         .data( PV3 )
//         .enter().append("circle")
//         .attr("cx", function(d) { return projection3([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
//         .attr("cy", function(d) { return projection3([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
//         .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//         .attr("class", "circle3");



//     createSlider();

//     // play button
//     d3.select("#play")
//       .attr("title","Play animation")
//       .on("click",function(){
//         if ( !isPlaying ){
//           isPlaying = true;
//           d3.select(this).classed("pause",true).attr("title","Pause animation");
//           animate();
//         } else {
//           isPlaying = false;
//           d3.select(this).classed("pause",false).attr("title","Play animation");
//           clearInterval( interval );
//         }
//       });    

//     drawDay( currentFrame );

//     // window.onresize = resize;
//     // resize();

// }


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

// function drawDay(m) {

//     currentDate = DATES[ m ];
//     currentLanguage = "Language" + String(currentDate);

//     if ( tween ) {
//         // update bubbles
//         panel0.selectAll(".circle0")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//         panel1.selectAll(".circle1")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//         panel2.selectAll(".circle2")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//         panel3.selectAll(".circle3")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//     } else {
//         // still update bubbles
//         panel0.selectAll(".circle0")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//         panel1.selectAll(".circle1")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//         panel2.selectAll(".circle2")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });

//         panel3.selectAll(".circle3")
//             .transition()
//             .ease("linear")
//             .duration(FRAMELENGTH)
//             .attr("r", function(d) { return computeRadius(sizeScale( d[currentDate] )); })
//             .style("fill", function(d) { return languageColors( d[currentLanguage] ); });
//     }
//     // update date
//     d3.select("#date p#month").html( dateLabel(m) );

//     if (hoverData) {
//         setProbeContent( hoverData );
//     }
// }

// function animate() {
//     interval = setInterval( function() {

//         currentFrame++; // increment
//         if (currentFrame == DATES.length) currentFrame = 0; // stop at last date

//         d3.select("#slider-div .d3-slider-handle")
//             .style("left", 100*currentFrame/DATES.length + "%");

//         // update slider and drawing
//         slider.value(currentFrame);
//         drawDay( currentFrame, true );

//         if (currentFrame == DATES.length-1) {
//             isPlaying = false;
//             d3.select("#play").classed("pause", false).attr("title", "Play animation");
//             clearInterval( interval );
//             return;
//         }

//     }, FRAMELENGTH);
// }

function createSlider() {

    sliderScale = d3.scale.linear()
        .domain([0, DATES.length-1]);

    var val = slider ? slider.value() : 0;

    // ORIGINAL CODE
    // slider = d3.slider()
    //     .scale( sliderScale )
    //     .on("slide", function(event, value) {
    //         if (isPlaying) {
    //             clearInterval( interval );
    //         }
    //         currentFrame = value;
    //         drawDay( currentFrame, d3.event.type != "drag" );
    //     })
    //     .on("slideend", function() {
    //         if ( isPlaying ) animate();
    //         d3.select("#slider-div").on("mousemove", sliderProbe);
    //     })
    //     .on("slidestart", function() {
    //         d3.select("#slider-div").on("mousemove", null);
    //     })
    //     .value(val);

    d3.select('#slider-container').call( d3.slider() );

    // d3.select("#slider-div").remove();

    // d3.select("#slider-container")
    //     .append("div")
    //     .attr("id", "slider-div")
    //     .style("width", dateScale.range()[1] + "px")
    //     .on("mousemove", sliderProbe)
    //     .on("mouseout", function() {
    //         d3.select("#slider-probe").style("display", "none");
    //     })
    //     .call(slider);



    // d3.select("#slider-div a").on("mousemove", function() {
    //     d3.event.stopPropagation();
    // });

    // draw labels onto slider
    var sliderAxis = d3.svg.axis()
        .scale( dateScale )
        .orient("bottom")
        .tickFormat(function(d) {
            console.log( (d.getMonth()+1) + "/" + d.getDate() );
            return (d.getMonth()+1) + "/" + d.getDate();
        });

//     // remove old axis on each iteration
//     d3.select("#axis").remove();

    d3.select("#slider-container")
        .append("svg")
        .attr("width", dateScale.range()[1])
        .attr("height", 50)
        .append("g")
            .attr("transform", "translate(0,15)")
            .attr("class", "axis")
            .call( sliderAxis );

}

// function setProbeContent(d) {
//     // hover tip
//     var html = "<strong>" + d.City + "</strong><br> <font size='1'>" + 
//                 d[currentDate] + " pageviews </font>" +
//                 "<br> <font size='1'><font color='grey'> DAY 1 </font></font>";
// }

// function sliderProbe() {
//     var d = dateScale.invert( (d3.mouse(this)[0]) );

//     d3.select("#slider-probe")
//         .style("left", d3.mouse(this)[0] + sliderMargin + "px")
//         .style("display", "block")
//         .select("p")
//         .html( "heyyy" );
// }

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

