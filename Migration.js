function drawWorldMap(year) {
  var w = 1000;
  var h = 400;

  //Colour range for the map value
  var color = d3
    .scaleQuantize()
    .range(["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603", "#808080"]);

  var nameMap = {
    "Western Sahara": "W. Sahara",
    USA: "United States of America",
    "Congo, Dem Rep": "Dem. Rep. Congo",
    "Dominican Rep": "Dominican Rep.",
    "Falkland Is": "Falkland Is.",
    "Cote d'Ivoire": "Côte d'Ivoire",
    "Cent Africa Rep": "Central African Rep.",
    "Congo, Rep": "Congo",
    "Equator Guinea": "Eq. Guinea",
    Eswatini: "eSwatini",
    "Unit Arab Emir": "United Arab Emirates",
    "Korea, North": "North Korea",
    "Korea, South": "South Korea",
    "Solomon Islands": "Solomon Is.",
    "UK, CIs & IOM": "United Kingdom",
    "Bosnia/Herzegov": "Bosnia and Herz.",
    "North Macedonia": "Macedonia",
    "Trinidad/Tobago": "Trinidad and Tobago",
    "South Sudan": "S. Sudan",
  };

  //Remove existing map
  d3.select("#chart1 svg").remove();
  var svg = d3
    .select("#chart1")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("fill", "grey")
    .attr("stroke", "white");

  var projection = d3
    .geoMercator()
    .scale(130)
    .translate([w / 2, h / 1.4]);

  var path = d3.geoPath().projection(projection);
  d3.csv(
    "data1.csv",
    function (d) {
      return {
        country: nameMap[d.Country] || d.Country,
        value: parseFloat(d[year].replace(/,/g, "")),
      };
    },
    function (error, data) {
      if (error) throw error;
      d3.json("countries-110m.json", function (error, world) {
        if (error) throw error;

        for (var i = 0; i < data.length; i++) {
          var csvCountry = data[i].country;
          var csvValue = parseFloat(data[i].value);

          for (var j = 0; j < world.objects.countries.geometries.length; j++) {
            var jsonCountry =
              world.objects.countries.geometries[j].properties.name;
            if (csvCountry == jsonCountry) {
              world.objects.countries.geometries[j].properties.value = csvValue;
              break;
            }
          }
        }

        svg
          .selectAll("path")
          .data(topojson.feature(world, world.objects.countries).features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", function (world) {
            var value = world.properties.value;

            if (value >= 3000) {
              return color.range()[4];
            } else if (value >= 1000 && value < 3000) {
              return color.range()[3];
            } else if (value >= 500 && value < 1000) {
              return color.range()[2];
            } else if (value >= 200 && value < 500) {
              return color.range()[1];
            } else if (value < 200) {
              return color.range()[0];
            } else {
              d3.select(this).attr("fill", color.range()[5]);
            }
          })
          .on("mouseover", function (world) {
            d3.select(this).attr("fill", "#A4028E");
            d3.select("#chart1ValueText").text(
              world.properties.name + ", " + world.properties.value
            );
          })
          .on("mouseout", function () {
            var value = d3.select(this).data()[0].properties.value;
            if (value >= 3000) {
              d3.select(this).attr("fill", color.range()[4]);
            } else if (value >= 1000 && value < 3000) {
              d3.select(this).attr("fill", color.range()[3]);
            } else if (value >= 500 && value < 1000) {
              d3.select(this).attr("fill", color.range()[2]);
            } else if (value >= 200 && value < 500) {
              d3.select(this).attr("fill", color.range()[1]);
            } else if (value < 200) {
              d3.select(this).attr("fill", color.range()[0]);
            } else {
              d3.select(this).attr("fill", color.range()[5]);
            }
          });
      });
    }
  );
}

