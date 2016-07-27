/**
 * Play state
 * @author Glenn De Backer <glenn@simplicity.be>
 */
var playState = {

  /**
   * Create
   */
  create(){
    // settings
    let settings = this.game.cache.getJSON('settings');

    // setup our brushes
    this.setupBrushes();

    // hold our active tile
    this.activeTileName = null;

    // hold our tiles
    this.tiles = [];

    // hold references to tweens
    this.tweens = [];

    // hold our dynamic textures for our tiles
    this.tilesBitmapData = [];

    // output bitmapdata
    this.outputBitmapData = this.game.make.bitmapData(150, 150);
    //this.outputBitmapData.addToWorld(); // show output

    // create our background
    this.createBackground();

    // create reset button
    this.createResetButton();

    // create our grid
    this.createGridTile('tile_1', 80,60);
    this.createGridTile('tile_2', 240,60);
    this.createGridTile('tile_3', 400,60);

    this.createGridTile('tile_4', 80,225);
    this.createGridTile('tile_5', 240,225);
    this.createGridTile('tile_6', 400,225);

    this.createGridTile('tile_7', 80,390);
    this.createGridTile('tile_8', 240,390);
    this.createGridTile('tile_9', 400,390);

    // setup output canvas
    this.setupOutputCanvas(settings);

    // setup our mouse move callback
    this.game.input.addMoveCallback(this.mouseMove, this);
  },

  /**
   * Setup output canvas
   */
  setupOutputCanvas(settings){
    // create output canvas
    this.outputCanvasElem = document.createElement("canvas");
    this.outputCanvasElem.setAttribute("id", "output-canvas");
    this.outputCanvasElem.setAttribute("width", settings.neuralnetwork.input);
    this.outputCanvasElem.setAttribute("height", settings.neuralnetwork.input);

    // append output canvas
    document.body.appendChild(this.outputCanvasElem);
  },

  /**
   * Setup brushes
   */
  setupBrushes(brushSize = 4){
    // our tile brush
    this.brushTile = this.game.make.bitmapData(brushSize, brushSize);
    this.brushTile.circle(brushSize/2, brushSize/2, brushSize/2, 'rgba(93, 149, 255,0.8)');

    // our output brush
    this.brushOutput = this.game.make.bitmapData(brushSize, brushSize);
    this.brushOutput.circle(brushSize/2, brushSize/2, brushSize/2, 'rgba(255,255,255,1.0)');
  },

  /**
   * Create background
   */
  createBackground(){
    // grid
    this.background = this.game.add.sprite(0, 0, 'background');
    this.background.scale.x = 1.1;
    this.background.scale.y = 1.1;

    // logo
    this.logo = this.game.add.sprite(20, 550, 'logo');
    this.logo.scale.x = 0.8;
    this.logo.scale.y = 0.8;
    this.logo.alpha = 0.8;
  },

  /**
   * Create reset button
   */
  createResetButton(){
    // add button
    this.resetButton = this.game.add.button(615, 60, 'reset_buttons', this.resetGame, this, 2, 1, 0);
    this.resetButton.scale.x = 0.6;
    this.resetButton.scale.y = 0.6;
  },

  /**
   * Create grid tile
   *
   * @param  {string} name   of grid
   * @param  {int} x      position
   * @param  {int} y      position
   * @param  {int} width
   * @param  {int} height
   */
  createGridTile(name, x, y, width = 150, height = 150){

    // create sprite
    this.tiles[name]                     = this.game.add.sprite(x, y);
    this.tiles[name].name                = name;
    this.tiles[name].inputEnabled        = true;
    this.tiles[name].input.useHandCursor = true;
    this.tiles[name].classification      = null;

    // setup events
    this.tiles[name].events.onInputDown.add(this.tileMouseDown, this);
    this.tiles[name].events.onInputOut.add(this.tileMouseLeave, this);

    // create bitmapdata (dynamic texture)
    this.tilesBitmapData[name] = this.game.make.bitmapData(width, height);
    this.tilesBitmapData[name].copy('tile');


    // assign texture to sprite
    this.tilesBitmapData[name].add(this.tiles[name]);
  },

  /**
   * Reset game
   */
  resetGame(){

    // remove any animations
    for(let tileName in this.tweens){
      this.tweens[tileName].stop();
      this.tiles[tileName].alpha = 1;
    }

    // reset textures
    for(let tileName in this.tilesBitmapData){
      this.tilesBitmapData[tileName].clear();
      this.tilesBitmapData[tileName].copy('tile');
    }

    // reset any previous classification
    for(let tileName in this.tiles){
      this.tiles[tileName].classification      = null;
    }
  },

  /**
   * Clear tile
   * @param  {string} name of tile to clear
   */
  clearTile(name){
    // copy empty tile
    this.tilesBitmapData[name].copy('tile');
  },

  /**
   * Handles when mouse down event is occuring over a tile
   */
  tileMouseDown(sprite, pointer){
    // store active tile name
    this.activeTileName = sprite.name;
  },

  /**
   * Handles when mouse up event is occuring over a tile
   */
  tileMouseLeave(sprite, pointer){
    if(this.activeTileName !== null){
        // delete active tile name
        this.activeTileName = null;

        // resize output bitmapdata to format that
        // will be classified by our neural network
        pica.resizeCanvas(this.outputBitmapData.canvas, this.outputCanvasElem,{},function(){
          // classify tile
          this.classifyActiveTile().then(function(result){

            // store result in tile object
            let classification = (result[0] > result[1]) ? "o" : "x";
            this.tiles[sprite.name].classification = classification;

            // update tile texture that represent classification
            this.tilesBitmapData[sprite.name].clear();
            this.tilesBitmapData[sprite.name].copy(classification);

            // clear output bitmapdata
            this.outputBitmapData.clear();

            // checkBoard for winner
            let winnerInfo = this.checkBoard();

            if(winnerInfo.winner){
              // console.log(`winner: ${winnerInfo.winner}`);
              // console.log(winnerInfo.winnerTiles);
              for(tileName of winnerInfo.winnerTiles){
                // animate winning tiles
                this.tweens[tileName] = this.game.add.tween(this.tiles[tileName]).to( { alpha: [0, 1] }, 900, "Linear", true);
                this.tweens[tileName].repeat(500, 200);
              }
            }

          }.bind(this))
        }.bind(this));
    }
  },

  /**
   * Classify active tile
   */
  classifyActiveTile(){

    // create promise object
    let promise = new Promise(function(resolve, reject) {

      let pixels = [];

      // get pixels data
      let ctx = this.outputCanvasElem.getContext('2d');
      let pixelsData = ctx.getImageData(0, 0, this.outputCanvasElem.width, this.outputCanvasElem.height).data;

      // iterate over pixel data
      for(let i=0; i<pixelsData.length; i+=4) {
        // get R values (as G,B is the same when using B&W)
        let red = pixelsData[i];

        // normalize between 0.0 and 1.0
        // and store into pixels array
        pixels.push(red / 255.0);
      }

      // classify
      let results = this.game.neuralnetwork.classify(pixels);

      resolve(results);
    }.bind(this));

    return promise;
  },

  /**
   * Handles mouse move callback
   */
  mouseMove(pointer, x,y){
    if(pointer.isDown && this.activeTileName !== null){
      this.draw(x,y);
    }
  },

  /**
   * Draw
   */
  draw(mouseX, mouseY){
    // calculate relative x and y coordinates
    let relX = mouseX - this.tiles[this.activeTileName].x;
    let relY = mouseY - this.tiles[this.activeTileName].y;

    // draw
    this.tilesBitmapData[this.activeTileName].draw(this.brushTile, relX, relY);
    this.outputBitmapData.draw(this.brushOutput, relX, relY);
  },

  /**
   * Check board
   */
  checkBoard(){

    let winner = null;
    let winnerTiles = [];

    // check horizontal

    for(var x = 1, xMax = 9; x <= xMax ; x+=3 ){
      if(this.tiles[`tile_${x}`].classification == null ){
        continue;
      }else if(this.tiles[`tile_${x}`].classification !== this.tiles[`tile_${x + 1}`].classification){
        continue;
      }else if(this.tiles[`tile_${x+1}`].classification !== this.tiles[`tile_${x + 2}`].classification){
        continue;
      }

      // store winner and winning tiles
      winner = this.tiles[`tile_${x}`].classification;
      winnerTiles.push(`tile_${x}`);
      winnerTiles.push(`tile_${x + 1}`);
      winnerTiles.push(`tile_${x + 2}`);
    }

    // check vertical
    if(winner === null){
      winnerTiles = [];

      for(var y = 1, yMax = 3; y <= yMax ; y++ ){
        // if first item is null we can skip the rest
        if(this.tiles[`tile_${y}`].classification == null ){
          continue;
        }else if(this.tiles[`tile_${y}`].classification !== this.tiles[`tile_${y + 3}`].classification){
          continue;
        }else if(this.tiles[`tile_${y+3}`].classification !== this.tiles[`tile_${y + 6}`].classification){
          continue;
        }

        // store winner and winning tiles
        winner = this.tiles[`tile_${y}`].classification;
        winnerTiles.push(`tile_${y}`);
        winnerTiles.push(`tile_${y + 3}`);
        winnerTiles.push(`tile_${y + 6}`);
      }
    }

    // diagonal left -> right
    if(winner === null){
      winnerTiles = [];

      if(this.tiles['tile_1'].classification !== null){
        if(this.tiles['tile_1'].classification === this.tiles['tile_5'].classification){
          if(this.tiles['tile_5'].classification === this.tiles['tile_9'].classification){

            // store winner and winning tiles
            winner = this.tiles['tile_1'].classification;
            winnerTiles.push(`tile_1`);
            winnerTiles.push(`tile_5`);
            winnerTiles.push(`tile_9`);

          }
        }
      }
    }

    // diagonal right -> left
    if(winner === null){
      winnerTiles = [];

      if(this.tiles['tile_3'].classification !== null){
          if(this.tiles['tile_3'].classification === this.tiles['tile_5'].classification){
            if(this.tiles['tile_5'].classification === this.tiles['tile_7'].classification){

              // store winner and winning tiles
              winner = this.tiles['tile_3'].classification;
              winnerTiles.push(`tile_3`);
              winnerTiles.push(`tile_5`);
              winnerTiles.push(`tile_7`);
            }
          }
      }
    }

    return { winner: winner, winnerTiles: winnerTiles};
  }



}
