/**
 * Neural network
 *
 * @author Glenn De Backer <glenn@simplicity.be>
 *
 */
class NN{

  /**
   * Default constructor
   */
  constructor(downSampledSize, hiddenLayer=100, outputLayer=2){
    // setup our network
    this.inputLayer = new synaptic.Layer(downSampledSize * downSampledSize);
    this.hiddenLayer = new synaptic.Layer(hiddenLayer);
    this.outputLayer = new synaptic.Layer(outputLayer);

    this.inputLayer.project(this.hiddenLayer);
    this.hiddenLayer.project(this.outputLayer);

    this.network = new Network({
        input: this.inputLayer,
        hidden: [this.hiddenLayer],
        output: this.outputLayer
    });

    // setup our trainer
    this.trainer = new Trainer(this.network);
  }

  /**
   * Train
   */
  train(dataSet, callback, rate = .01, iterations = 50, error = .01, log = 1 ){

    // train
    this.trainer.workerTrain(
      dataSet,
      callback,
      {
        rate: rate,
        iterations: iterations,
        error: error,
        shuffle: true,
        log: log,
        cost: Trainer.cost.MSE,
        schedule: {
            every: 1,
            do: function(data) {
              callback(data);
            }
        }
      }
    );
  }

 
  /**
   * Train with cross validation
   */
  trainWithCrossValidation(dataSet, callback, rate = .01, iterations = 50, error = .01, log = 1 ){

    // train
    this.trainer.workerTrain(
      dataSet,
      callback,
      {
        rate: rate,
        iterations: iterations,
        error: error,
        shuffle: true,
        log: log,
        cost: Trainer.cost.MSE,
        crossValidate:{
          testSize: .3,
          testError: .01
        },
        schedule: {
            every: 1,
            do: function(data) {
              callback(data);
            }
        }
      }
    );
  }

  /**
   * Classify
   * @param  {Array} inputs to classify
   * @return {float} label
   */
  classify(inputs){
    return this.network.activate(inputs)
  }

  /**
   * Export Network
   * @return {string} json
   */
  exportNetwork(){
    return this.network.toJSON(false);
  }

  /**
   * Import Network
   * @param  {string} jsonNetwork json
   */
  importNetwork(jsonNetwork){
    this.network = Network.fromJSON(JSON.parse(jsonNetwork));
  }

}
