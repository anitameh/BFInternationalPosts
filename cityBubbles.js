/**
 * @author: Anita Mehrotra
 * @date: November 14, 2014
 */

// init: set up svg and map params
var width = 960,
	height = 600,
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


// color scales
var englishColors = d3.scale.quantize()
    .range(colorbrewer.Blues[10]);

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

var firstCol,
    lastCol,
    langMin = [],
    langMax = [], 
    uniqueCountries = [],
    remainingIds = [];


// load data
d3.json("new-data/totals-daily-city.js", function(error, data) {
	
	console.log("error");
	console.log(error);
	
	console.log("data");
	console.log(data);
})

// load data
queue()
    .defer(d3.json, "new-data/world-50m.json")
    .defer(d3.json, "new-data/totals-daily-city.js")
    .await(ready);


function ready(error, world, pageViews) {

	console.log("pageViews");
	console.log(pageViews);

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
        var mymin = d3.min(firstInfo, function(d) { return d.pv });
        langMin.push( myLog(mymin) );

        // get max
        var lastInfo = lastCol[j].pageviews;
        var mymax = d3.max(lastInfo, function(d) { return d.pv; });
        langMax.push( myLog(mymax) );
    }

    // first view
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
        
	// add tooltip
	var div = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

    // draw base world map
    var drawCountries = svg.selectAll(".country")
	      .data(countries)
	    .enter().insert("path", ".graticule")
	      .attr("class", "country")
	      .attr("d", path)
	      .style("opacity", "0.75");    


	// add tooltip on hover
	drawCountries
		.on("mouseover", function(d) {
			div.transition()
				.duration(200)
				.style("opacity", 0.85);
			div.html( function() {
				if (uniqueCountries[d.id] != -1) return (uniqueCountries[d.id].name).toUpperCase(); 
				})
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			div.transition()
				.duration(350)
				.style("opacity", 0);
		});

	svg.append("path")
			.datum(graticule)
			.attr("class", "graticule")
			.attr("d", path);

	svg.append("path")
			.datum(graticule.outline)
			.attr("class", "graticule outline")
			.attr("d", path);


	
	// draw city points
	for (var i in pageViews) {

		var projected = projection([ parseFloat(pageViews[i].) ])

	}


	// add legend
	drawLegend();


    // add slider
    var pvMax = pageViews.length-1, 
        pvMin = 0,
        sliderWidth = 400;

    var slider = d3.select("#slider")
            .append("input")
        .attr("class", "ui-slider-handle")
        .attr("type", "range")
        .attr("max", pvMax)
        .attr("min", pvMin)
        .style("width", String(sliderWidth) + "px")
        .property("value", pvMin)
        .on("change", function(d, i) {
            pvMin = this.value;
        });

    // label slider
   	var dateMin = String(d3.min(pageViews, function(d) { return d.week; })),
   		dateMax = String(d3.max(pageViews, function(d) { return d.week; }));

   	dateMin = new Date( dateMin.slice(0,4) + "-" + dateMin.slice(4,6) + "-" + dateMin.slice(6,8));
   	dateMax = new Date( dateMax.slice(0,4) + "-" + dateMax.slice(4,6) + "-" + dateMax.slice(6,8));

   	// this is super hacky
   	svg.append("text")
		.attr("x", width/2 - sliderWidth/2 - 30)
		.attr("y", 9)   		
   		.text( String(dateMin).slice(0,16) )
   		.attr("font-family", "Trebuchet MS, Helvetica, sans-serif")
   		.attr("font-size", "11px");

   	svg.append("text")
		.attr("x", width/2 + sliderWidth/2 - 30)
		.attr("y", 9)   		
   		.text( String(dateMax).slice(0,16) )
   		.attr("font-family", "Trebuchet MS, Helvetica, sans-serif")
   		.attr("font-size", "11px");



    // update (inherited from jQuery UI slider)
    function update() {

        var currentWeek = pvMin;
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
                        return d.color = englishColors( myLog( englishPvs[d.id] ));
                    }
                    else if (espanolIds.indexOf(d.id) != - 1) {
                        return d.color = espanolColors( myLog( espanolPvs[d.id] ));
                    }
                    else if (frenchIds.indexOf(d.id) != - 1) {
                        return d.color = frenchColors( myLog(frenchPvs[d.id]) );
                        
                    }
                    else if (portugueseIds.indexOf(d.id) != - 1) {
                        return d.color = portugueseColors( myLog(portuguesePvs[d.id]) );

                    }
                    else if (deutscheIds.indexOf(d.id) != - 1) {
                        return d.color = deutscheColors( myLog(deutschePvs[d.id]) );
                    }
                }
            });

        pvMin++;

        if (pvMin == pvMax+1) {

            // once it hits the end, add in the remaining countries and the graticule
            svg.append("path")
                .datum(graticule)
                .attr("class", "graticule")
                .attr("d", path);
             
            svg.append("path")
                .datum(graticule.outline)
                .attr("class", "graticule outline")
                .attr("d", path);

            // color remaining countries
            d3.selectAll(".country").transition()
                .duration(200)
                .style("fill", function(d, i) {
                    if (remainingIds.indexOf(d.id) != -1) {
                        return d.color = "lightgrey";
                    }
                    else {
                        return d.color = d.color;
                    }
                });

        }

    }

    // use this to activate update() function (method inherited from JQuery slider)
    setInterval(function() {
        if (pvMin <= pvMax) {
            update();
        }
    }, 400);
    

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

    var colorScales = [englishColors, espanolColors, frenchColors, portugueseColors, deutscheColors];
    var thisColorScale; 
    for (var k=0; k<colorScales.length; k++) {
        var rectName = "rect" + String(k); // get rectangle
        svg.selectAll(rectName)
            .data(colorScales[k].range().map(function(color) {
                var d = colorScales[k].invertExtent(color);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d, i) { return 100+20*i; })
                .attr("y", height - 100 + (10*k))
                .attr("width", 20)
                .attr("height", "10px")
                .style("fill", function(d, i) { 
                    return colorScales[k].range()[i];
                });
    }
     
    // add legend language labels   
    for (var i=0; i<langFull.length; i++) {
        svg.append("text")
            .attr("class", "caption")
            .attr("x", 40)
            .attr("y", height - 90 + (10*i))
            .text( langFull[i].toUpperCase() );
        
        svg.append("text")
            .attr("class", "caption")
            .attr("x", 305)
            .attr("y", height - 92 + (10*i))
            // .text( Math.round(Math.exp(langMax[i]) - 1) );
            .text( Math.round(langMax[i]) );

    }

    // legend title
    svg.append("text")
        .attr("class", "captionTitle")
        .attr("x", 40)
        .attr("y", height-105)
        .text("log( Pageviews )");

}

function myLog(input) {
    // transform to log-scale so that outliers (e.g. the US has a *lot* of pageviews relative to other countries) 
    //  don't skew color scale
    return Math.log(1 + input);
}




