/**
 * Painter control
 *
 * @author Glenn De Backer <glenn@simplicity.be>
 */
class Painter{

  /**
   * Default constructor
   * @param  {string} canvasElemId    id of canvas element
   * @param  {int} downSampledSize    downsampled size (wxh)
   */
  constructor(canvasElemId, downSampledSize){

      // store events
      this._events = {};

      // get canvas element and its context
      this.paintCanvasElem = document.getElementById(canvasElemId);
      this.paintCanvasCTX  = this.paintCanvasElem.getContext('2d')

      // output size
      this.downSampledSize = downSampledSize;

      // mouse properties
      this.mouse = {};

      // is drawing properties
      this.isDrawing = false;

      // is locked
      this.isLocked = true;

      // setup events
      this.setupEvents();

      // setup background color
      this.setupBackground();

      // setup build resize target Canvas
      this.buildResizeCanvas();
  }

  /**
   * Build resize canvas
   */
  buildResizeCanvas(){
    // create output canvas
    this.outputCanvasElem = document.createElement("canvas");
    this.outputCanvasElem.setAttribute("id", "output-canvas");
    this.outputCanvasElem.setAttribute("width", this.downSampledSize);
    this.outputCanvasElem.setAttribute("height", this.downSampledSize);

    // append output canvas
    document.body.appendChild(this.outputCanvasElem);
  }

  /**
   * Clear drawing
   */
  clear(){
    // fill rect
    this.paintCanvasCTX.fillRect(
      0,0,
      this.paintCanvasElem.width, this.paintCanvasElem.height
    );

    // copy output to canvas
    this.copyOutputCanvas();
  }

  /**
   * Copy to output canvas
   */
  copyOutputCanvas(){
    // copy to output context (which will be processed)
    pica.resizeCanvas(
      this.paintCanvasElem,
      this.outputCanvasElem,
      {},
      function(){
      }
    );
  }

  /**
   * Setup events
   */
  setupEvents(){
    // mouse down
    this.paintCanvasElem.addEventListener('mousedown', function(element){
      if(!this.isLocked){
        this.isDrawing = true;
      }
    }.bind(this));

    // mouse up
    this.paintCanvasElem.addEventListener('mouseup', function(element){
      if(!this.isLocked){
        this.isDrawing = false;

        // copy drawing to resize output canvas
        this.copyOutputCanvas();
      }
    }.bind(this));

    // mouse move
    this.paintCanvasElem.addEventListener('mousemove', function(element){
      if(!this.isLocked){
        // store coordinates
        this.mouse.previousX = this.mouse.currentX;
        this.mouse.previousY = this.mouse.currentY;
        this.mouse.currentX = element.offsetX;
        this.mouse.currentY = element.offsetY;

        if(this.isDrawing){
          this.updateDrawing();
        }
      }
    }.bind(this));

    // mouse out
    this.paintCanvasElem.addEventListener('mouseout', function(element){
      // raise event pass downsampled result
      this.raiseEvent('ON_MOUSE_OUT');
    }.bind(this));
  }

  addListener(eventName, callback){
    let events = this._events,
    callbacks = events[eventName] = events[eventName] || [];
    callbacks.push(callback);
  }

  raiseEvent(eventName, args){
    let callbacks = this._events[eventName];
    for (let i = 0, l = callbacks.length; i < l; i++) {
        callbacks[i].apply(null, args);
    }
  }

  setupBackground(){
    // background
    this.paintCanvasCTX.fillStyle = '#000000';
    this.paintCanvasCTX.fill();

    this.paintCanvasCTX.beginPath();
    this.paintCanvasCTX.rect(0, 0, this.paintCanvasElem.width, this.paintCanvasElem.height);
    this.paintCanvasCTX.fillStyle = '#000000';
    this.paintCanvasCTX.fill();
  }

  /**
   * Update drawing
   */
  updateDrawing(){
    // line
    this.paintCanvasCTX.strokeStyle = '#ffffff';
    this.paintCanvasCTX.lineJoin = 'round';
    this.paintCanvasCTX.lineCap = 'round';
    this.paintCanvasCTX.lineWidth = 10;

    this.paintCanvasCTX.beginPath();
    this.paintCanvasCTX.moveTo(this.mouse.currentX, this.mouse.currentY);
    this.paintCanvasCTX.lineTo(this.mouse.previousX, this.mouse.previousY);
    this.paintCanvasCTX.stroke();
    this.paintCanvasCTX.closePath();
  }

  /**
   * Lock prevents drawing
   */
  lock(){
    this.isLocked = true;
  }

  /**
   * Unlock
   */
  unlock(){
    this.isLocked = false;
  }

  /**
   * Get downsampled pixels
   */
  getDownSampledAndNormalizedPixels(){

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

      // resolve pixels
      resolve(pixels);
    }.bind(this));

    return promise;
  }
}
