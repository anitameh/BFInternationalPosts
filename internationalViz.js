/*
 * @author: Anita Mehrotra
 * @date: December 8, 2014
 * @project: BF International Viz
*/

// ******* HANDLE HAWAII, ALASKA **************
// KEY:  panel0 = (0,0) = North + Central America
//       panel1 = (0,1) = Western Europe
//       panel2 = (1,0) = South America
//       panel3 = (1,1) = Australasia
// ********************************************



function init() {

    var margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    var WIDTH = 1000 - margin.left - margin.right,
        HEIGHT = 710 - margin.bottom - margin.top,
        centerX = [-50, 45, -10, 180],
        centerY = [19, 40, -45, -33],
        zoom = [350, 450, 230, 200];

    // create svg elements for each panel
    panels = [];
    for (var i=0; i<4; i++) {
        var selector = '#panel' + i;
        var panel = d3.select(selector).append('svg').attr({
            width: (WIDTH - 40)/2,
            height: (HEIGHT - 10)/2
        });

        panels.push( panel );
    }

    // generate projections for each panel
    projections = [];
    for (var i=0; i<4; i++) {
        var projection = d3.geo.mercator()
            .center([ centerX[i], centerY[i] ])
            .scale( zoom[i] );

        projections.push( projection );
    }

    // draw paths
    paths = [];
    for (var i=0; i<4; i++) {
        var path = d3.geo.path()
            .projection( projections[i] );

        paths.push( path );
    }

    // create main svg
    var canvas = d3.select('#vis').append('svg').attr({
        width: WIDTH + margin.left + margin.right,
        height: HEIGHT + margin.top + margin.bottom
    });

    var svg = canvas.append('g').attr({
        transform: 'translate(' + margin.left + ',' + margin.top + ')'
    });
}


// initialize global vars
var GLOBALMIN = 0,
    GLOBALMAX,
    DATES,
    FRAMELENGTH = 450,
    INCREMENT = 20,
    SLIDERWIDTH = 500,
    isPlaying = false,
    currentFrame = 0,
    dateScale,
    sliderScale,
    slider,
    sliderMargin = 65,
    probe,
    hoverData,
    panels, 
    projections, 
    paths;


// scales
var languageColors = d3.scale.ordinal()
      .domain(['en', 'es', 'fr', 'pt', 'de'])
      .range(['cornflowerblue', '#FF1493', 'coral', 'gold', 'olivedrab']);

var sizeScale;

var monthLabels = d3.scale.ordinal()
      .domain([1,2,3,4,5,6,7,8,9,10,11,12])
      .range(['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']);


// load data
queue()
    .defer(d3.json, 'world-50m.json')
    .defer(d3.csv, 'thedress-data/acceleration/panel0-new-data.csv')
    .defer(d3.csv, 'thedress-data/acceleration/panel1-new-data.csv')
    .defer(d3.csv, 'thedress-data/acceleration/panel2-new-data.csv')
    .defer(d3.csv, 'thedress-data/acceleration/panel3-new-data.csv')
    .await(ready);


var circles = [];

