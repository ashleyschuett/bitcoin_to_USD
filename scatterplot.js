request = new XMLHttpRequest();
request.open('GET', 'https://api.bitcoinaverage.com/all', true);
//request.open('GET','http://www.quandl.com/api/v1/datasets/BCHARTS/BTCEUSD.json?rows=10', true);
var current;
var all;

var startDate = "2014-4-1 00:00:00";
var endDate = "2014-4-30 00:00:00";

var current;

request.onreadystatechange = function() {
  if (this.readyState === 4){
    if (this.status >= 200 && this.status < 400){
      // Success!
      current = JSON.parse(this.responseText);

      runProgram(current);
    }
  }
};

request.send();

function runProgram(current){
    var usd = current.USD.averages;

     $('#last').text('$'+usd.last);
     $('#avg').text('$'+usd['24h_avg']);
     $('#vol').text(usd['total_vol']);

};

d3.csv("per_day_all_time_history.csv", function(data){    

    var margin = {top: 20, right: 0, bottom: 20, left: -1},
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    //formaters for different numbers
    var formatNumber = d3.format(".1f"); 
    var formatDate = d3.time.format("%b. %d, %Y");
    var formatMoney = d3.format(".2f");

    //get min and max
    var mindate = getDate(startDate);
    var maxdate = getDate(endDate);
    
    // Set up X axis    
    var x = d3.time.scale().domain([mindate, maxdate]).range([0, width]),
         xAxis = d3.svg.axis().scale(x).ticks(d3.time.weeks).orient("bottom");
    
    //Set up Y axis
    var y = d3.scale.linear().domain([0, 1200]).range([height, 0]),
        yAxis = d3.svg.axis().scale(y).tickSize(width).tickFormat(formatCurrency).orient("right");

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr('id', 'xAxis')
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append('text') // X-axis Label
        .attr('id','xAxisLabel');

    //y-axis
    var gy = svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    gy.selectAll("g").filter(function(d) { return d; })
        .classed("minor", true);

    //y axis label
    gy.selectAll("text")
        .attr("x", 4)
        .attr("dy", -4);


    //creates div for hover
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var circles = svg.selectAll('circle')
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 7)
        .attr("cx", function(d){return x(getCSVDate(d.datetime))})
        .attr("cy", function(d){return y(getAverage(d)) })
        .style("fill", "#2ecc71")
        .on("mouseover", function(d){
            current = d3.select(this).attr("r");
            d3.select(this)
                .transition().duration(1000)
                .attr("r", 10);
            tooltip.transition()
                .duration(1500)
                .style("opacity", .9);
            tooltip.html('<div class="stats"><span id="date">'+formatDate(getCSVDate(d.datetime)) + "</span><br/> <b>Avg:</b> $" + formatMoney(d.average) + "<br/> <b>High:</b> $" + formatMoney(d.high) + "<br/> <b>Low:</b> $" + formatMoney(d.low) + '</div>')
               .style("left", (d3.event.pageX + 5) + "px")
               .style("top", (d3.event.pageY - 70) + "px");
        })
        .on("mouseout", function(d){
            d3.select(this)
                .transition().duration(500)
                .attr("r", current);
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    function getDate(d){
        var parts = d.replace(/-/g, ' ').replace(/:/g, ' ').split(' ');
       // console.log(new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]));
        return new Date(parts[0], parts[1], parts[2], parts[3], parts[4], parts[5]);
    }

    function getCSVDate(d){
        var parts = d.replace(/-/g, ' ').replace(/:/g, ' ').split(' ');
       // console.log(new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]));
        return new Date(parts[0], parts[1]-1, parts[2], parts[3], parts[4], parts[5]);
    }

    function getAverage(d){
        return d.average;
    }

    function formatCurrency(d) {
      var s = formatNumber(d / 1e3);
      return d === y.domain()[1]
          ? "$" + s + "thousand"
          : s;
    }

    //changes the dates of the graph
$('#month').change(function(e){
    var temp = $("option:selected", this);
    startDate = temp.data('start');
    endDate = temp.data('to');

    if(temp.attr('id')=="2014" || temp.attr('id')=="2013" || temp.attr('id')=="2012")
        xChangeYear();
    else
        xChange();
});

    function xChange() {
        
        x.domain([new Date(startDate), new Date(endDate)]).range([0, width]);

        xAxis.scale(x).ticks(d3.time.weeks);

        d3.select('#xAxis') // redraw the xAxis
           .transition().duration(1000)
            .call(xAxis);
  

        circles // move the circles
            .data(data)
            .transition().duration(1000)
                 .attr("cx", function(d) {return x(getCSVDate(d.datetime))})
                 .attr("cy", function(d){return y(getAverage(d)) })          
            .transition().duration(1000)
                .attr("r", 7);
      }

    function xChangeYear() {
        
        x.domain([new Date(startDate), new Date(endDate)]).range([0, width]);

        xAxis.scale(x).ticks(d3.time.months);

        d3.select('#xAxis') // redraw the xAxis
            .transition().duration(1000)
            .call(xAxis);
  

        d3.selectAll('circle') // move the circles
            .transition().duration(1000)
                .attr("cx", function(d) {return x(getCSVDate(d.datetime)) })
                .attr("cy", function(d){return y(getAverage(d)) })
            .transition().duration(1000)
                .attr("r", 2.5);
      }

});