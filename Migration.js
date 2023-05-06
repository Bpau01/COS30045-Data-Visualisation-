function geo() {
  var w = 1000;
  var h = 400;

  //Colour range for the map value
  var color = d3
    .scaleQuantize()
    .range(["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"]);
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
    "test1.csv",
    function (d) {
      return {
        country: d.Country,
        value: d.data,
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
              // console.log(
              //   world.objects.countries.geometries[j].properties.value
              // );
              break;
            }
          }
        }

        console.log();
        svg
          .selectAll("path")
          .data(topojson.feature(world, world.objects.countries).features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", function (world) {
            var value = world.properties.value;
            console.log(value);
            if (value) {
              return "red";
            }
          });
      });
    }
  );
}

window.onload = geo;
