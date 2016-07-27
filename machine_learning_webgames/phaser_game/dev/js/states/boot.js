/**
 * Boot state
 * @author Glenn De Backer <glenn@simplicity.be>
 */
var bootState = {

  /**
   * Preload
   */
  preload(){
    // load settings
    this.game.load.json('settings', 'settings.json');
  },

  /**
   * Create
   */
  create(){
    // call the load state
    this.game.state.start('load');
  }
}
