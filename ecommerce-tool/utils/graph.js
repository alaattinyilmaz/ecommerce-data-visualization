
/*
d3.select("body").select("#countries").selectAll("input")
.data([11, 22, 33, 44])
.enter()
.append('label')
    .attr('for',function(d,i){ return 'a'+i; })
    .text(function(d) { return d; })
.append("input")
    .attr("checked", true)
    .attr("type", "checkbox")
    .attr("id", function(d,i) { return 'a'+i; })
    .attr("onClick", "change2(this)");
*/

var countries = ['United Kingdom', 'France', 'Australia', 'Netherlands', 'Germany',
       'Norway', 'EIRE', 'Switzerland', 'Spain', 'Poland', 'Portugal',
       'Italy', 'Belgium', 'Lithuania', 'Japan', 'Iceland',
       'Channel Islands', 'Denmark', 'Cyprus', 'Sweden', 'Finland',
       'Austria', 'Bahrain', 'Israel', 'Greece', 'Hong Kong', 'Singapore',
       'Lebanon', 'United Arab Emirates', 'Saudi Arabia',
       'Czech Republic', 'Canada', 'Unspecified', 'Brazil', 'USA',
       'European Community', 'Malta', 'RSA'];

countries_filtered = countries;

 d3.select("body").select("#countries").selectAll("input")
   .data(countries).enter()
   .append("foreignObject")
   .html(function(d,i){ return '<input type="checkbox" checked="true" id="country'+i+'" name="country'+i+'" value="'+d+'" onclick="applyCountryFilter(this)"> <label for="country'+i+'"> '+d+' </label><br>'; })
   //.html("<label class='inline'><input type='checkbox'><span class='lbl'> </span>               </label>");


var clickedNodes = [];

function applyCountryFilter(country_mask){
  console.log("country maskimiz: ",country_mask)
  var index = countries_filtered.indexOf(country_mask.value);
  if (index > -1) {
     countries_filtered.splice(index, 1);
  }
  else {
     countries_filtered.push(country_mask.value);
  }
  
  filterHandler(true, []);
  console.log(countries_filtered);
}

var toggleTimeFilter = false;

function timeFilter()
{
  toggleTimeFilter = !toggleTimeFilter;
  if(toggleTimeFilter)
    d3.select('#time_filter').style("display","inline");
  else
    d3.select('#time_filter').style("display","none");
}

var toggleCalendarView = false;
function calendarView()
{
  toggleCalendarView = !toggleCalendarView;
  if(toggleCalendarView)
    d3.select('#calendar_content').style("display","inline");
  else
    d3.select('#calendar_content').style("display","none");
  console.log("calendarView called",d3.select('#calendar_content'))
}



//create somewhere to put the force directed graph
var svg = d3.select("#graph_svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");
    
var radius = 13; 

var tooltip = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip")
  .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px");
    //.style("padding", "5px");


var popUp = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  //.style("width","500px")
  //.style("height","500px")
  .style("visibility", "hidden")
  //.text("POPUP")
  .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-color", "#103269")
    //.style("border-radius", "5px")
    .style("opacity","0.97")
    .style("padding", "5px")
    //.style("padding", "5px");

//popUp.style("top","100px").style("left","100px");

// set the dimensions and margins of the graph
var margin_graph = {top: 10, right: 30, bottom: 30, left: 60},
    width_graph = 760 - margin_graph.left - margin_graph.right,
    height_graph = 400 - margin_graph.top - margin_graph.bottom;

// append the svg object to the popup
var popup_svg = popUp.append("svg")
    .attr("width", width_graph + margin_graph.left + margin_graph.right)
    .attr("height", height_graph + margin_graph.top + margin_graph.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin_graph.left + "," + margin_graph.top + ")")



// ################################# LINE CHART START
// Linechart

var svg_chart = d3.select("#time_filter_svg"),
    margin_chart = {top: 20, right: 20, bottom: 110, left: 40},
    margin_chart2 = {top: 0, right: 20, bottom: 30, left: 40},
    width_chart = +svg_chart.attr("width") - margin_chart.left - margin_chart.right,
    height_chart = 0,
    //height = +svg.attr("height") - margin_chart.top - margin_chart.bottom,
    //height2 = +svg.attr("height") - margin_chart2.top - margin_chart2.bottom;
    height_chart2 = 50;
//var parseDate = d3.timeParse("%m/%d/%Y %H:%M");
var parseDate = d3.timeParse("%Y-%m-%d");

