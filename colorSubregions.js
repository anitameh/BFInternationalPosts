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


// color scale
var color = d3.scale.ordinal()
	.domain(["en", "es", "pt", "de", "fr"])
	.range(["Indigo", "Crimson", "Gold", "ForestGreen", "Blue"]);

var englishColors = d3.scale.quantize()
    .range(colorbrewer.Blues[11]);

var espanolColors = d3.scale.quantize()
    .range(colorbrewer.Greens[10]);

var frenchColors = d3.scale.quantize()
    .range(colorbrewer.YlOrBr[3]);

var portugueseColors = d3.scale.quantize()
    .range(colorbrewer.Reds[3]);

var deutscheColors = d3.scale.quantize()
    .range(colorbrewer.Purples[5]);

var firstScale = d3.scale.linear()
    .range([0, 1]);

var langFull = ["English", "Espanol", "French", "Portuguese", "Deutsche"];

var firstWeekOfYear,
    firstCol,
    lastCol,
    langMin = [],
    langMax = [];

// load data
queue()
    .defer(d3.json, "data/world-50m.json")
    .defer(d3.json, "data/aggregated-data.js")
    .defer(d3.csv, "data/unique-countries.csv")
    .await(ready);


function ready(error, world, pageViews, uniqueCountries) {

    // get label
    // var label = d3.select("#week");

	// draw map
	var countries = topojson.feature(world, world.objects.countries).features;

    // get country ids for countries that viewed content at some point
    var justids = [];
    uniqueCountries.forEach(function(d) {
        justids.push(parseInt(d.id));
    });


    // get min + max pageviews
    firstCol = pageViews[0].info;
    lastCol = pageViews[4].info;
    for (var j=0; j<lastCol.length; j++) {
        // get min
        var firstInfo = firstCol[j].pageviews;
        langMin.push( d3.min(firstInfo, function(d) { return d.pv }) );
        // get max
        var lastInfo = lastCol[j].pageviews;
        langMax.push( d3.max(lastInfo, function(d) { return d.pv; }) );
    }

    
    // initially color based on color of language
    firstWeekOfYear = pageViews[0].week;
    var firstColoredMap = makeColorMap(0);
    var englishIds = firstColoredMap[0],
        englishPvs = firstColoredMap[1],
        espanolIds = firstColoredMap[2],
        espanolPvs = firstColoredMap[3],
        frenchIds = firstColoredMap[4],
        frenchPvs = firstColoredMap[5],
        portugueseIds = firstColoredMap[6],
        portuguesePvs = firstColoredMap[7]
        deutscheIds = firstColoredMap[8],
        deutschePvs = firstColoredMap[9];
        

    // draw initial world map with initial colors
    svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path)
      .style("fill", function(d, i) {
        if ( justids.indexOf(d.id) != -1 ) {
            if (englishIds.indexOf(d.id) != - 1) {
                return d.color = englishColors( englishPvs[d.id] );
            }
            else if (espanolIds.indexOf(d.id) != - 1) {
                return d.color = espanolColors( espanolPvs[d.id] );
            }
            else if (frenchIds.indexOf(d.id) != - 1) {
                return d.color = frenchColors( frenchPvs[d.id] );

            }
            else if (portugueseIds.indexOf(d.id) != - 1) {
                return d.color = portugueseColors( portuguesePvs[d.id] );

            }
            else if (deutscheIds.indexOf(d.id) != - 1) {
                return d.color = deutscheColors( deutschePvs[d.id] );

            }
        }
      })
      .style("opacity", "0.75");    

    // add legend
    drawLegend();

    // make slider
    var pvMax = d3.max(pageViews, function(d) { return d.week }), 
        pvMin = d3.min(pageViews, function(d) { return d.week });

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
    function update() {

        // label.text(pvMin); // update label

        var currentWeek = pvMin - firstWeekOfYear;
        var coloredMap = makeColorMap(currentWeek);
        var englishIds = coloredMap[0],
            englishPvs = coloredMap[1],
            espanolIds = coloredMap[2],
            espanolPvs = coloredMap[3],
            frenchIds = coloredMap[4],
            frenchPvs = coloredMap[5],
            portugueseIds = coloredMap[6],
            portuguesePvs = coloredMap[7]
            deutscheIds = coloredMap[8],
            deutschePvs = coloredMap[9];


        slider.property("value", pvMin); // set slider

        d3.selectAll(".country").transition()
            .duration(200)
            .style("fill", function(d, i) {
                if ( justids.indexOf(d.id) != -1 ) {
                    if (englishIds.indexOf(d.id) != - 1) {
                        return d.color = englishColors( englishPvs[d.id] );
                    }
                    else if (espanolIds.indexOf(d.id) != - 1) {
                        return d.color = espanolColors( espanolPvs[d.id] );
                    }
                    else if (frenchIds.indexOf(d.id) != - 1) {
                        return d.color = frenchColors( frenchPvs[d.id] );
                        
                    }
                    else if (portugueseIds.indexOf(d.id) != - 1) {
                        return d.color = portugueseColors( portuguesePvs[d.id] );

                    }
                    else if (deutscheIds.indexOf(d.id) != - 1) {
                        return d.color = deutscheColors( deutschePvs[d.id] );
                    }
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
    

    function makeColorMap(i) {

        var initView = pageViews[i].info;

        // English
        var english = initView[0].pageviews;
        var englishIds = [];
        var englishPvs = [];
        english.forEach(function(d) {
            englishIds.push( d.id );
            if (d.pv != 0) {
                englishPvs[d.id] = d.pv;
            }
        });
        var enMin = langMin[0];
        var enMax = langMax[0];
        englishColors.domain([enMin, enMax]);

        // Spanish
        var espanol = initView[1].pageviews;
        var espanolIds = [];
        var espanolPvs = [];
        espanol.forEach(function(d) {
            espanolIds.push( d.id );
            espanolPvs[d.id] = d.pv;
        });
        var esMin = langMin[1];
        var esMax = langMax[1];
        espanolColors.domain([esMin, esMax]);

        // French
        var french = initView[2].pageviews;
        var frenchIds = [];
        var frenchPvs = [];
        french.forEach(function(d) {
            frenchIds.push( d.id );
            frenchPvs[d.id] = d.pv;
        });
        var frMin = langMin[2];
        var frMax = langMax[2];
        frenchColors.domain([frMin, frMax]);

        // Portuguese
        var portuguese = initView[3].pageviews;
        var portugueseIds = [];
        var portuguesePvs = [];
        portuguese.forEach(function(d) {
            portugueseIds.push( d.id );
            portuguesePvs[d.id] = d.pv;
        });
        var ptMin = langMin[3];
        var ptMax = langMax[3];
        portugueseColors.domain([ptMin, ptMax]);

        // German
        var deutsche = initView[4].pageviews;
        var deutscheIds = [];
        var deutschePvs = [];
        deutsche.forEach(function(d) {
            deutscheIds.push( d.id );
            deutschePvs[d.id] = d.pv;
        });
        var deMin = langMin[4];
        var deMax = langMax[4];
        deutscheColors.domain([deMin, deMax]);

        return [englishIds, englishPvs, espanolIds, espanolPvs, frenchIds, frenchPvs, 
            portugueseIds, portuguesePvs, deutscheIds, deutschePvs];
    }
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




