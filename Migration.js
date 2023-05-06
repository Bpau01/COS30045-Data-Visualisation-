function drawWorldMap(year) {
  var w = 1000;
  var h = 400;

  //Colour range for the map value
  var color = d3
    .scaleQuantize()
    .range(["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"]);

  //Remove existing map
  d3.select("#chart svg").remove();
  var svg = d3
    .select("#chart")
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
        country: d.Country,
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
            console.log(world.properties.name);
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
            }
          });
      });
    }
  );
}

function main() {
  drawWorldMap("2004-05");

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
  });
}

window.onload = main;
