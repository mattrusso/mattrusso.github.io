import * as d3 from 'd3';
import * as topojson from './topojson.js';

require("./css/vendor/bootstrap.css");
require("./css/base.scss");

var minDate = d3.select("#min-year").node().value;
var maxDate = d3.select("#max-year").node().value;

var years = [2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016];


var neighborhoods = [
        "Duboce Triangle",
        "Dogpatch",
        "Outer Sunset",
        "Golden Gate Park",
        "Treasure Island",
        "Sunset/Parkside",
        "Lakeshore/Oceanview/Merced/Ingleside",
        "Nob Hill",
        "South of Market",
        "Noe Valley",
        "Russian Hill",
        "Inner Richmond",
        "Financial District/South Beach",
        "West of Twin Peaks",
        "Glen Park",
        "Twin Peaks",
        "Visitacion Valley",
        "Marina",
        "Mission",
        "Bayview Hunters Point",
        "Inner Sunset",
        "Lone Mountain/USF",
        "North Beach",
        "Portola",
        "Western Addition",
        "Castro/Upper Market",
        "Excelsior",
        "Pacific Heights",
        "Outer Mission",
        "Outer Richmond",
        "Presidio Heights",
        "Japantown",
        "Seacliff",
        "Haight Ashbury",
        "Bernal Heights",
        "Chinatown",
        "Tenderloin",
        "Hayes Valley"
    ].sort();

d3.select("#min-year").on("change", function() {
    minDate = d3.select("#min-year").node().value;
    d3.select("#max-year").selectAll("option").remove()

    var yearIdx = years.indexOf(parseFloat(minDate));
    var maxYearIdx = years.indexOf(parseFloat(maxDate));

    for (var i = yearIdx + 1; i < years.length; i++) {
        if(i == maxYearIdx) {
            d3.select("#max-year").append("option").attr("selected", "selected").attr("value", years[i]).html(years[i]);
        } else {
            d3.select("#max-year").append("option").attr("value", years[i]).html(years[i]);
        }
    }
    updateTrends()
});
d3.select("#max-year").on("change", function() {
    maxDate = d3.select("#max-year").node().value;

    d3.select("#min-year").selectAll("option").remove()

    var yearIdx = years.indexOf(parseFloat(maxDate));
    var minYearIdx = years.indexOf(parseFloat(minDate));

    for (var i = 0; i < yearIdx; i++) {
        if(i == minYearIdx) {
            d3.select("#min-year").append("option").attr("selected", "selected").attr("value", years[i]).html(years[i]);
        } else {
            d3.select("#min-year").append("option").attr("value", years[i]).html(years[i]);
        }
    }

    updateTrends()
});

function updateTrends() {
    drawNeighborhoodContainers(neighborhoods);
}