function pieChart() {
  var w = 500;
  var h = 500;

  d3.csv(
    "data2.csv",
    function (d) {
      return {
        group: d["Visa groupings(d)"],
        detailedGroup: d["Detailed Visa groupings"],
        value: parseFloat(d.Total.replace(/,/g, "")),
      };
    },
    function (error, data) {
      if (error) throw error;
      const dataByGroup = d3.group(data, (d) => d.group);
      const dataset = Array.from(dataByGroup, ([group, value]) => {
        return { group, value: d3.sum(value, (d) => d.value) };
      });

      //Inner and Outer Radius for Drawing the Pir Chart
      //Can Change Inner Radius to Produce a Donut Chart
      var outerRadius = w / 2;
      var innerRadius = h / 5;

      var arc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
      const hoverArc = d3
        .arc()
        .innerRadius(innerRadius + 50)
        .outerRadius(outerRadius + 100);

      var pie = d3
        .pie()
        .value(function (d) {
          return d.value;
        })
        .sort(null)
        .value(function (d) {
          return d.value;
        })
        .sort(function (a, b) {
          //console.log(a);
          return d3.ascending(a.group, b.group);
        });

      var svg = d3
        .select("#chart2")
        .append("svg")
        .attr("width", "100%")
        .attr("height", 1100);

      var arcs = svg
        .selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr(
          "transform",
          "translate(" + (outerRadius + 500) + "," + (outerRadius + 300) + ")"
        );

      var hoverArcs = svg
        .selectAll(".hover-segment")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "hover-segment")
        .attr(
          "transform",
          "translate(" + (outerRadius + 500) + "," + (outerRadius + 300) + ")"
        );

      //Color from d3 library
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      //Drawing of Pie Chart
      arcs
        .append("path")
        .attr("fill", function (d, i) {
          return color(i);
        })
        .attr("d", function (d, i) {
          return arc(d, i);
        })
        .on("mouseover", function (d) {
          //Push the segmants outwards
          d3.select(this)
            .transition()
            .duration(200)
            .attr(
              "d",
              d3
                .arc()
                .innerRadius(innerRadius + 15)
                .outerRadius(outerRadius + 15)
            );

          currentGroup = d.data.group;
          d3.selectAll(".hover-segment path")
            .filter(function (hover) {
              return hover.data.group === currentGroup;
            })
            .transition()
            .duration(200)
            .attr("opacity", "1");

          d3.selectAll(".hover-segment text")
            .filter(function (hover) {
              return hover.data.group === currentGroup;
            })
            .transition()
            .duration(200)
            .attr("opacity", "1");
        })
        .on("mouseout", function (d) {
          d3.select(this).transition().duration(200).attr("d", arc);
          d3.selectAll(".hover-segment path").attr("opacity", "0");
          d3.selectAll(".hover-segment text").attr("opacity", "0");
        });

      //Text Label
      arcs
        .append("text")
        .text(function (d) {
          var percent = (
            (100 * d.data.value) /
            d3.sum(dataset, (d) => d.value)
          ).toFixed(1);
          return d.data.group + ": " + percent + "%";
        })
        .attr("transform", function (d) {
          var centroid = arc.centroid(d);
          var offsetX = -70;
          var offsetY = 0;
          var newX = centroid[0] + offsetX;
          var newY = centroid[1] + offsetY;
          return "translate(" + newX + "," + newY + ")";
        })
        .raise();

      //Hover Chart
      hoverArcs
        .append("path")
        .attr("fill", function (d, i) {
          var greenScale = d3
            .scaleSequential()
            .domain([10, 15])
            .interpolator(d3.interpolateGreens);
          var blueScale = d3
            .scaleSequential()
            .domain([0, 1])
            .interpolator(d3.interpolateBlues);
          var orangeScale = d3
            .scaleSequential()
            .domain([5, 10])
            .interpolator(d3.interpolateOranges);
          //console.log(d.data);
          if (d.data.group == "Others") {
            return greenScale(i);
          } else if (d.data.group == "Temporary visas") {
            console.log(i);
            return orangeScale(i);
          } else if (d.data.group == "Permanent visas") {
            return blueScale(i / 3);
          }
          return color(i);
        })
        .attr("d", function (d, i) {
          return hoverArc(d, i);
        })
        .attr("opacity", "0");

      //Text Label for hover chart
      hoverArcs
        .append("text")
        .text(function (d) {
          //console.log(d.data);
          return d.data.detailedGroup + ": " + d.data.value;
        })
        .attr("transform", function (d, i) {
          var centroid = hoverArc.centroid(d);
          var radius = outerRadius + 1000;
          var angle = Math.atan2(centroid[1], centroid[0]);
          var offsetX = Math.cos(angle) * radius * 0.2;
          var offsetY = Math.sin(angle) * radius * 0.15;
          var newX = centroid[0] + offsetX;
          var newY = centroid[1] + offsetY;
          //console.log(centroid);
          return "translate(" + newX + "," + newY + ")";
        })
        .attr("opacity", "0");

      arcs.raise();
    }
  );
}

