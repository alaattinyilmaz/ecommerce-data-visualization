var width_calendar = 400,
    height_calendar = 2500,
    cellSize = 30; // cell size

var no_months_in_a_row = Math.floor(width_calendar / (cellSize * 7 + 50));
var shift_up = cellSize * 3;

var day = d3v3.time.format("%w"), // day of the week
    day_of_month = d3v3.time.format("%e") // day of the month
    day_of_year = d3v3.time.format("%j")
    week = d3v3.time.format("%U"), // week number of the year
    month = d3v3.time.format("%m"), // month number
    year = d3v3.time.format("%Y"),
    percent = d3v3.format(".1%"),
    format = d3v3.time.format("%Y-%m-%d");

var color = d3v3.scale.quantize()
    .domain([-.05, .05])
    .range(d3v3.range(11).map(function(d) { return "q" + d + "-11"; }));

var svg_calendar = d3v3.select("#chart").selectAll("svg")
    .data(d3v3.range(2011, 2012))
  .enter().append("svg")
    .attr("width", width_calendar)
    .attr("height", height_calendar)
    .attr("class", "RdYlGn")
  .append("g")

var rect = svg_calendar.selectAll(".day")
    .data(function(d) { 
      return d3v3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1));
    })
  .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) {
      var month_padding = 1.2 * cellSize*7 * ((month(d)-1) % (no_months_in_a_row));
      return day(d) * cellSize + month_padding; 
    })
    .attr("y", function(d) { 
      var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
      var row_level = Math.ceil(month(d) / (no_months_in_a_row));
      return (week_diff*cellSize) + row_level*cellSize*8 - cellSize/2 - shift_up;
    })
    .datum(format);

var month_titles = svg_calendar.selectAll(".month-title")  // Jan, Feb, Mar and the whatnot
      .data(function(d) { 
        return d3v3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("text")
      .text(monthTitle)
      .attr("x", function(d, i) {
        var month_padding = 1.2 * cellSize*7* ((month(d)-1) % (no_months_in_a_row));
        return month_padding;
      })
      .attr("y", function(d, i) {
        var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
        var row_level = Math.ceil(month(d) / (no_months_in_a_row));
        return (week_diff*cellSize) + row_level*cellSize*8 - cellSize - shift_up;
      })
      .attr("class", "month-title")
      .attr("d", monthTitle);

var year_titles = svg_calendar.selectAll(".year-title")  // Jan, Feb, Mar and the whatnot
      .data(function(d) { 
        return d3v3.time.years(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
    .enter().append("text")
      .text(yearTitle)
      .attr("x", function(d, i) { return width_calendar/2 - 100; })
      .attr("y", function(d, i) { return cellSize*5.5 - shift_up; })
      .attr("class", "year-title")
      .attr("d", yearTitle);


//  Tooltip Object
var tooltip = d3v3.select("body")
  .append("div").attr("id", "tooltip")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip");

d3v3.csv("data/day_counts.csv", function(error, csv) {

  total_count = 0;
  for (k = 0; k < csv.length; k++)
  {
    total_count += parseInt(csv[k].Buy_Count);
  }
  console.log(total_count);
  var data = d3v3.nest()
    .key(function(d) { return d.Date; })
    .rollup(function(d) { return [d[0].Buy_Count, d[0].Buy_Count/total_count]; })
    .map(csv);

    console.log(csv);

  rect.filter(function(d) { return d in data; })
      .attr("class", function(d) { return "day " + color(data[d][1]); })
    .select("title")
      .text(function(d) { return d + ": " + percent(data[d][0]) + ": " + percent(data[d][1]); });

  //  Tooltip
  rect.on("mouseover", mouseover);
  rect.on("mouseout", mouseout);
  function mouseover(d) {
    tooltip.style("visibility", "visible");
    console.log(data[d])
    var percent_data = (data[d] !== undefined) ? percent(data[d][1]) : percent(0);
    var count_data = (data[d] !== undefined) ? data[d][0] : "";
    var purchase_text = d + "<br> Transactions: " +count_data + ", Percentage: " + percent_data;

    tooltip.transition()        
                .duration(200)      
                .style("opacity", .9);      
    tooltip.html(purchase_text)  
                .style("left", (d3v3.event.pageX)+30 + "px")     
                .style("top", (d3v3.event.pageY) + "px"); 
  }
  function mouseout (d) {
    tooltip.transition()        
            .duration(500)      
            .style("opacity", 0); 
    var $tooltip = $("#tooltip");
    $tooltip.empty();
  }

});

function dayTitle (t0) {
  return t0.toString().split(" ")[2];
}
function monthTitle (t0) {
  return t0.toLocaleString("en-us", { month: "long" });
}
function yearTitle (t0) {
  return t0.toString().split(" ")[3];
}