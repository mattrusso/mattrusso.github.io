import * as d3 from 'd3';
import * as topojson from './topojson.js';

require("./css/vendor/bootstrap.css");
require("./css/base.scss");

var minDate = d3.select("#min-year").node().value;
var maxDate = d3.select("#max-year").node().value;

drawTrends();

d3.select("#min-year").on("change", function() {
    d3.selectAll("div.graph-cell").remove();
    minDate = d3.select("#min-year").node().value;
    drawTrends();
});
d3.select("#max-year").on("change", function() {
    d3.selectAll("div.graph-cell").remove();
    maxDate = d3.select("#max-year").node().value;
    drawTrends();
});

window.addEventListener("resize", function() {
    d3.selectAll("div.graph-cell").remove();
    drawTrends();

});


// calling data and then calling draw
function drawTrends() {

    d3.csv('/../data/Carshare_Onstreet.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Operational_Date.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);
            return year; })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

        drawGraph(nested_data, "Onstreet Carshare Stations", "carshare")

    });

    d3.csv('/../data/Buyout_agreements.csv', function(data) {

        var nested_data = d3.nest()
        .key(function(d) {
            if(d.Date_Buyout_Filed != "") {
                var date = d.Date_Buyout_Filed.split("/")
                var last = date.length - 1;
                var year = parseFloat(date[last]);

                return year;

            } else if(d.Pre_Buyout_Disclosure_Date != "") {
                var date = d.Pre_Buyout_Disclosure_Date.split("/")
                var last = date.length - 1;
                var year = parseFloat(date[last]);

                return year;

            } else {
                return null;
            }
        })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

        drawGraph(nested_data,"Buyout Agreements", "buyout")
    });

    d3.csv('/../data/Count_of_Eviction_Notices_By_Analysis_Neighborhood_and_Year.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var dateTime = d.File_Year.split(" ");
            var date = dateTime[0];
            date = date.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);
            return year; })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { 
            var sum = d3.sum(leaves, function(d) {return d.Count_of_Eviction_Notices});
            return sum; 
        })
        .entries(data);

        drawGraph(nested_data, "Eviction Notices", "eviction")

    });

    d3.csv('/../data/Appeals_to_the_Rent_Board.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Date_Filed.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);
            return year; })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

        drawGraph(nested_data, "Appeals to the Rent Board", "rent")

    });

    d3.csv('/../data/Registered_Business_Locations_-_San_Francisco.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Business_Start_Date.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);
            if(year >= 2000) {
                return year
            } else {
                return 0; 
            }
        })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

        nested_data.splice(0, 1)

        drawGraph(nested_data, "Newly Registered Businesses", "business")

    });

    d3.csv('/../data/Street_Tree_List.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var dateTime = d.PlantDate.split(" ");
            var date = dateTime[0];
            date = date.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);
            if(year >= 2000) {
                return year
            } else {
                return 0; 
            }
        })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { return leaves.length; })
        .entries(data);

        nested_data.splice(0, 1)

        drawGraph(nested_data, "Newly Planted Trees", "trees")

    });
}

function drawGraph(data, title, id) {

    var containerId = "graph-" + id;
    var containerIdSelector = "#"+containerId;

    // remove graph
    d3.selectAll(containerIdSelector).remove();

    d3.select("#graphs").append("div").attr("id", containerId).attr("class", "graph-cell col-xs-12 col-sm-4");
    d3.select(containerIdSelector).append("h2").html(title);

    var container = d3.select(containerIdSelector);
    var containerWidth = container.node().getBoundingClientRect().width;

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = containerWidth - margin.left - margin.right - 8,
        height = 200 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
        .curve(d3.curveCatmullRom)
        .x(function(d) {
                return x(d.key);
        })
        .y(function(d) {
                return y(d.value);
        });


    // append the svg obgect to the body of the page
    var svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // define clipping mask group
    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // append clippath
    g.append("clipPath")
        .attr("id", "clip")
    .append("rect")
        .attr("width", width)
        .attr("height", height);

    // Scale the range of the data
    x.domain([minDate, maxDate]);
    y.domain([0, d3.max(data, function(d) { 
        var val = d.value + (d.value * .1) 
        return val; })]);

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line")
        .attr("d", valueline)
        .attr("clip-path", "url(#clip)");

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")).tickValues(x.domain()));

    // Add the Y Axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).tickValues(y.domain()));

}