function ready(error, world, PV0, PV1, PV2, PV3) {

    // initialize some variables
    var tooltipData;
    var PVs = [PV0, PV1, PV2, PV3];
    var timer = 0;
    
    init(); // draw panels

    // draw parts of world map in each panel
    for (var i=0; i<4; i++) {
        panels[i].selectAll('path')
          .data(topojson.object(world, world.objects.countries).geometries)
              .enter().append('path')
                  .attr('d', paths[i])
                  .attr('class', 'country');
    }

    // tooltip prep
    var div = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    // bubble prep for initial view
    var headers = d3.keys( PV0[0] );
    var dateLength = (headers.length-2)/2; // always even because each date col has a corresponding language col
    DATES = headers.slice(0, dateLength-1); // get dates for this post

    var myMin = 0,
        myMax = DATES.length-1;

    var currentDate = DATES[0];
    var currentLanguage = 'Language' + currentDate;


    // get global max
    var allvals = [];
    for (var j=0; j<4; j++) {
        PVs[j].forEach(function(d) {
            for (var i=0; i<DATES.length; i++) {
                allvals.push( parseInt(d[ DATES[i] ]) );
            }  
        });
    }
    GLOBALMAX = d3.max(allvals);


    // now set sizeScale
    sizeScale = d3.scale.linear()
        .domain([GLOBALMIN, GLOBALMAX])
        .range([0, 4000]);

    // draw them
    for (var i=0; i<4; i++) {
        var bubbles = panels[i].selectAll('circle')
            .data( PVs[i] )
            .enter().append('circle')
            .attr('cx', function(d) { return projections[i]([parseFloat(d.Longitude), parseFloat(d.Latitude)])[0]; })
            .attr('cy', function(d) { return projections[i]([parseFloat(d.Longitude), parseFloat(d.Latitude)])[1]; })
            .attr('r', function(d) { return computeRadius(sizeScale( d[currentDate] )); })
            .attr('class', 'circle');

        bubbles
            .on('mouseover', function(d) {
                div.transition()
                    .duration(200)
                    .style('opacity', 0.85);

                tooltipData = {
                    'data':d,
                    'pos': {
                        'x': d3.event.pageX + 'px',
                        'y': (d3.event.pageY-28) + 'px'
                    }
                };
            })
            .on('mouseout', function(d) {
                tooltipData = null;
                div.transition()
                    .duration(350)
                    .style('opacity', 0);
                
            });

        circles.push(bubbles);
    }


    // update tooltip *while* hovering over bubbles
    function drawTooltip() {
        if (tooltipData) {
            div.html( function() {
                return '<strong>' + tooltipData.data.city + '</strong> <br> <font size="1">' +
                    parseInt(tooltipData.data[currentDate]) + ' PVs/day </font>' +
                    '<br> <font size="1"><font color="grey"> DAY ' + (DATES.indexOf(currentDate)+1) + '</font></font>'; 
            })
            .style('left', tooltipData.pos.x)
            .style('top', tooltipData.pos.y)
            .style("font-size", function(d) {
                if ((tooltipData.data.city).length > 11) {
                    return (10 + (tooltipData.data.city).length%10/5.5) + 'px'; // resize font if city name is long
                }   
            });
        }
        requestAnimationFrame(drawTooltip);
    }

    requestAnimationFrame(drawTooltip);


    dateScale = createDateScale(DATES)
        .range([0,SLIDERWIDTH]);

    createLegend();


    // animation button
    d3.select('#play-toggle').on('click', function() {

        isPlaying = !isPlaying;
        if (isPlaying) {
            animate();
            d3.select('.dateactive').classed('dateactive', false);
        }

        // change class of button (i.e. change image to pause)
        var toRemove = isPlaying ? 'fa-play' : 'fa-pause';
        var toAdd = isPlaying ? 'fa-pause' : 'fa-play';
        var icon = this.querySelector('i'); // get current class
        
        icon.classList.remove(toRemove); // remove the right one
        icon.classList.add(toAdd); // add the right one

    });


    function drawDay(m, tween) {
        currentDate = DATES[ m ];
        currentLanguage = 'Language' + currentDate;

        for (var i=0; i<4; i++) {
            circles[i]
                .transition()
                .ease('linear')
                .duration(FRAMELENGTH)
                .attr('r', function(d) { return computeRadius(sizeScale( d[currentDate] )); })
                .style('fill', function(d) { return languageColors( d[currentLanguage] ); });
        }

        dateLabel(m); // update big date on LHS
    }


    function showCycle() {
        // cycle over all frames
        currentFrame++;
        currentFrame = currentFrame % DATES.length; // continue looping until pause pressed
        drawDay( currentFrame, true );

        if (isPlaying) {
            timer = setTimeout(showCycle, FRAMELENGTH);
        }
    }


    function animate() {
        requestAnimationFrame(showCycle); // requestAnimationFrame optimizes re-drawing with page paint
    }

    // add DIVs with dates
    var dateDiv = d3.select('body').append('div')
        .data(DATES)
        .enter()
        .append('div')
            .attr('class', 'date')
            .style('left', function(d, i) { 
                return ((SLIDERWIDTH/DATES.length)*i + 'px'); 
            })
            .text( function(d, i) { 
                return d.slice(4,6) + '/' + d.slice(6,8); 
            })
        .on('click', clicked); 


    function clicked(d) {
        // select date div and highlight it
        d3.select('.date.dateactive').classed('dateactive', false);
        d3.select(this).classed('dateactive', true);

        currentFrame = DATES.indexOf(d);

        drawDay(currentFrame);
    };

    

    function startAnimation() {
        showCycle();
    }

    function pauseAnimation() {
        clearTimeout(timer);
    }

}