function lineChart() {
  var w = 1000;
  var h = 400;
  d3.csv(
    "data4.csv",
    function (d) {
      var parseYear = function (yearString) {
        var yearParts = yearString.split("-");
        var year = parseInt(yearParts[0]);
        return new Date(year, 0);
      };
      return {
        year: parseYear(d.Year),
        oriYear: d.Year,
        stud: +d.InternationalStudent,
        total: +d.Total,
      };
    },
    function (error, data) {
      if (error) throw error;
      drawLineChart(data);
    }
  );
  function drawLineChart(data) {
    // console.log(data);
    var xScale = d3
      .scaleTime()
      .domain([
        d3.min(data, function (d) {
          return d.year;
        }),
        d3.max(data, function (d) {
          return d.year;
        }),
      ])
      .range([50, w - 60]);
    var yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(data, function (d) {
          return d.total;
        }),
      ])
      .range([h, 20]);
    var totalLine = d3
      .line()
      .x(function (d) {
        return xScale(d.year);
      })
      .y(function (d) {
        return yScale(d.total);
      });
    var studLine = d3
      .line()
      .x(function (d) {
        return xScale(d.year);
      })
      .y(function (d) {
        return yScale(d.stud);
      });
    var svg = d3
      .select("#chart3")
      .append("svg")
      .attr("width", w + 20)
      .attr("height", h + 30);

    svg
      .append("path")
      .datum(data)
      .attr("class", "line total-line")
      .attr("d", totalLine)
      .style("stroke", "red")
      .style("stroke-width", "4px")
      .on("click", function () {
        var clickedLine = d3.select(this);
        var isLineColored = clickedLine.style("stroke") !== "red";
        svg.selectAll(".total-circle").style("opacity", isLineColored ? 0 : 1);
        clickedLine.style("stroke", isLineColored ? "red" : "#000");
        svg.selectAll(".total-label").attr("opacity", function () {
          var currentOpacity = d3.select(this).attr("opacity");
          if (currentOpacity === "0") {
            return "1";
          } else {
            return "0";
          }
        });
      })
      .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
      })
      .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
      });

    svg
      .append("path")
      .datum(data)
      .attr("class", "line stud-line")
      .attr("d", studLine)
      .style("stroke", "blue")
      .style("stroke-width", "4px")
      .on("click", function () {
        var clickedLine = d3.select(this);
        var isLineColored = clickedLine.style("stroke") !== "blue";
        svg.selectAll(".stud-circle").style("opacity", isLineColored ? 0 : 1);
        clickedLine.style("stroke", isLineColored ? "blue" : "#000");
        svg.selectAll(".stud-label").attr("opacity", function () {
          var currentOpacity = d3.select(this).attr("opacity");
          if (currentOpacity === "0") {
            return "1";
          } else {
            return "0";
          }
        });
      })
      .on("mouseover", function () {
        d3.select(this).style("cursor", "pointer");
      })
      .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
      });

    svg
      .selectAll(".total-circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "total-circle")
      .attr("cx", function (d) {
        return xScale(d.year);
      })
      .attr("cy", function (d) {
        return yScale(d.total);
      })
      .attr("r", 4)
      .style("opacity", 0);

    svg
      .selectAll(".stud-circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "stud-circle")
      .attr("cx", function (d) {
        return xScale(d.year);
      })
      .attr("cy", function (d) {
        return yScale(d.stud);
      })
      .attr("r", 4)
      .style("opacity", 0);

    //X and y Axis
    var xAxis = d3.axisBottom().ticks(4).scale(xScale);
    svg
      .append("g")
      .attr("transform", "translate(0, " + h + ")")
      .call(xAxis);
    var yAxis = d3.axisLeft().ticks(10).scale(yScale);
    svg
      .append("g")
      .attr("transform", "translate(" + 50 + ",0)")
      .call(yAxis);

    //Data Label
    svg
      .selectAll(".total-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "total-label")
      .attr("x", function (d) {
        return xScale(d.year);
      })
      .attr("y", function (d) {
        return yScale(d.total) - 20;
      })
      .text(function (d) {
        return d.total;
      })
      .attr("opacity", "0");

    svg
      .selectAll(".stud-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "stud-label")
      .attr("x", function (d) {
        return xScale(d.year);
      })
      .attr("y", function (d) {
        return yScale(d.stud) - 20;
      })
      .text(function (d) {
        return d.stud;
      })
      .attr("opacity", "0");
  }
}

function main() {
  lineChart();
  drawWorldMap("2004-05");
  pieChart();
  var slider = d3.select("#slider");
  // Get value based on slider
  slider.on("input", function () {
    //CSV columns
    var years = [
      "2004-05",
      "2005-06",
      "2006-07",
      "2007-08",
      "2008-09",
      "2009-10",
      "2010-11",
      "2011-12",
      "2012-13",
      "2013-14",
      "2014-15",
      "2015-16",
      "2016-17",
      "2017-18",
      "2018-19",
      "2019-20",
      "2020-21",
      "2021-22(e)",
    ];
    var selectedYear = years[this.value - 1];
    console.log(selectedYear);
    drawWorldMap(selectedYear);
    d3.select("#chart1YearText").text("Year: " + selectedYear);
  });
}

window.onload = main;