function drawWater(svg, centroid) {

    d3.json("/../data/test4.json", function(error, data) {

        var h = d3.select("#map").node().getBoundingClientRect().height;
        var w = d3.select("#map").node().getBoundingClientRect().width;

        var featureCollection = topojson.feature(data, data.objects.PVS_16_v2_water_06075);
        var featureCollection2 = topojson.feature(data, data.objects.PVS_16_v2_water_06075);

        featureCollection.features.splice(34,1)


        var center = centroid;
        var scale  = 225000;
        var offset = [w/2, h/2];
        var proj = d3.geoMercator().scale(scale).center(center).translate(offset);

        // create the path
        var path = d3.geoPath(proj);

        // using the path determine the bounds of the current map and use 
        // these to determine better values for the scale and translation
        var bounds  = [[0,0],[w,h]];
        var hscale  = scale*w  / (bounds[1][0] - bounds[0][0]);
        var vscale  = scale*h / (bounds[1][1] - bounds[0][1]);
        var scale   = (hscale < vscale) ? hscale : vscale;

        proj = d3.geoMercator().center(center)
        .scale(scale).translate(offset);

        path = d3.geoPath(proj);

        var paths = svg.selectAll(".water")
            .data(featureCollection.features);

        paths.enter().append("path")
            .attr("d", path)
            .attr("class", "water")
            .style("stroke", "#C2EDEB")
            .style("stroke-width", "3px")
            .attr("fill", "#C2EDEB");

    });

}



function drawMap() { d3.json("/../data/test2.json", function(error, data) {

    var svg1 = d3.select("#map").append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("background", "#C2EDEB");

    var svg = svg1.append("g");
    var h = d3.select("#map").node().getBoundingClientRect().height;
    var w = d3.select("#map").node().getBoundingClientRect().width;



    // var featureCollection = topojson.feature(data, data.objects.zip_codes_for_the_usa);

    var featureCollection = topojson.feature(data, data.objects.PVS_16_v2_faces_06075);
    featureCollection.features.splice(979,1)
    featureCollection.features.splice(8083,1)
    var names = ["SAN FRANCISCO"];

    // var featureCollectionSF = removeOtherCities(featureCollection, names)

    var center = d3.geoCentroid(featureCollection)
    var scale  = 225000;
    var offset = [w/2, h/2];
    var proj = d3.geoMercator().scale(scale).center(center).translate(offset);

    // create the path
    var path = d3.geoPath(proj);


    // using the path determine the bounds of the current map and use 
    // these to determine better values for the scale and translation
    var bounds  = [[0,0],[w,h]];
    var hscale  = scale*w  / (bounds[1][0] - bounds[0][0]);
    var vscale  = scale*h / (bounds[1][1] - bounds[0][1]);
    var scale   = (hscale < vscale) ? hscale : vscale;
    // var offset  = [w - (bounds[0][0] + bounds[1][0])/2,
    // h - (bounds[0][1] + bounds[1][1])/2];

    proj = d3.geoMercator().center(center)
    .scale(scale).translate(offset);

    // path = d3.geoPath().projection(bounds);
    path = d3.geoPath(proj);

    function removeOtherCities(data, keyArray) {

        for (var i = 0; i < data.features.length; i++) {
            var feature = data.features[i]

            if (feature.properties.state != "CA" || keyArray.indexOf(feature.properties.name) == -1) {
                var j = i + 1;
                data.features.splice(i, j);
                i = i - 1;
            }
        }

        return data;
    }

    var paths = svg.selectAll("path")
        .data(featureCollection.features);

    paths.enter().append("path")
        .attr("d", path)
        .attr("class", function(d, i) {
            return i;
        })
        .style("stroke", "rgba(149, 152, 154, .25)")
        .style("stroke-width", "1px")
        .attr("fill", "#535353");

    drawWater(svg, center)

    d3.select("#map-year").on("change", function() {

        var year = d3.select("#map-year").node().value;
        svg1.selectAll("circle").remove()
        drawTrees(svg, year, proj);
    });


    drawTrees(svg1, 2016, proj);


});
}


function drawTrees(svg, year, proj) {

    d3.csv('/../data/testData.csv', function(data) {
        var nested_data = d3.nest().key(function(d) {
            var date = d.PlantDate.split("/")
            var last = date.length - 1;
            var y = parseFloat(date[last]);

            if( y == year ) {
                return y;
            }
             return 9999})
        .sortKeys(d3.ascending)
        .entries(data);

        var points = [];

        var h = d3.select("#map").node().getBoundingClientRect().height;
        var w = d3.select("#map").node().getBoundingClientRect().width;

        var offset = [w/2, h/2];

        var g = svg.append("g").attr("class", "trees");

        var points = svg.selectAll("circle")
            .data(nested_data[0].values);

        points.enter().append("circle")
            .attr("r", 4)
            .attr("class", function(d) {
                var className = d.qAddress + " " + d.lon + " " + d.lat;
                return className;
            })
            .attr("cx", function(d) {
                var p = proj([d.lon,d.lat])
                var co = p[0]
                if (isNan(co)) {
                    co = -10
                }
                return co;
            })
            .attr("cy", function(d) {
                var p = proj([d.lon,d.lat])
                var co = p[1]
                if (isNan(co)) {
                    co = -10
                }
                return co;
            })
            .attr("fill", "lightgreen")
            .style("opacity", .5);

        points.exit().remove()

        function isNan(value) {
            return Number.isNaN(Number(value));
        }

    });

}

drawMap()