// OTHER FUNCTIONS

// create date scale
function createDateScale( DATES ) {
    var start = DATES[0],
        end = DATES[DATES.length-1];

    var start_again = createDate(start),
        end_again = createDate(end);

    var start_date = new Date(start_again);
        // end_date = new Date(end_again);
    var end_date = new Date('2015-03-02');

    return d3.time.scale()
        .domain([start_date, end_date]);
}

// create a date out of date string YYYYMMDD
function createDate( dateStr ) {

    var choppedDate = dateStr.slice(0,4) + '-' + dateStr.slice(4,6) + '-' + (parseInt(dateStr.slice(6, 8))+1).toString();
    return new Date( choppedDate );
}

// create labels for axis
function dateLabel(m) {

    // date label
    var month = monthLabels( parseInt(DATES[m].slice(4,6)) ),
        day = DATES[m].slice(6,8)
        year = DATES[m].slice(0,4);

    d3.select('#date p#month')
        .text( month + ' ' + day + ' ' + year );

}

// make legend
function createLegend() {

    var g = panels[2].append('g');

    var legend = g.append('g')
        .attr('id','legend');

    var languages = ['English', 'Espanol', 'French', 'Portuguese', 'Deutsche'];

    // LEGEND 1
    legend.append('text')
        .text('LANGUAGE')
        .attr('x', 15)
        .attr('y', 25)
        .style('font-weight', 'bold');

    for (var j=0; j<5; j++) {
        // color circles
        legend.append('circle')
            .attr('r', 15)
            .attr('cx', 30)
            .attr('cy', 45 + j*35)
            .style('fill', languageColors.range()[j])
            .style('fill-opacity', 0.7);
        // legend text
        legend.append('text')
            .text(languages[j])
            .attr('x', 50)
            .attr('y', 49 + j*35);
    }

    // LEGEND 2
    legend.append('text')
        .text('PAGEVIEWS/DAY')
        .attr('x', 13)
        .attr('y', 225)
        .style('font-weight', 'bold');

    var sizes = [ GLOBALMAX/5, GLOBALMAX/2, GLOBALMAX ];
    for ( var i in sizes ) {
        // size circles
        legend.append('circle')
            .attr('r', parseInt( computeRadius(sizeScale( sizes[i] )) ))
            .attr('cx', 20 + parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))))
            .attr('cy', 8.5*parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) - parseInt(computeRadius(sizeScale( sizes[i] ))) )
            .attr('vector-effect','non-scaling-stroke')
            .style('fill', 'none')
            .style('stroke', 'darkgrey');
        
        legend.append('text')
            .text( roundUp(parseInt(sizes[i])) )
            .attr('text-anchor', 'middle' )
            .attr('x', 20 + parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) )
            .attr('y', 8.5*parseInt(computeRadius(sizeScale( sizes[sizes.length-1] ))) - 2*parseInt(computeRadius(sizeScale( sizes[i] ))) + 14.5)
            .style('font-size', '11');
    }
}

// round up legend labels
function roundUp(x) {
    return 1000*Math.ceil(x/1000);
}


// compute radius so that AREA ~ pageviews
function computeRadius(x) {
    return Math.sqrt( x/3.14 );
}