function drawNeighborhoodContainers(arrNeighborhood) {
    d3.selectAll(".neighborhood-row").remove();

    for(var i = 0; i < arrNeighborhood.length; i++) {
        var neighborhood = arrNeighborhood[i]

        var neighborhoodId = neighborhood.indexOf(" ") == -1 ? "graph-" + neighborhood : neighborhood.replace(/ /g, "-");
        neighborhoodId = neighborhood.indexOf("/") == -1 ? neighborhoodId : neighborhoodId.split("/").join("-");
        neighborhoodId = neighborhood.indexOf(".") == -1 ? neighborhoodId : neighborhoodId.split(".").join("-");
        var rowIdSelector = "#"+neighborhoodId;

        d3.select("#graphs").append("div").attr("id", neighborhoodId).attr("class", "neighborhood-row");

        d3.select(rowIdSelector).append("h2").html(neighborhood).attr("class", "row-label");

        var container1 = d3.select(rowIdSelector).append("div").attr("class", "graph-cell eviction-cell col-xs-12 col-sm-3");
        var container2 = d3.select(rowIdSelector).append("div").attr("class", "graph-cell petition-cell col-xs-12 col-sm-3");
        var container3 = d3.select(rowIdSelector).append("div").attr("class", "graph-cell buyout-cell col-xs-12 col-sm-3");
        var container4 = d3.select(rowIdSelector).append("div").attr("class", "graph-cell carshare-cell col-xs-12 col-sm-3");

        container1.append("h2").html("Evictions")
        container2.append("h2").html("Petitions to the Rent Board")
        container3.append("h2").html("Buyout Agreements")
        container4.append("h2").html("Onstreet Carshare")

        var containerWidth = container1.node().getBoundingClientRect().width;

        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = containerWidth - margin.left - margin.right - 8,
            height = 180 - margin.top - margin.bottom;

        var textcenter = (width + margin.left + margin.right)/2 - 37

        container1.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "empty-state")
        .append("g")
            .style("transform",
                "translate(" + textcenter + "px" + ", 4.5em)")
            .append("text")
            .html("no data")
            .style("opacity", ".5");

        container2.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "empty-state")
        .append("g")
            .style("transform",
                "translate(" + textcenter + "px" + ", 4.5em)")
            .append("text")
            .html("no data")
            .style("opacity", ".5");

        container3.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "empty-state")
        .append("g")
            .style("transform",
                "translate(" + textcenter + "px" + ", 4.5em)")
            .append("text")
            .html("no data")
            .style("opacity", ".5");

        container4.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "empty-state")
        .append("g")
            .style("transform",
                "translate(" + textcenter + "px" + ", 4.5em)")
            .append("text")
            .html("no data")
            .style("opacity", ".5");

    }
    drawBuyouts();
    drawEvictions();
    drawPetitionsNeighorhood();
    drawCarshareNeighborhood();
}

function drawGraphsByNeighborhoods(data, id, yScaleMax) {

    for(var i = 0; i < data.length; i++) {

        var neighborhood = data[i].key

        if(neighborhoods.indexOf(neighborhood) == -1 || data[i].values.length <= 1) {
            continue
        }

        var neighborhoodId = neighborhood.indexOf(" ") == -1 ? "graph-" + neighborhood : neighborhood.replace(/ /g, "-");
        neighborhoodId = neighborhood.indexOf("/") == -1 ? neighborhoodId : neighborhoodId.split("/").join("-");
        neighborhoodId = neighborhood.indexOf(".") == -1 ? neighborhoodId : neighborhoodId.split(".").join("-");
        var rowIdSelector = "#"+neighborhoodId;

        // d3.selectAll(containerIdSelector).remove();
        var containerId = "graph-" + id + "-" + i;
        var containerIdSelector = "#"+containerId;

        // d3.select(rowIdSelector).append("div").attr("id", containerId).attr("class", "graph-cell col-xs-12 col-sm-3");
        d3.select(rowIdSelector).select("."+id+"-cell").select(".empty-state").remove()
        d3.select(rowIdSelector).select("."+id+"-cell").append("div").attr("id", containerId)

        var container = d3.select(containerIdSelector);

        var containerWidth = container.node().getBoundingClientRect().width;

        // set the dimensions and margins of the graph
        var margin = {top: 20, right: 20, bottom: 30, left: 40},
            width = containerWidth - margin.left - margin.right - 8,
            height = 180 - margin.top - margin.bottom;

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
        y.domain([0, yScaleMax])

        var path = svg.selectAll("path")
            .data([data[i].values]);

        path.enter().append("path")
            .attr("class", "line")
            .attr("d", valueline)
            .attr("clip-path", "url(#clip)");

        path.exit().remove()

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
}

function drawBuyouts() {
    var leafLength = 0;

    d3.csv('/../data/Buyout_agreements.csv', function(data) {

        var nested_data = d3.nest()
        .key(function(d) {
            return d.Neighborhoods_Analysis_Boundaries;
        })
        .key(function(d) {
            var date = d.Date.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);

            return year;
        })
        .rollup(function(leaves) {
            leafLength = leafLength > leaves.length ? leafLength : leaves.length;
            return leaves.length;
        })
        .sortKeys(d3.ascending)
        .entries(data);

        drawGraphsByNeighborhoods(nested_data, "buyout", (leafLength + 10))
    });
}

