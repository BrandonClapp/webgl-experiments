var app = {}

/**
 * Our main entry point
 */
$(document).ready(function(){
  // load settings
  loadSettings().then(function(){
    // setup labels dropdown
    setupLabels();

    // setup Charts
    setupCharts();

    // init painter control
    app.painterCtrl = new Painter('painter', 24);

    // init dataset
    app.dataSet = new DataSet();

    // will hold our training values
    app.trainingValues = {};

    // get training output element
    app.trainingOutput = $('#training-output');

    // init neural network
    app.neuralNetwork = new NN(
      app.settings.neuralnetwork.input,
      app.settings.neuralnetwork.hidden,
      app.settings.labels.length
    );
  });

})

/**
 * Load settings
 * @return {[type]} [description]
 */
function loadSettings(){

  // create promise object
  let promise = new Promise(function(resolve, reject) {

    // load settings
    $.get('settings.json', function(data){
        // store settings
        app.settings = data;

        // resolve
        resolve();
    });

  }.bind(this));

  return promise;
}

function setupLabels(){
  $.each(app.settings.labels, function (i, item) {
    $('#select-label').append($('<option>', {
        value: item.value,
        text : item.label
    }).attr('data-counter', i));
  });
}

/**
 * Setup chart
 */
function setupCharts(){

  //
  // training chart

  // get training chart canvas element
  app.trainingChartCanvasElem = $("#trainingChart");

  // disable legend
  Chart.defaults.global.legend.display = false;

  // data
  var data = {
     labels: [],
     datasets: [
         {
             label: "MSE",
             fill: false,
             lineTension: 0.0,
             borderColor: "rgba(255,153,0,1)",
             borderCapStyle: 'butt',
             borderDash: [],
             borderDashOffset: 0.0,
             borderJoinStyle: 'miter',
             data: [ ],
         }
     ]
 };

  // set training line chart
  app.trainingLineChart = new Chart(app.trainingChartCanvasElem, {
      type: 'line',
      data: data
  });

  //
  // classify chart

  // get classify chart canvas element
  app.clasifyChartCanvasElem = $("#classifyChart");

  // create array of labels
  let labels = app.settings.labels.map( label => label.label );

  var data = {
     labels: labels,
     datasets: [
         {
             label: "MSE",
             fill: false,
             lineTension: 0.0,
             borderColor: "rgba(255,153,0,1)",
             borderWidth: 2,
             backgroundColor: "rgba(255,153,0,0.6)",
             data: [],
         }
     ]
  };

  // bar chart
  app.classifyBarChart = new Chart(app.clasifyChartCanvasElem, {
      type: 'bar',
      data: data
  })
}

/**
 * Update dataset statistics
 */
function updateDatasetStats(){
  // update total items in dataset
  let spanTotal = $("#dataset-total");
  spanTotal.html(app.dataSet.getNumberOfItems());
}

/**
 * Handle tab switches
 */
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  // get href
  let href = e.target.getAttribute('href');

  // if href is equal to
  if(href === "#training"){
    $('#buttons-container-training').removeClass('hide');
    $('#buttons-container-classify').addClass('hide');
  }else if(href === "#classify"){
    $('#buttons-container-training').addClass('hide');
    $('#buttons-container-classify').removeClass('hide');
  }else if(href === "#export"){
    $('#buttons-container-training').addClass('hide');
    $('#buttons-container-classify').addClass('hide');
  }else if(href === "#import"){
    $('#buttons-container-training').addClass('hide');
    $('#buttons-container-classify').addClass('hide');
  }
})

/**
 * Setup import neural network
 */
$(document).on('click', '.btn-add', function(event){
  var label = [];
  // get selected option
  var selectedOption = $('#select-label').find(":selected");

  // construct label
  for(let i = 0, l = app.settings.labels.length; i < l; i++){
    if(i === selectedOption.data('counter')){
      label.push(1);
    }else{
      label.push(0);
    }
  }

  // add to dataset
  app.painterCtrl.getDownSampledAndNormalizedPixels().then(function(pixels){
    // add to dataset
    app.dataSet.add(pixels ,label);

    // update dataset
    updateDatasetStats();
  });
});

/**
 * Setup start training
 */
$(document).on('click', '.btn-training-start', function(){
  // clear dataset
  app.trainingLineChart.data.labels = [];
  app.trainingLineChart.data.datasets[0].data = [];

  // get training values
  app.trainingValues.learningRate = parseFloat($('#inputNNRate').val());
  app.trainingValues.iterations = parseInt($('#inputNNIterations').val());
  app.trainingValues.error = parseFloat($('#inputNNError').val());
  app.trainingValues.log = parseInt($('#inputNNLog').val());

  // train on dataset
  app.neuralNetwork.train(app.dataSet.get(), function(data){
      // update output
      app.trainingOutput.html(`Iteration: ${data.iterations} / Error: ${data.error}`)

      // only show 25 last datapoints
      if (app.trainingLineChart.data.datasets[0].data.length > app.settings.chart.numberOfVisibleDataPoints){
          // remove first item of array
          app.trainingLineChart.data.labels.shift();
          app.trainingLineChart.data.datasets[0].data.shift();
      }

      // update chart
      app.trainingLineChart.data.labels.push(data.iterations);
      app.trainingLineChart.data.datasets[0].data.push(data.error);
      app.trainingLineChart.update();
    },
    app.trainingValues.learningRate,
    app.trainingValues.iterations,
    app.trainingValues.error,
    app.trainingValues.log
  );
});

/**
 * Setup clear button
 */
$(document).on('click', '.btn-undo', function(){
  // remove last item
  app.dataSet.removeLastItem();

  // update dataset
  updateDatasetStats();
});

/**
 * Setup clear button
 */
$(document).on('click', '.btn-paint-clear', function(){
  app.painterCtrl.clear();
});


/**
 * Setup predict button
 */
$(document).on('click', '.btn-predict', function(){
  // get sampled pixels
  app.painterCtrl.getDownSampledAndNormalizedPixels().then(function(pixels){
    // console.log(app.neuralNetwork.classify(pixels));

    // get results
    let results = app.neuralNetwork.classify(pixels);

    app.classifyBarChart.data.datasets[0].data = results;
    app.classifyBarChart.update();
  });
});

/**
 * Export dataset
 */
$(document).on('click', '.btn-export-dataset', function(){
  var jsonStr = JSON.stringify(app.dataSet.get());
  var blob = new Blob([jsonStr], {type: "application/json"});
  var url  = URL.createObjectURL(blob);
  window.open(url,'_blank');
});

/**
 * Export neural network button
 */
$(document).on('click', '.btn-export-neural-network', function(){
   var jsonStr = JSON.stringify(app.neuralNetwork.exportNetwork());
   var blob = new Blob([jsonStr], {type: "application/json"});
   var url  = URL.createObjectURL(blob);
   window.open(url,'_blank');
});

/**
 * Setup import neural network
 */
$(document).on('change', '#file-import-dataset', function(event){
  // init new filereader
  let reader = new FileReader();

  reader.onload = function(e) {
    // import
    app.dataSet.import(e.target.result);

    // update dataset
    updateDatasetStats();
  };

  reader.readAsText(event.target.files[0]);
});

/**
 * Setup import neural network
 */
$(document).on('change', '#file-import-neural-network', function(event){
  // init new filereader
  let reader = new FileReader();

  reader.onload = function(e) {
    app.neuralNetwork.importNetwork(e.target.result);
  };

  reader.readAsText(event.target.files[0]);
});
