// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { remote } = require('electron');

const $ = global.jQuery = require('jquery');
const simulator = remote.require('./src/simulation.js');

$(document).ready(function() {
  var data = [];
  // https://cmatskas.com/importing-csv-files-using-jquery-and-html5/
  // http://evanplaice.github.io/jquery-csv/examples/basic-usage.html
  // https://github.com/evanplaice/jquery-csv/

  // The event listener for the file upload
  $('#csvFileInput').change(upload);
  $('#startSimulationButton').click(runSimulation);
  $('#simulationResultsWrapper').hide();
  $('#simulationAreaWrapper').hide();
  $('#addTaskBtn').click(addRowEvent);
  $('#resetBtn').click(dataResetEvent);

  // Method that checks that the browser supports the HTML5 File API
  function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      isCompatible = true;
    }
    return isCompatible;
  }

  function addRowEvent() {
    var row = {};
    row.Task = $('#taskNameInput').val();
    row.Min = $('#minInput').val();
    row.Max = $('#maxInput').val();
    row.Confidence = parseFloat($('#confidenceInput').val())/100.0 ;
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

    if (!browserSupportFileUpload()) {
      alert('The File APIs are not supported by this browser!');
    } else {

      var file = evt.target.files[0];
      var reader = new FileReader();
      reader.readAsText(file);
      reader.onerror = function() {
        alert('Unable to read ' + file.fileName);
      };

      reader.onload = function(event) {
        var csvData = event.target.result;
        data = $.csv.toObjects(csvData);
        if (data && data.length > 1) {
          $.each(data, function(index, row) {
            addTaskRow(row);
          });
          $('#simulationAreaWrapper').show();
        } else {
          alert('No data to import!');
        }
      };
    }
  }

  function addTaskRow(row) {
    var cells = "<td>" + row.Task; + "</td>/n";
    cells += "<td>" + row.Max; + "</td>/n";
    cells += "<td>" + row.Min; + "</td>/n";
    cells += "<td>" + row.Confidence; + "%</td>/n";
    $('#rawData table').append('<tr class="data">' + cells+ "</tr>");
  }
});
