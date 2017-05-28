import * as d3 from 'd3';
require("./css/vendor/bootstrap.css");
require("./css/base.scss");

var carShare = [];
var graphNum = 0;
var minDate = d3.select("#min-year").node().value;
var maxDate = d3.select("#max-year").node().value;

initPage();

d3.select("#min-year").on("change", function() {
    d3.selectAll("div.graph-cell").remove();
    minDate = d3.select("#min-year").node().value;
    initPage();
});
d3.select("#max-year").on("change", function() {
    d3.selectAll("div.graph-cell").remove();
    maxDate = d3.select("#max-year").node().value;
    initPage();
});

window.addEventListener("resize", function() {
    d3.selectAll("div.graph-cell").remove();
    initPage();

});


// calling data and then calling draw
function initPage() {

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

        drawGraph(nested_data, "Onstreet Carshare Stations")

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

        drawGraph(nested_data,"Buyout Agreements")
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

        drawGraph(nested_data, "Eviction Notices")

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

        drawGraph(nested_data, "Appeals to the Rent Board")

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

        drawGraph(nested_data, "Newly Registered Businesses")

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

        drawGraph(nested_data, "Newly Planted Trees")

    });
}

function drawGraph(data, title) {

    graphNum = graphNum + 1;
    var id = "graph-" + graphNum;

    d3.select("#graphs").append("div").attr("id", id).attr("class", "graph-cell col-xs-12 col-sm-4");
    d3.select("#"+id).append("h2").html(title);

    var container = d3.select("#"+id);
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