var x1_chart = d3.scaleTime().range([0, width_chart]),
    x2_chart = d3.scaleTime().range([0, width_chart]),
    y1_chart = d3.scaleLinear().range([height_chart, 0]),
    y2_chart = d3.scaleLinear().range([height_chart2, 0]);

var xAxis = d3.axisBottom(x1_chart),
    xAxis2 = d3.axisBottom(x2_chart),
    yAxis = d3.axisLeft(y1_chart);

var brush = d3.brushX()
    .extent([[0, 0], [width_chart, height_chart2]])
    .on("brush end", brushed);

var zoom_chart = d3.zoom()
    .scaleExtent([1, 10])
    .translateExtent([[0, 0], [width_chart, height_chart]])
    .extent([[0, 0], [width_chart, height_chart]])
    .on("zoom", zoomed);

    var line = d3.line()
        .x(function (d) { return x1_chart(d.Date); })
        .y(function (d) { return y1_chart(d.Buy_Count); });
    
    var line2 = d3.line()
        .x(function (d) { return x2_chart(d.Date); })
        .y(function (d) { return y2_chart(d.Buy_Count); });

    var clip = svg_chart.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width_chart)
        .attr("height", height_chart)
        .attr("x", 0)
        .attr("y", 0); 

    var Line_chart = svg_chart.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")")
        .attr("clip-path", "url(#clip)");

    var focus = svg_chart.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")");

var context = svg_chart.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin_chart2.left + "," + margin_chart2.top + ")");


// ################################# LINE CHART END


d3.csv("data/day_counts.csv", type, function (error, data_chart) {
  if (error) throw error;

  //x.domain(d3.extent(data, function(d) { return d.Date; }));
  //y.domain([0, d3.max(data, function (d) { return d.Buy_Count; })]);

  x2_chart.domain(d3.extent(data_chart, function(d) { return d.Date; }));
  y2_chart.domain([0, d3.max(data_chart, function (d) { return d.Buy_Count; })]);

  
    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height_chart + ")")
        //.call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        //.call(yAxis);
  
      /*
    Line_chart.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);
      */

  context.append("path")
      .datum(data_chart)
      .attr("class", "line")
      .attr("d", line2);

  context.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height_chart2 + ")")
      .call(xAxis2);

  context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x1_chart.range());

  svg_chart.append("rect")
      .attr("class", "zoom")
      .attr("width", width_chart)
      .attr("height", height_chart)
      //.attr("transform", "translate(" + margin_chart.left + "," + margin_chart.top + ")")
      //.call(zoom);

svg_chart.select(".zoom").call(zoom_chart.transform, d3.zoomIdentity
      .scale(10));

  console.log(data_chart);
});

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2_chart.range();
  x1_chart.domain(s.map(x2_chart.invert, x2_chart));

  console.log("selam",s.map(x2_chart.invert, x2_chart))
  time_range = s.map(x2_chart.invert, x2_chart);
  applyTimeFilter(time_range);
  //Line_chart.select(".line").attr("d", line);
  //focus.select(".axis--x").call(xAxis);
  console.log(s)
  //svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
   //   .scale(width_chart / (s[1] - s[0]))
   //   .translate(-s[0], 0));
}


function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  //x.domain(t.rescaleX(x2).domain());
  //Line_chart.select(".line").attr("d", line);
  //focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x2_chart.range().map(t.invertX, t));
  console.log("zoomed called")
}

function type(d) {
  d.Date = parseDate(d.Date);
  d.Buy_Count = +d.Buy_Count;
  return d;
}





//Read the data
var whole_data = "";


d3.csv("data/customer_buydates_sampled_big.csv",
  // When reading the csv, I must format variables:
  function(d){
    //console.log(d);
    return { Customer: d.Customer, InvoiceDay : d3.timeParse("%Y-%m-%d")(d.InvoiceDay), Count : d.Count }
  },
  function(data) {
    whole_data = data;
  });

var right_descriptions = d3.select("body")
  .append("div")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("visibility", "hidden")
  .text("a simple tooltip")
  .style("background-color", "white")
  .style("height", "80px")
  .style("width", "200px")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

//right_descriptions.style("top",  300+"px").style("left", 1050+"px");

nodes_data = nodes

links_data = links

var parseDate = d3.timeParse("%Y-%m-%d");


for (i = 0 ; i < links_data.length; i++)
{
  links_data[i].invoice_day = parseDate(links_data[i].invoice_day);
}
console.log(links_data)


var filtered_nodes_data = [];

//set up the simulation and add forces  
var simulation = d3.forceSimulation()
          .nodes(nodes_data);
                              
