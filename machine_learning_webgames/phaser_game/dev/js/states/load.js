/**
 * Load state
 * @author Glenn De Backer <glenn@simplicity.be>
 */
var loadState = {

  /**
   * Preload
   */
  preload(){
    // load neural network json
    this.game.load.json('neuralnetwork_json', 'network.json');

    // load image assets
    this.game.load.image('background', 'assets/img/bg.png');
    this.game.load.image('logo', 'assets/img/logo.png');
    this.game.load.spritesheet('reset_buttons', 'assets/img/reset_buttons.png', 200, 90);
    this.game.load.image('tile', 'assets/img/tile.png');
    this.game.load.image('x', 'assets/img/x.png');
    this.game.load.image('o', 'assets/img/o.png');
  },

   /**
   * Load neural network
   * @return {[type]} [description]
   */
  loadNeuralNetwork(settings){
    // construct ANN
    this.game.neuralnetwork = new NN(
      settings.neuralnetwork.input,
      settings.neuralnetwork.hidden,
      2
    );

    // import trained network
    this.game.neuralnetwork.importNetwork(
      this.game.cache.getJSON('neuralnetwork_json')
    );
  },

  /**
   * Create
   */
  create(){
    // get settings
    let settings = this.game.cache.getJSON('settings');

    // load neural neuralnetwork
    this.loadNeuralNetwork(settings);

    // call the splash state
    this.game.state.start('splash');
  }


}
