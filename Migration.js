function drawWorldMap(year) {
  var w = 1300;
  var h = 450;

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
    "Cote d'Ivoire": "CÃ´te d'Ivoire",
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
            d3.select("#chart1ValueText").text(function () {
              var formattedValue = parseInt(
                world.properties.value
              ).toLocaleString();
              return "Country: " + world.properties.name + " " + formattedValue;
            });
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

        //Legend
        var colors = [
          "#a63603",
          "#e6550d",
          "#fd8d3c",
          "#fdbe85",
          "#feedde",
          "#808080",
        ];
        var legendData = [
          { label: "3000+" },
          { label: "1000 - 2999" },
          { label: "500 - 999" },
          { label: "200 - 499" },
          { label: "<200" },
          { label: "undefined" },
        ];
        var legend = svg
          .append("g")
          .attr("class", "legend")
          .attr("transform", "translate(" + 1150 + ", " + 30 + ")");
        var legendItems = legend
          .selectAll(".legend-item")
          .data(
            legendData.map(function (d) {
              return d.label;
            })
          )
          .enter()
          .append("g")
          .attr("class", "legend-item")
          .attr("transform", function (d, i) {
            return "translate(0, " + i * 20 + ")";
          });
        legendItems
          .append("rect")
          .attr("x", 0)
          .attr("y", 0)
          .attr("width", 12)
          .attr("height", 12)
          .style("fill", function (d, i) {
            return colors[i];
          });
        legendItems
          .append("text")
          .attr("x", 20)
          .attr("y", 10)
          .style("fill", "black")
          .attr("stroke", "none")
          .text(function (d) {
            console.log("Current text color:", d3.select(this).style("fill"));
            return d;
          });
      });
    }
  );
}