var link_force =  d3.forceLink(links_data)
                        .id(function(d) { return d.name; });            
         
var charge_force = d3.forceManyBody()
    .strength(-500); 
    
var center_force = d3.forceCenter(width / 2, height / 2);  
                      
simulation
    .force("charge_force", charge_force)
    .force("center_force", center_force)
    .force("links",link_force);

        
//add tick instructions: 
simulation.on("tick", tickActions);


//add encompassing group for the zoom 
var g = svg.append("g")
    .attr("class", "everything");

//draw lines for the links 
/* LINK DELETION
var link = g.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(links_data)
    .enter().append("line")
      .attr("stroke-width", 1)
      .style("stroke", linkColour);        
*/

if(links_data.length < 1000000)
  var SMALL_GRAPH = true;
else 
  var SMALL_GRAPH = false;

var links_subset_count = 0
var links_subset = links_data.filter(function(link_d){
        links_subset_count+=1;
        return links_subset_count<1000;
      });


if(SMALL_GRAPH)
{
  var link = g.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(links_subset)
    .enter().append("line")
      .attr("stroke-width", 0)
      .style("stroke", linkColour);  
}
else
{
  var link = g.append("g").attr("class", "links");
}


//draw circles for the nodes 
var node = g.append("g")
        .attr("class", "nodes") 
        .selectAll("circle")
        .data(nodes_data)
        .enter()
        .append("circle")
        //.attr("r", radius)
        .attr("r", radiusAssign)
        .style("stroke-width", 3)    // set the stroke width
        .style("stroke", "black")      // set the line colour
        .attr("fill", circleColour)

        .on("mouseover", function(d) {
          return tooltip.style("visibility", "visible").text(getProductName(d));
        })
        
        // we move tooltip during of "mousemove"
        
        .on("mousemove", function() {
          return tooltip.style("top", (event.pageY - 30) + "px")
            .style("left", event.pageX + "px");
        })
        
        // we hide our tooltip on "mouseout"
        
        .on("mouseout", function() {
          return tooltip.style("visibility", "hidden");
        })

        .on("click", clickOnNode)

        /*
      .on('mouseover', function (d) {
        // Highlight the nodes: every node is green except of him
        //node.style('fill', "#B8B8B8")
        d3.select(this).style('fill', '#69b3b2')
        // Highlight the connections
        link.style('stroke', function (link_d) { return link_d.source.name === d.name || link_d.target.name === d.name ? 'green' : 'transparent';})
          .style('stroke-width', function (link_d) { return link_d.source.name === d.name || link_d.target.name === d.name ? 4 : 1;})
      
      })
      */
      
      
      /*
      .on('mouseout', function (d) {

        d3.select(this).style('fill', circleColour);
        link.attr("stroke-width", 1).style("stroke", linkColour);     

      })
      */
        //.on("mouseover", handleMouseOver);

console.log("selamun aleykum")

var lastClickedNode = "";


function getProductName(d){
  if(d.sex=="M")
    return stock_desc[d.name.toString()];
  else
    return d.name + ": " + d.country ;
}

var filtered_nodes_names = getNodeNames();

function getNodeNames(){
  filtered_nodes_names = []
  for (i = 0; i < filtered_nodes_data.length; i++)
  {
    filtered_nodes_names.push(filtered_nodes_data[i].name)
  }
  console.log(filtered_nodes_names);
  return filtered_nodes_names;
}

var visitedLinksBefore = [];

