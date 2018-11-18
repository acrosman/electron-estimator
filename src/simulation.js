function runSimulation(settings, callback) {
  const passes = 0;
  const limitGraph = false;
  const upperbound = calculateUpperBound(data);
  const times = new Array(upperbound).fill(0);
  const estimates = new Array();
  const min = -1;
  const max = 0;
  const runningTime = 0;
  const startTime = 0;
  const endTime = 0;

  // Run the simulation.
  var startTime = Date.now();
  for(var i = 0; i < passes; i++) {
    var time = 0;
    $.each(data, function(index, row) {
      time += generateEstimate(row.Min, row.Max, row.Confidence);
    });
    times[time]++;
    estimates.push(time);
    if (time < min || min == -1) { min = time; }
    if (time > max) { max = time;}
  }
  endTime = Date.now();

  // Calculate and display the results.
  runningTime = endTime - startTime;
  var sums = times.map(function(value, index) {
    return value * index;
  });
  var sum = sums.reduce(function(a, b) { return a + b; });
  var avg = sum / passes;
  var median = getMedian(times);
  var sd = getStandardDeviation(estimates);
  var likelyMin = Math.round(median - sd);
  var likelyMax = Math.round(median + sd);

  // Trim the array to just hold cells in the range of results.
  // If limit graph is set, just show two standard deviations on the graph.
  var upper = max;
  var lower = min;
  if (limitGraph) {
    upper = median + (sd * 2) < max ? median + (sd * 2) : max;
    lower = median - (sd * 2) > min ? median - (sd * 2) : min;
  }
  var trimmed = times.filter(function (e, i){
    return (i > lower && i < upper);
  });



  buildHistogram(trimmed, lower, upper, median, sd);

}

// Calculate the longest time the simulator may come up with.
function calculateUpperBound(tasks){
  var total = 0;

  $.each(tasks, function(index, row) {
    total += taskUpperBound(row.Max, row.Confidence);
  });
  return total;
}

// Calculates the upper bound for a specific task record. Because developers
// are known to underestimate, the idea here is the less confidence they have
// in their estimate the more risk that it could go much higher than expected.
// So for every 10% drop in confidence we add the max estimate on again.
// 90% leaves the uppoer bound at max estimate.
// 80% gives us max * 2.
// 70% max * 3.
// And so on.
function taskUpperBound(max_estimate, confidence) {
  return max_estimate * Math.abs(Math.floor(10 - (confidence * 10)));
}

// Does the estimate for one task. It picks a random number between min and
// max confidence % of the time. If the number is outside the range, it has
// an even chance of being between 0-min, or above max. Since confidence in
// an estimate implies both likelyhood of being right and likelyhood of being
// close.  The less confidence in the estimate the higher the risk of the
// project going way over time. For every 10% drop in overrun grows by 100%
// of max estimate.
function generateEstimate(minimum, maximum, confidence) {
  var max = parseInt(maximum);
  var min = parseInt(minimum);
  var base = getRandom(1,1000);
  var boundry = confidence * 1000;
  var midBoundry = Math.floor((1000 - boundry)/2);
  var range = max - min + 1;
  var maxOverrun = taskUpperBound(max, confidence);
  var total = 0;

  if (base < boundry) {
    total = (base % range) + min;
  }
  else if ((base - boundry) < midBoundry) {
    total = min == 0 ? 0 : base % min;
  }
  else {
    total = getRandom(max, maxOverrun);
  }

  return total;

}

// Get a random number is a given range.
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculates the median value for all times run during a series of simulations.
function getMedian(data) {

  var m = [];
  $.each(data, function(index, value){
    next_set = new Array(value).fill(index);
    m.splice(0,0, ...next_set);
  });

  m.sort(function(a, b) {
      return a - b;
  });

  var middle = Math.floor((m.length - 1) / 2);
  if (m.length % 2) {
      return m[middle];
  } else {
      return (m[middle] + m[middle + 1]) / 2.0;
  }
}

// Calculates the standard deviation of the result list.
// Hat tip: https://stackoverflow.com/a/41781242/24215
function getStandardDeviation(numberArray) {
  // Calculate the average.
  var sum = numberArray.reduce(function(a, b) { return a + b; });
  var avg = sum / numberArray.length;

  // Calculate the standard deviation itself.
  var sdPrep = 0;
  for(var key in numberArray) {
    sdPrep += Math.pow((parseFloat(numberArray[key]) - avg),2);
  }
  return Math.sqrt(sdPrep/numberArray.length);
}

// Builds the histogram graph.
function buildHistogram(list, min, max, median, stdDev) {
  var minbin = min;
  var maxbin = max;
  var stdDevOffset = Math.floor(stdDev);
  var numbins = maxbin - minbin;
  var maxval = Math.max(...list);
  var medianIndex = Math.floor(median - min);

  // whitespace on either side of the bars
  var binmargin = .2;
  var margin = {top: 10, right: 30, bottom: 50, left: 60};
  var width = 800 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;

  // Set the limits of the x axis
  var xmin = minbin - 1
  var xmax = maxbin + 1

  // This scale is for determining the widths of the histogram bars
  var x = d3.scale.linear()
    .domain([0, (xmax - xmin)])
    .range([0, width]);

  // Scale for the placement of the bars
  var x2 = d3.scale.linear()
    .domain([xmin, xmax])
    .range([0, width]);

  var y = d3.scale.linear()
    .domain([0, maxval])
    .range([height, 0]);

  var xAxis = d3.svg.axis()
    .scale(x2)
    .orient("bottom");
  var yAxis = d3.svg.axis()
    .scale(y)
    .ticks(8)
    .orient("left");

  // Put the graph in the histogram div.
  var svg = d3.select("#histoGram").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," +
      margin.top + ")");

  // Set up the bars.
  var bar = svg.selectAll(".bar")
    .data(list)
    .enter().append("g")
    .attr("class", function(d, i){
      if (i == medianIndex) {
        return "bar median";
      } else if (i > medianIndex - stdDevOffset && i < medianIndex + stdDevOffset) {
        return "bar stdDev";
      } else {
        return "bar";
      }
    })
    .attr("transform", function(d, i) { return "translate(" +
      x2(i + minbin) + "," + y(d) + ")"; });

  // Add rectangles of correct size at correct location.
  bar.append("rect")
    .attr("x", x(binmargin))
    .attr("width", x( 2 * binmargin))
    .attr("height",  function(d) { return height - y(d); });

  // Add the x axis and x-label.
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  svg.append("text")
    .attr("class", "xlabel")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .text("Hours");

  // Add the y axis and y-label.
  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(0,0)")
    .call(yAxis);
  svg.append("text")
    .attr("class", "ylabel")
    .attr("y", 0 - margin.left) // x and y switched due to rotation.
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Frequency");
}

exports.runSimulation = runSimulation;
exports.buildHistogram = buildHistogram;