function pieChart() {
  var w = 500;
  var h = 500;

  //To be determined
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

      const sortedData = data.slice().sort(function (a, b) {
        // Sort by group
        if (a.group < b.group) {
          return -1;
        }
        if (a.group > b.group) {
          return 1;
        }

        //Sort by Value
        if (a.value < b.value) {
          return -1;
        }
        if (a.value > b.value) {
          return 1;
        }

        // If both group and value are the same, return 0
        return 0;
      });

      //Inner and Outer Radius for Drawing the Pir Chart
      //Can Change Inner Radius to Produce a Donut Chart
      var outerRadius = w / 2;
      var innerRadius = h / 5;

      var arc = d3.arc().outerRadius(outerRadius).innerRadius(innerRadius);
      const hoverArc = d3
        .arc()
        .innerRadius(innerRadius + 50)
        .outerRadius(outerRadius + 130);

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
        .attr("height", 950);

      var arcs = svg
        .selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr(
          "transform",
          "translate(" + (outerRadius + 425) + "," + (outerRadius + 210) + ")"
        );

      var hoverArcs = svg
        .selectAll(".hover-segment")
        .data(pie(sortedData))
        .enter()
        .append("g")
        .attr("class", "hover-segment")
        .attr(
          "transform",
          "translate(" + (outerRadius + 425) + "," + (outerRadius + 210) + ")"
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
        .attr("stroke", "black")
        .style("stroke-width", "2px")
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
            .attr("opacity", "0.8");

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
          //return d.data.group + ": " + percent + "%";
          return percent + "%";
        })
        .attr("transform", function (d) {
          var centroid = arc.centroid(d);
          var offsetX = -20;
          var offsetY = 0;
          var newX = centroid[0] + offsetX;
          var newY = centroid[1] + offsetY;
          return "translate(" + newX + "," + newY + ")";
        })
        .attr("font-size", "20px")
        .style("font-weight", "bold")
        .raise();

      //Drawing of Hover Chart (The 2nd donut chart behind)
      hoverArcs
        .append("path")
        .attr("fill", function (d, i) {
          var greenScale = d3
            .scaleSequential()
            .domain([-1, 3])
            .interpolator(d3.interpolateGreens);
          var blueScale = d3
            .scaleSequential()
            .domain([0, 5])
            .interpolator(d3.interpolateBlues);
          var orangeScale = d3
            .scaleSequential()
            .domain([6, 12])
            .interpolator(d3.interpolateOranges);
          if (d.data.group == "Others") {
            return greenScale(i);
          } else if (d.data.group == "Temporary visas") {
            return orangeScale(i);
          } else if (d.data.group == "Permanent visas") {
            return blueScale(i);
          }
          return color(i);
        })
        .attr("d", function (d, i) {
          return hoverArc(d, i);
        })
        .attr("opacity", "0")
        .attr("stroke", "black")
        .style("stroke-width", "2px");

      //Text Label for hover chart
      hoverArcs
        .append("text")
        .text(function (d) {
          var formattedValue = parseInt(d.data.value).toLocaleString();
          return d.data.detailedGroup + ": " + formattedValue;
        })
        .attr("transform", function (d, i) {
          var centroid = hoverArc.centroid(d);
          var radius = outerRadius + 1000;
          var angle = Math.atan2(centroid[1], centroid[0]);
          var offsetX = Math.cos(angle) * radius * 0.185;
          var offsetY = Math.sin(angle) * radius * 0.15;
          var newX = centroid[0] + offsetX - 100;
          var newY = centroid[1] + offsetY;
          //console.log(centroid);
          return "translate(" + newX + "," + newY + ")";
        })
        .attr("opacity", "0")
        .attr("font-weight", "bold")
        .attr("font-size", "15px");

      arcs.raise();

      //Legend
      var colors = ["#f28305", "#324c8f", "#328f38"];
      var data = [
        { label: "Temporary Visa" },
        { label: "Permanent Visa" },
        { label: "Others" },
      ];
      var legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (w + 550) + ", " + (h - 200) + ")");
      var legendItems = legend
        .selectAll(".legend-item")
        .data(
          data.map(function (d) {
            return d.label;
          })
        )
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", function (d, i) {
          return "translate(0, " + i * 20 + ")";
        });
      legendItems
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 12)
        .attr("height", 12)
        .style("fill", function (d, i) {
          return colors[i];
        });
      legendItems
        .append("text")
        .attr("x", 20)
        .attr("y", 10)
        .text(function (d) {
          return d;
        });

      // var colors2 = ["#000", "#000", "#328f38"];
      // var data2 = [
      //   { label: "Temawefasy Visa" },
      //   { label: "Permanent Visa" },
      //   { label: "Others" },
      // ];
      // var legend2 = svg
      //   .append("g")
      //   .attr("class", "legend")
      //   .attr("transform", "translate(" + (w + 650) + ", " + (h - 20) + ")");
      // var legendItems2 = legend2
      //   .selectAll(".legend-item")
      //   .data(
      //     data2.map(function (d) {
      //       return d.label;
      //     })
      //   )
      //   .enter()
      //   .append("g")
      //   .attr("class", "legend-item")
      //   .attr("transform", function (d, i) {
      //     return "translate(0, " + i * 20 + ")";
      //   });
      // legendItems2
      //   .append("rect")
      //   .attr("x", 0)
      //   .attr("y", 0)
      //   .attr("width", 10)
      //   .attr("height", 10)
      //   .style("fill", function (d, i) {
      //     return colors2[i];
      //   });
      // legendItems2
      //   .append("text")
      //   .attr("x", 20)
      //   .attr("y", 10)
      //   .text(function (d) {
      //     return d;
      //   });
    }
  );
}