// Create Event Handlers for mouse
function clickOnNode(d, i) {  // Add interactivity

    //d3.select(this).style('fill', '#69b3b2')
    // Highlight the connections
    clickedNodes = [];

    // Selecting the links of a particular node
    linksToBeAdded = links_data.filter(function(link_d){
      link_obj = {"source":link_d.source.name,"target":link_d.target.name};

      isLinkVisitedBefore = visitedLinksBefore.includes(link_obj);

      if (link_d.source.name === d.name)
      {
       clickedNodes.push(link_d.target.name); 
       if(!isLinkVisitedBefore)
        visitedLinksBefore.push({"source":link_d.source.name,"target":link_d.target.name});
      }

      else if(link_d.target.name === d.name)
      { 
        clickedNodes.push(link_d.source.name); 
        if(!isLinkVisitedBefore)
          visitedLinksBefore.push({"source":link_d.source.name,"target":link_d.target.name}); 
      }

      return !isLinkVisitedBefore && (link_d.target.name === d.name || link_d.source.name === d.name);
    });

    console.log("linkstobeadded: ",linksToBeAdded);
    //visitedLinks.includes(link_d.source.name)

    filterHandler(true, linksToBeAdded);

    console.log("selam dostum",filtered_nodes_names)

    node.style('fill', function(node_d){ return clickedNodes.includes(node_d.name) ? 'red' : node_d.name == d.name ? '#dd7d86' : circleColour(node_d);})


    if(lastClickedNode == d.name && d.sex == "F")
    {

      popUp.style("top", (event.pageY - 30) + "px").style("left", event.pageX + "px");

      popUp.style("visibility", "visible")//.text(printOut(d,clickedNodes));

      //popUp.html("<br><br> hahahah <br><br>")

      filtered_data = whole_data.filter(function(dt){ 
        //console.log(d.name.toString());
         return dt.Customer == d.name.toString() });
      //popup_reset();
      setTimeout(function(){

      popup_svg.selectAll("g").remove();
      popup_svg.selectAll("text").remove();
      popup_svg.append("text")
  .attr("y", 5)
  .attr("x", 650)
  .text("CLOSE").on("click", function() {
          return popUp.style("visibility", "hidden");
        });

  popup_svg.append("text")
  .attr("y", 5)
  .attr("x", 8)
  .text("USER ID: " + d.name);

      //whole_data = data;
      // Add X axis --> it is a date format
      var x = d3.scaleTime()
        .domain(d3.extent(filtered_data, function(dt) { return dt.InvoiceDay; }))
        .range([ 0, width_graph ]);
      popup_svg.append("g")
        .attr("transform", "translate(0," + height_graph + ")")
        .call(d3.axisBottom(x));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, d3.max(filtered_data, function(dt) { return +dt.Count; })])
        .range([ height_graph, 0 ]);
      popup_svg.append("g")
        .call(d3.axisLeft(y));
  /*
      // Add the line
      popup_svg.append("path")
        .datum(filtered_data)
        .attr("fill", "none")
        .attr("stroke", "#a70c38")
        .attr("stroke-width", 2)
        .attr("d", d3.line()
          .x(function(d) { return x(d.InvoiceDay) })
          .y(function(d) { return y(d.Count) })
          )
  */
      popup_svg.append("g")
        .datum(filtered_data)
      .selectAll("dot")
      .data(filtered_data)
      .enter()
      .append("circle")
        .attr("cx", function (dt) { return x(dt.InvoiceDay); } )
        .attr("cy", function (dt) { return y(dt.Count); } )
        .attr("r", 3)
        .style("fill", "#a70c38");
      },500);

    }
    else 
    {
      popUp.style("visibility", "hidden");
    }

    lastClickedNode = d.name
    /*
    tooltip.style("top", (this.cx.animVal.value - 30) + "px")
           .style("left", this.cy.animVal.value + "px");

    console.log(this.cx.animVal.value);

    tooltip.style("visibility", "hidden");
    //right_descriptions.text(printOut(d,clickedNodes));
    */

    }
 
var time_ranged_nodes_global = [];

function applyTimeFilter(time_range)
{
    time_filter_range = time_range;

    time_ranged_nodes = [];
    links_data.filter(function(link_d){

      if(link_d.invoice_day >= time_range[0] && link_d.invoice_day <= time_range[1])
      {
        time_ranged_nodes.push(link_d.source.name);
        time_ranged_nodes.push(link_d.target.name);

      }
    });
    
    time_ranged_nodes_global = time_ranged_nodes;

    if(time_ranged_nodes.length/2 != links_data.length)
    {
       console.log("hello",time_ranged_nodes.length/2, links_data.length)      
       console.log("time_ranged_nodes",time_ranged_nodes)
       node.attr("visibility",function(node_d){ return time_ranged_nodes.includes(node_d.name) && (countries_filtered.includes(node_d.country) || node_d.country == "PRODUCT")   ? "visible": "hidden";});
       //node.style('fill', function(node_d){ return time_ranged_nodes.includes(node_d.name) ? 'green' : circleColour(node_d);})
    }
}

function printOut(d, clickedNodes){

    printValue = "";

    if(d.sex=="F"){ 

      for (i = 1; i < clickedNodes.length;i++)
      {
        printValue = printValue + " " + stock_desc[clickedNodes[i].toString()] + "\n";

      }

    } 
console.log(printValue)
    return printValue;
}

// Create Event Handlers for mouse
function handleMouseOver(d, i) {  // Add interactivity

    console.log(d,i)
    console.log(this)

      // Use D3 to select element, change color and size
      /*d3.select(this).attr({
        fill: "red",
        r: 10 * 8
      });
      */
      d3.select(this).attr('fill', "red");

    }
 
