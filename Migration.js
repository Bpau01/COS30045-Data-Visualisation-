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
            // if (value === undefined || value === null) {
            //   console.log(world.properties.name);
            // }
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
            d3.select(this).attr("fill", "blue");
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
  // // Define the initial data for the donut chart
  // const data = [100, 50, 30];

  // // Define the dimensions of the SVG element and the radius of the donut chart
  // const width = 400;
  // const height = 400;
  // const radius = Math.min(width, height) / 2 - 10;

  // // Define the color scale for the chart segments
  // const color = d3
  //   .scaleOrdinal()
  //   .domain(data.map((d, i) => i))
  //   .range(["#4daf4a", "#377eb8", "#ff7f00"]);

  // // Define the arc generator for the chart segments
  // const arc = d3
  //   .arc()
  //   .innerRadius(radius * 0.5)
  //   .outerRadius(radius * 0.8);

  // // Define the arc generator for the hover segments
  // const hoverArc = d3
  //   .arc()
  //   .innerRadius(radius * 0.7)
  //   .outerRadius(radius * 0.9);

  // // Define the pie generator for the chart data
  // const pie = d3
  //   .pie()
  //   .sort(null)
  //   .value((d) => d);

  // // Create the SVG element and add a group for the chart
  // const svg = d3
  //   .select("#chart2")
  //   .append("svg")
  //   .attr("width", width)
  //   .attr("height", height)
  //   .append("g")
  //   .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // // Add the segments to the chart
  // const segments = svg
  //   .selectAll("path")
  //   .data(pie(data))
  //   .enter()
  //   .append("path")
  //   .attr("d", arc)
  //   .attr("fill", (d, i) => color(i))
  //   .on("mouseover", function (d) {
  //     // Get the data for the hover segments
  //     const hoverData = [70, 20, 10];

  //     // Remove the old hover segments
  //     svg.selectAll(".hover-segment").remove();

  //     // Add the new hover segments
  //     svg
  //       .selectAll(".hover-segment")
  //       .data(pie(hoverData))
  //       .enter()
  //       .append("path")
  //       .attr("class", "hover-segment")
  //       .attr("d", hoverArc)
  //       .attr("fill", (d, i) => color(i))
  //       .attr("stroke", "white")
  //       .attr("stroke-width", 2)
  //       .style("opacity", 0.7)
  //       .each(function (d) {
  //         // Store the old data for the hover segment
  //         this._current = d;
  //       });
  //   })
  //   .on("mouseout", function (d) {
  //     // Remove the hover segments
  //     svg.selectAll(".hover-segment").remove();
  //   });

  //----------------------------------------------------------------------------------------------------------------

  var w = 500;
  var h = 500;

  d3.csv(
    "data2.csv",
    function (d) {
      return {
        group: d["Visa groupings(d)"],
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
        .outerRadius(outerRadius + 50);

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
        .attr("width", 600)
        .attr("height", 600);

      var arcs = svg
        .selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr(
          "transform",
          "translate(" + (outerRadius + 20) + "," + (outerRadius + 20) + ")"
        );

      var hoverArcs = d3
        .selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr(
          "transform",
          "translate(" + (outerRadius + 20) + "," + (outerRadius + 20) + ")"
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
          console.log(currentGroup);

          d3.selectAll(".hover-segment path")

            .filter(function (hover) {
              return hover.data.group === currentGroup;
            })
            .transition()
            .duration(200)
            .attr("opacity", "1");
        })
        .on("mouseout", function (d) {
          console.log("out");
          d3.select(this).transition().duration(200).attr("d", arc);
          d3.selectAll(".hover-segment path")
          .attr("opacity", 0);
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
          return "translate(" + arc.centroid(d) + ")";
        })
        .raise();

      //Hover Chart
      svg
        .selectAll(".hover-segment")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "hover-segment")
        .attr("d", hoverArc)
        .attr(
          "transform",
          "translate(" + (outerRadius + 20) + "," + (outerRadius + 20) + ")"
        )
        .append("path")
        .attr("fill", function (d, i) {
          return color(i);
        })
        .attr("d", function (d, i) {
          return hoverArc(d, i);
        })
        .attr("opacity", "0");

      arcs.raise();
    }
  );
}

function main() {
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