function lineChart() {
  var w = 1000;
  var h = 600;
  d3.csv(
    "data3.csv",
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
      .range([h, 120]);
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
      .attr("height", h + 30)
      .append("g")
      .attr("transform", "translate(" + 15 + ", 0)");

    svg
      .append("path")
      .datum(data)
      .attr("class", "line-total-line")
      .attr("d", totalLine)
      .style("stroke", "#b06337")
      .style("stroke-width", "4px")
      .attr("fill", "none")
      .on("click", function () {
        var clickedLine = d3.select(this);
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        svg
          .selectAll(".total-circle")
          .style("opacity", isLineClicked ? 0 : 1)
          .attr("r", isLineClicked ? 4 : 6);
        clickedLine.style("stroke-width", isLineClicked ? "4px" : "6");
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
        svg.selectAll(".total-circle").style("opacity", "1");
      })
      .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
        var clickedLine = d3.select(this);
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        if (isLineClicked == false) {
          svg.selectAll(".total-circle").style("opacity", "0");
        }
      });

    svg
      .append("path")
      .datum(data)
      .attr("class", "line-stud-line")
      .attr("d", studLine)
      .style("stroke", "#ed6da7")
      .attr("fill", "none")
      .style("stroke-width", "4px")
      .on("click", function () {
        var clickedLine = d3.select(this);
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        svg
          .selectAll(".stud-circle")
          .style("opacity", isLineClicked ? 0 : 1)
          .attr("r", isLineClicked ? 4 : 6);
        clickedLine.style("stroke-width", isLineClicked ? "4px" : "6");
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
        svg.selectAll(".stud-circle").style("opacity", "1");
      })
      .on("mouseout", function () {
        d3.select(this).style("cursor", "default");
        var clickedLine = d3.select(this);
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        if (isLineClicked == false) {
          svg.selectAll(".stud-circle").style("opacity", "0");
        }
      });

    //Dotted circle on line
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
      .style("opacity", "0")
      .attr("fill", "#b06337")
      .on("mouseover", function (d) {
        var clickedLine = d3.selectAll(".line-total-line");
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        if (isLineClicked == false) {
          d3.selectAll(".total-label").attr("opacity", function (labelData) {
            return labelData === d ? "1" : "0";
          });
          svg.selectAll(".total-circle").style("opacity", "1");
        }
      })
      .on("mouseout", function () {
        var clickedLine = d3.selectAll(".line-total-line");
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        if (isLineClicked == false) {
          d3.selectAll(".total-label").attr("opacity", "0");
          svg.selectAll(".total-circle").style("opacity", "0");
        }
      });
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
      .style("opacity", "0")
      .attr("fill", "#ed6da7")
      .on("mouseover", function (d) {
        var clickedLine = d3.selectAll(".line-stud-line");
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        if (isLineClicked == false) {
          d3.selectAll(".stud-label").attr("opacity", function (labelData) {
            return labelData === d ? "1" : "0";
          });
          svg.selectAll(".stud-circle").style("opacity", "1");
        }
      })
      .on("mouseout", function () {
        var clickedLine = d3.selectAll(".line-stud-line");
        var isLineClicked = clickedLine.style("stroke-width") === "6";
        if (isLineClicked == false) {
          d3.selectAll(".stud-label").attr("opacity", "0");
          svg.selectAll(".stud-circle").style("opacity", "0");
        }
      });

    //X and y Axis
    var xAxis = d3.axisBottom().ticks(4).scale(xScale);
    svg
      .append("g")
      .attr("transform", "translate(0, " + h + ")")
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "15px");

    var yAxis = d3.axisLeft().ticks(10).scale(yScale);
    svg
      .append("g")
      .attr("transform", "translate(" + 50 + ",0)")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "15px");

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
        var formattedValue = parseInt(d.total).toLocaleString();
        return formattedValue;
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
        var formattedValue = parseInt(d.stud).toLocaleString();
        return formattedValue;
      })
      .attr("opacity", "0");

    //Legend
    var colors = ["#b06337", "#ed6da7"];
    var data = [
      { label: "Number of Immigrants into Australia" },
      { label: "Number of International student" },
    ];
    var legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (w - 300) + ", " + 50 + ")");
    var legendItems = legend
      .selectAll(".legend-item")
      .data(
        data.map(function (d) {
          return d.label;
        })
      )
      .enter()
      .append("g")
      .attr("class", "legend-item")
      .attr("transform", function (d, i) {
        return "translate(0, " + i * 20 + ")";
      });
    legendItems
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 12)
      .attr("height", 12)
      .style("fill", function (d, i) {
        return colors[i];
      });
    legendItems
      .append("text")
      .attr("x", 20)
      .attr("y", 10)
      .text(function (d) {
        return d;
      });
  }
}

function main() {
  lineChart();
  drawWorldMap("2012-13");
  pieChart();
  var slider = d3.select("#slider");
  // Get value based on slider
  slider.on("input", function () {
    //CSV columns
    var years = [
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

  //Scroll Event
  var chartContainers = document.getElementsByClassName("chartContainer");

  window.addEventListener("scroll", function () {
    var scrollPosition = window.scrollY;

    for (var i = 0; i < chartContainers.length; i++) {
      var chartContainer = chartContainers[i];
      var containerPosition = chartContainer.offsetTop;
      var activationPoint = containerPosition - 200;

      if (scrollPosition >= activationPoint) {
        chartContainer.classList.add("active");
      } else {
        chartContainer.classList.remove("active");
      }
    }
  });
}

window.onload = main;