//add drag capabilities  
var drag_handler = d3.drag()
  .on("start", drag_start)
  .on("drag", drag_drag)
  .on("end", drag_end); 
  
drag_handler(node);

/*
setTimeout(function(){
  country_mask = 'United Kingdom'
  filterHandler(country_mask);
},1500);
*/

setTimeout(function(){
  cm = 'France';
  //filterHandler(true,cm,[]);
},0);


setTimeout(function(){
  cm = 'United Kingdom';
  //filterHandler(true,cm,[]);
},1);


//filterHandler();

function filterHandler(country_mask, linksToBeAdded){
    //country_mask = 'France';

    if(country_mask)
    {

      filtered_nodes_data = nodes.filter(function(node_d)
          {
            console.log(node_d.country);
            return node_d.sex == "M" || countries_filtered.includes(node_d.country);
          });

      filtered_nodes_names = getNodeNames();

      console.log(filtered_nodes_data.length)
      node.attr("visibility",function(node_d){ return time_ranged_nodes.includes(node_d.name) && (countries_filtered.includes(node_d.country) || node_d.sex == "M") ? "visible": "hidden";});

    }

    if(linksToBeAdded.length)
    {
      console.log("FILTERED links data come to function: ",linksToBeAdded);
      link = link.data(linksToBeAdded);
      link.attr("stroke-width", 4)
          .style("stroke", "#000000");
      link.exit()
          .remove();
    }

    link.style('visibility', function(link_d){ return filtered_nodes_names.includes(link_d.target.name) ? "visible" : "hidden";})
    
  simulation.restart();
  
}



function restart() {
  node = node.data(nodes);

  node.enter().insert("circle", ".cursor")
      .attr("class", "node")
      .attr("r", 5)
      .on("mousedown", mousedownNode);

  node.exit()
      .remove();

  link = link.data(links);

  link.enter().insert("line", ".node")
      .attr("class", "link");
  link.exit()
      .remove();

  force.start();
}

//add drag capabilities  
var drag_handler_popup = d3.drag()
  .on("start", drag_start_popup)
  .on("drag", drag_drag_popup)
  .on("end", drag_end_popup); 
  
drag_handler_popup(popUp);

function drag_start_popup(d) {
    console.log(d);
 //if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //d.fx = d.x;
    //d.fy = d.y;

    //d3.select(this).style("top", (event.pageY - 200) + "px").style("left", (event.pageX-200) + "px")

    console.log(d);
}

//make sure you can't drag the circle outside the box
function drag_drag_popup(d) {

    d3.select(this).style("top", (event.pageY - 200) + "px").style("left", (event.pageX-200) + "px")

//  d.fx = d3.event.x;
//  d.fy = d3.event.y;
  //link.style("stroke", linkColourTick); 
}

function drag_end_popup(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  //d.fx = null;
  //d.fy = null;
      //d3.select(this).style("top", (event.pageY - 30) + "px").style("left", event.pageX + "px")

  //link.style("stroke", linkColour); 
}

//add zoom capabilities 
var zoom_handler = d3.zoom()
    .on("zoom", zoom_actions);

zoom_handler(svg);     

/** Functions **/

//Function to choose what color circle we have
//Let's return blue for males and red for females
function circleColour(d){
  if(d.sex =="M"){
    return "#1D1587";
  } else {
    return "grey";
  }
}

function radiusAssign(d){
  if(d.sex =="M"){
    return 13;
  } else {
    return 6;
  }
}

//Function to choose the line colour and thickness 
//If the link type is "A" return green 
//If the link type is "E" return red 
function linkColour(d){
  if(d.type == "A"){
    return "white";
    //return "grey";
  } else {
    return "white";
    //return "grey";
  }
}

function linkColour2(d){
  if(d.type == "A"){
    return "black";
    //return "grey";
  } else {
    return "black";
    //return "grey";
  }
}

function linkColourTick(d){
  if(d.type == "A"){
    return "red";
  } else {
    return "red";
  }
}

//Drag functions 
//d is the node 
function drag_start(d) {
 if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

//make sure you can't drag the circle outside the box
function drag_drag(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
  //link.style("stroke", linkColourTick); 
}

function drag_end(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
  //link.style("stroke", linkColour); 
}

//Zoom functions 
function zoom_actions(){
    g.attr("transform", d3.event.transform)
}

function tickActions() {
    //update circle positions each tick of the simulation 
       node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
        
    //update link positions 
    
    if(SMALL_GRAPH){
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
      }
    
} 