function drawEvictions() {
    var leafLength = 0;

    d3.csv('/../data/Count_of_Eviction_Notices_By_Analysis_Neighborhood_and_Year.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            if(d.Neighborhoods_Analysis_Boundaries != "" &&
                d.Neighborhoods_Analysis_Boundaries != "Lakeshore" &&
                d.Neighborhoods_Analysis_Boundaries != "Oceanview/Merced/Ingleside") {
                return d.Neighborhoods_Analysis_Boundaries;
            } else if  (d.Neighborhoods_Analysis_Boundaries == "Lakeshore" ||
                        d.Neighborhoods_Analysis_Boundaries == "Oceanview/Merced/Ingleside") {
                return "Lakeshore/Oceanview/Merced/Ingleside"
            } else {
                return "Unknown Neighborhood";
            }
        })
        .sortKeys(d3.ascending)
        .key(function(d) {
            var dateTime = d.File_Year.split(" ");
            var date = dateTime[0];
            date = date.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);
            return year;
         })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) { 
            var sum = d3.sum(leaves, function(d) {return d.Count_of_Eviction_Notices});
            leafLength = leafLength > sum ? leafLength : sum;
            return sum; 
        })
        .entries(data);

        drawGraphsByNeighborhoods(nested_data, "eviction", leafLength)


    });
}
function drawPetitionsNeighorhood() {
    var leafLength = 0

    d3.csv('/../data/Petitions_to_the_Rent_Board.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            if(d.Neighborhoods_Analysis_Boundaries != "" &&
                d.Neighborhoods_Analysis_Boundaries != "Lakeshore" &&
                d.Neighborhoods_Analysis_Boundaries != "Oceanview/Merced/Ingleside") {
                return d.Neighborhoods_Analysis_Boundaries;
            } else if  (d.Neighborhoods_Analysis_Boundaries == "Lakeshore" || d.Neighborhoods_Analysis_Boundaries == "Oceanview/Merced/Ingleside") {
                return "Lakeshore/Oceanview/Merced/Ingleside"
            } else {
                return "Unknown Neighborhood";
            }
        })
        .key(function(d) {
            var date = d.Date_Filed.split("/")
            var last = date.length - 1;
            var year = parseFloat(date[last]);

            return year;
         })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) {
            leafLength = leafLength > leaves.length ? leafLength : leaves.length;
            return leaves.length;
        })
        .entries(data);

        drawGraphsByNeighborhoods(nested_data, "petition", leafLength)
    })
}

function drawCarshareNeighborhood() {
        var leafLength = 0;

        d3.csv('/../data/Carshare_Onstreet.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            if(d.Neighborhood != "") {

            return d.Neighborhood
            } else {
                return "Unknown Neighborhood";
            }
        })
        .key(function(d) {
            var date = d.Operational_Date.split("/")
            var last = date.length - 1;
            var date2 = date[last].split(" ")
            var year = parseFloat(date2[0]);
            return year; })
        .sortKeys(d3.ascending)
        .rollup(function(leaves) {
            leafLength = leafLength > leaves.length ? leafLength : leaves.length;
            return leaves.length;
        })
        .entries(data);

        drawGraphsByNeighborhoods(nested_data, "carshare", leafLength)

    });
}

drawNeighborhoodContainers(neighborhoods);

