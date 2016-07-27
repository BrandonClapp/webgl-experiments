/**
 * Dataset
 *
 * @author Glenn De Backer <glenn@simplicity.be>
 *
 */
class DataSet{

  /**
   * Default constructor
   */
  constructor(){
    this.dataSet = [];
  }

  /**
   * Add to dataset
   * @param {array} pixels of image
   * @param {int} label of item
   */
  add(pixels, label){
    // add to datasets
    this.dataSet.push({
      input : pixels,
      output : label
    });
  }

  /**
   * Import dataset
   * @param  {string} JSONStr json containing our dataset
   */
  import(JSONStr){
    this.dataSet = JSON.parse(JSONStr);
  }

  /**
   * Get data set
   */
  get(){
    return this.dataSet;
  }

  /**
   * Get number of items
   */
  getNumberOfItems(){
    return this.dataSet.length;
  }

  /**
   * Remove last item
   */
  removeLastItem(){
    this.dataSet.splice(-1, 1);
  }
}
