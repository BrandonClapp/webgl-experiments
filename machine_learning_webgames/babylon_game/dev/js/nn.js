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
   * Import Network
   * @param  {string} jsonNetwork json
   */
  importNetwork(jsonNetwork){
    this.network = Network.fromJSON(jsonNetwork);
  }

}
