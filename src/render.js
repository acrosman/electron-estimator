// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote } = require('electron');
const csv = require('csv-parse');
const $ = require('jquery');
const fs = require('fs');

const simulator = remote.require('./src/simulation.js');

$(document).ready(() => {
  let data = [];

  function addTaskRow(row) {
    let cells = `<td>${row.Task}</td>/n`;
    cells += `<td>${row.Max}</td>/n`;
    cells += `<td>${row.Min}</td>/n`;
    cells += `<td>${row.Confidence}%</td>/n`;
    $('#rawData table').append(`<tr class="data">${cells}</tr>`);
  }

  function addRowEvent() {
    const row = {};
    row.Task = $('#taskNameInput').val();
    row.Min = $('#minInput').val();
    row.Max = $('#maxInput').val();
    row.Confidence = parseFloat($('#confidenceInput').val()) / 100.0;
    addTaskRow(row);
    data.push(row);
    $('#simulationAreaWrapper').show();
  }

  function dataResetEvent() {
    data = [];
    $('#rawData table tr.data').remove();
    $('#simulationAreaWrapper').hide();
  }

  // Method that reads and processes the selected file
  function upload(evt) {
    const file = evt.target.files[0];

    fs.createReadStream(file.path)
      .pipe(csv({ columns: true }))
      .on('data', (csvrow) => {
        console.log(csvrow);
        addTaskRow(csvrow);
        data.push(csvrow);
      })
      .on('end', () => {
        console.log(data);
        $('#simulationAreaWrapper').show();
      });
  }

  function finishSimulation(results) {
    $('#simulationAverage').html(`Average Project Total Time: ${results.avg}`);
    $('#simulationMedian').html(`Median Project Total Time: ${results.median}`);
    $('#simulationMax').html(`Worst Case Project Total Time: ${results.max}`);
    $('#simulationMin').html(`Best Case Project Total Time: ${results.min}`);
    $('#simulationRunningTime').html(`Simulation Running Time (ms): ${results.runningTime}`);
    $('#simulationStandRange').html(`Projected Likey Range: ${results.likelyMin} - ${results.likelyMax}`);
    $('#simulationStandDev').html(`Standard Deviation: ${results.sd}`);
  }

  function startSimulation() {
    // Clear any existing displays
    $('#simulationAverage').html('');
    $('#simulationMedian').html('');
    $('#simulationMax').html('');
    $('#simulationMin').html('');
    $('#histoGram').html('');
    $('#simulationResultsWrapper').show();

    const settings = {
      data,
      passes: $('#simulationPasses').val(),
      limitGraph: $('#limitGraph').is(':checked'),
    };

    simulator.runSimulation(settings, finishSimulation);
  }

  // The event listener for the file upload
  $('#csvFileInput').change(upload);
  $('#startSimulationButton').click(startSimulation);
  $('#simulationResultsWrapper').hide();
  $('#simulationAreaWrapper').hide();
  $('#addTaskBtn').click(addRowEvent);
  $('#resetBtn').click(dataResetEvent);
});