// Map section functions
function drawWater(svg, centroid) {

    d3.json("/../data/water.json", function(error, data) {

        var h = d3.select("#map").node().getBoundingClientRect().height;
        var w = d3.select("#map").node().getBoundingClientRect().width;

        var featureCollection = topojson.feature(data, data.objects.PVS_16_v2_water_06075);
        var featureCollection2 = topojson.feature(data, data.objects.PVS_16_v2_water_06075);

        featureCollection.features.splice(34,1)

        var center = centroid;
        var scale  = 300000;
        var offset = [w/1.6, h/2.3];
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

function drawMap() {

    d3.json("/../data/map.json", function(error, data) {

        var svg1 = d3.select("#map").append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("class", "map-svg")
        .style("background", "#C2EDEB");

        var svg = svg1.append("g");
        var h = d3.select("#map").node().getBoundingClientRect().height;
        var w = d3.select("#map").node().getBoundingClientRect().width;

        var featureCollection = topojson.feature(data, data.objects.PVS_16_v2_faces_06075);
        featureCollection.features.splice(979,1)
        featureCollection.features.splice(8083,1)

        var center = d3.geoCentroid(featureCollection)
        var scale  = 300000;
        var offset = [w/1.6, h/2.3];
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
            svg.selectAll("circle").remove()
            drawBusinesses(svg, year, proj);
            drawPetitions(svg, year, proj);
            drawBuyOuts(svg, year, proj);
            mapDrawEvictions(svg, year, proj);

        });

        drawTrees(svg1, 2016, proj);
        drawBusinesses(svg1, 2016, proj);
        drawPetitions(svg1, 2016, proj);
        drawBuyOuts(svg1, 2016, proj);
        mapDrawEvictions(svg1, 2016, proj);

        drawNeighborhoods(svg, proj);

    });
}

function drawNeighborhoods(svg, proj) {

    d3.json("/../data/neighborhoods.json", function(error, data) {

        var nested_data = d3.nest().key(function(d) {return d[10];})
        .sortKeys(d3.ascending)
        .entries(data.data);

        var poly = svg.selectAll("polygon")
            .data(nested_data);

        poly.enter().append("polygon")
            .attr("class", "lol")
            .attr("points", function(d) {
                var pointsArray = d.values[0][9].split("(((")[1].split(")))")[0].split(",");
                var pointsString = "";
                for(var i = 0; i < pointsArray.length; i++) {
                    var points = pointsArray[i].split(" ");
                    if ( i > 0) {
                        var longitude = parseFloat(points[1]);
                        var latitude = parseFloat(points[2]);
                    } else {
                        var longitude = parseFloat(points[0]);
                        var latitude = parseFloat(points[1]);
                    }
                    var p = proj([longitude,latitude]);
                    var string = " " + p[0] + " " + p[1];
                    pointsString = pointsString + string;
                }

                return pointsString;
            })
            .attr("stroke", "#ffa884")
            .attr("stroke-width", "1px")
            .attr("stroke-opacity", ".5")
            .attr("fill", "transparent")
            .on("mouseover", function(d) {
                d3.select(this)
                    .attr("fill", "#ffa884")
                    .attr("fill-opacity", ".25");

                var x = this.getBBox().x;
                var y = this.getBBox().y;
                var h = this.getBBox().height;
                var w = this.getBBox().width;
                var center = [(y - 50),(x + (w/2) - 75)]

                var tooltip = d3.select(".map-svg").append("svg")
                    .attr("class", "tool-tip")
                    .attr("x", center[1])
                    .attr("y", center[0]);

                tooltip.append("foreignObject")
                    .attr("width", "150")
                    .attr("height", 60)
                  .append("xhtml:div")
                    .style("font", "14px 'Helvetica Neue'")
                    .style("background", "rgba(0, 0, 0, 0.7)")
                    .style("padding", "0.75em 0.5em")
                    .style("width", "auto")
                    .style("text-align", "center")
                    .style("font-weight", 900)
                    .html(function() {
                        return d.key;
                    });

            })
            .on("mouseout", function() {
                d3.select(this)
                    .attr("fill", "transparent");
                d3.select(".tool-tip").remove();
            });

    });

}

function drawTrees(svg, year, proj) {

    d3.csv('/../data/Street_Tree_List.csv', function(data) {
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

        var g = svg.append("g").attr("class", "trees");

        var points = g.selectAll("circle")
            .data(nested_data[0].values);

        points.enter().append("circle")
            .attr("class", function(d) {
                var className = d.qAddress;
                return "tree";
            })
            .attr("r", 0)
            .attr("cx", function(d) {
                // get lat and long points
                var longitude = parseFloat(d.Longitude)
                var latitude = parseFloat(d.Latitude)
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the longitude
                var coord = p[0]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("cy", function(d) {
                // get lat and long points
                var longitude = parseFloat(d.Longitude)
                var latitude = parseFloat(d.Latitude)
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[1]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("fill", "lightgreen")
            .attr("stroke", "springgreen")
            .style("fill-opacity", .2)
            .style("stroke-opacity", .7)
            .transition()
            .duration(500)
            .attr("r", 4);

        points.exit().remove()

        function isNan(value) {
            return Number.isNaN(Number(value));
        }

        var yearVal = d3.select("#year-slider").node().value;
        var treeNumber = nested_data[0].values.length;
        d3.select("#tree-year").html(yearVal);
        d3.select("#tree-number").html(treeNumber);


        d3.select("#year-slider").on("change", function() {
            svg.selectAll(".tree")
            .transition()
            .duration(500)
            .attr("r", 0)
            .remove();

            var newYearVal = d3.select("#year-slider").node().value;

            drawTrees(svg, newYearVal, proj);

        });


    });

}

function drawBusinesses(svg, year, proj) {

    d3.csv('/../data/Registered_Business_Locations_-_San_Francisco.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Business_Start_Date.split("/")
            var last = date.length - 1;
            var y = parseFloat(date[last]);

            if( y == year ) {
                return y;
            }
             return 9999
        })
        .sortKeys(d3.ascending)
        .entries(data);

        var g = svg.append("g").attr("class", "businesses");

        var points = g.selectAll("circle")
            .data(nested_data[0].values);

        points.enter().append("circle")
            .attr("r", 1)
            .attr("class", function(d) {
                var className = d.Business_Location;
                return className;
            })
            .attr("cx", function(d) {
                if(d.Business_Location != "" 
                    && d.Business_Location.indexOf('(') != -1
                    && d.Business_Location.indexOf('SAN FRANCISCO, CA') != -1) {

                    var loc = d.Business_Location.split("(");
                    var latlon = loc[1];
                    var latitude = parseFloat(latlon.split(",")[0]);
                    var lon = latlon.split(" ")[1];
                    var longitude = parseFloat(lon.split(")")[0]);

                    // convert lat/lon to pixel values with the projection
                    var p = proj([longitude,latitude])
                    // get the longitude
                    var coord = p[0]
                    // if coord is not a number, plot it off the map
                    if (isNan(coord)) {
                        coord = -10
                    }
                    return coord;
                } else {
                //     return 50;
                }
            })
            .attr("cy", function(d) {
                // get lat and long points
                if(d.Business_Location != "" 
                    && d.Business_Location.indexOf('(') != -1
                    && d.Business_Location.indexOf('SAN FRANCISCO, CA') != -1) {

                    var loc = d.Business_Location.split("(");
                    var latlon = loc[1];
                    var latitude = parseFloat(latlon.split(",")[0]);
                    var lon = latlon.split(" ")[1];
                    var longitude = parseFloat(lon.split(")")[0]);

                    // convert lat/lon to pixel values with the projection
                    var p = proj([longitude,latitude])
                    // get the latitude
                    var coord = p[1]
                    // if coord is not a number, plot it off the map
                    if (isNan(coord)) {
                        coord = -10
                    }
                    return coord;
                } else {
                    return 50
                }
            })
            .attr("fill", "orange")
            .style("opacity", 1);

        points.exit().remove()

        function isNan(value) {
            return Number.isNaN(Number(value));
        }
    })
}

function drawPetitions(svg, year, proj) {

    d3.csv('/../data/Petitions_to_the_Rent_Board.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Date_Filed.split("/")
            var last = date.length - 1;
            var y = parseFloat(date[last]);

            if( y == year ) {
                return y;
            }
             return 9999
        })
        .sortKeys(d3.ascending)
        .entries(data);

        var g = svg.append("g").attr("class", "petitions");

        var points = g.selectAll("circle")
            .data(nested_data[0].values);

        points.enter().append("circle")
            .attr("r", 1)
            .attr("class", function(d) {
                var className = "test";
                return className;
            })
            .attr("cx", function(d) {
                var loc = d.Location.split(",");
                var latitude = parseFloat(loc[0]);
                var longitude = parseFloat(loc[1]);
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[0]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("cy", function(d) {
                var loc = d.Location.split(",");
                var latitude = parseFloat(loc[0]);
                var longitude = parseFloat(loc[1]);
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[1]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("fill", "yellow")
            .style("opacity", 1);

        points.exit().remove()

        function isNan(value) {
            return Number.isNaN(Number(value));
        }
    })
}

function drawBuyOuts(svg, year, proj) {

    d3.csv('/../data/Buyout_agreements.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Date.split("/")
            var last = date.length - 1;
            var y = parseFloat(date[last]);

            if( y == year ) {
                return y;
            }
             return 9999
        })
        .sortKeys(d3.ascending)
        .entries(data);

        var g = svg.append("g").attr("class", "petitions");

        var points = g.selectAll("circle")
            .data(nested_data[0].values);

        points.enter().append("circle")
            .attr("r", 1)
            .attr("class", function(d) {
                var className = "test";
                return className;
            })
            .attr("cx", function(d) {
                var loc = d.Location.split(",");
                var latitude = parseFloat(loc[0]);
                var longitude = parseFloat(loc[1]);
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[0]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("cy", function(d) {
                var loc = d.Location.split(",");
                var latitude = parseFloat(loc[0]);
                var longitude = parseFloat(loc[1]);
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[1]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("fill", "turquoise")
            .style("opacity", 1);

        points.exit().remove()

        function isNan(value) {
            return Number.isNaN(Number(value));
        }
    })
}

function mapDrawEvictions(svg, year, proj) {

    d3.csv('/../data/Eviction_Notices2.csv', function(data) {
        var nested_data = d3.nest()
        .key(function(d) {
            var date = d.Date.split("/")
            var last = date.length - 1;
            var y = parseFloat(date[last]);

            if( y == year ) {
                return y;
            }
             return 9999
        })
        .sortKeys(d3.ascending)
        .entries(data);

        var g = svg.append("g").attr("class", "petitions");

        var points = g.selectAll("circle")
            .data(nested_data[0].values);

        points.enter().append("circle")
            .attr("r", 4)
            .attr("class", function(d) {
                var className = "test";
                return className;
            })
            .attr("cx", function(d) {
                var loc = d.Location.split(",");
                var latitude = parseFloat(loc[0]);
                var longitude = parseFloat(loc[1]);
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[0]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("cy", function(d) {
                var loc = d.Location.split(",");
                var latitude = parseFloat(loc[0]);
                var longitude = parseFloat(loc[1]);
                // convert lat/lon to pixel values with the projection
                var p = proj([longitude,latitude])
                // get the latitude
                var coord = p[1]
                // if coord is not a number, plot it off the map
                if (isNan(coord)) {
                    coord = -10
                }
                return coord;
            })
            .attr("fill", "red")
            .attr("stroke", "red")
            .style("fill-opacity", .1)
            .style("stroke-opacity", .7);

        points.exit().remove()

        function isNan(value) {
            return Number.isNaN(Number(value));
        }
    })
}

// Initial call to draw map
drawMap()
