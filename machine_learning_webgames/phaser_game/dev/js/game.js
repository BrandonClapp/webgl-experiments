/**
 * PhaserANNGame class
 *
 * @author Glenn De Backer <glenn@simplicity.be>
 *
 */
class PhaserANNGame{

  /**
   * Constructor
   */
  constructor(){
    // init phaser game object
    this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game-container');

    // shared
    this.game.shared = {};

    // add all our states
    this.game.state.add('boot', bootState);
    this.game.state.add('load', loadState);
    this.game.state.add('splash', splashState);
    this.game.state.add('play', playState);

    // 'boot' our game
    this.game.state.start('boot');
  }

}
