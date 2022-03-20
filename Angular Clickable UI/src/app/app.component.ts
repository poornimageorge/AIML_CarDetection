import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
// import * as cocoSsd from '@tensorflow-models/coco-ssd';
// import {DetectedObject} from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { output } from './display-image/display-image.component';
import { FileUploadService } from './file-upload.service';


export interface DetectedObject {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  out1: output = { Image: new Image(), ImageName: "01633.jpg", minX: 19, minY: 69, maxX: 525, maxY: 310, class: 'Aston Martin V8 Vantage Convertible 2012', score: 0 }
  out2: output = { Image: new Image(), ImageName: '05479.jpg', minX: 76, minY: 27, maxX: 732, maxY: 265, class: 'Aston Martin V8 Vantage Convertible 2012', score: 0 }
  out3: output

  UploadedImage
  ClassName

  constructor(private fileUploadService: FileUploadService,private http: HttpClient) {
    this.fileUploadService.image.subscribe(x=>{
      this.UploadedImage = x;
    })

    this.http.get('../assets/csv/Car+names+and+make.csv', {responseType: 'text'})
    .subscribe(
        data => {
            this.ClassName = data.split("\n");
            console.log(this.ClassName);
        },
        error => {
            console.log(error);
        }
    );
   }



  async Predict() {

    const modelURL = '../assets/web/online/model.json';
    this.model = await tf.loadGraphModel(modelURL);
    let i = new Image();

    const maxNumBoxes = 30;
    const batched = tf.tidy(() => {
    
      i.src = this.UploadedImage;
      let img:any;
      if (!(i instanceof tf.Tensor)) {
        img = tf.browser.fromPixels(i);
        // img = tf.image.resizeBilinear(img, [320, 320]);
        img = tf.cast(img, 'int32');
      }
      return img.expandDims(0);
    });
    const height = batched.shape[1];
    const width = batched.shape[2];
    // this.out3 = { Image: i,ImageName: '', minX: 19, minY: 69, maxX: 525, maxY: 310, class: 'Aston Martin V8 Vantage Convertible 2012', score: 0 }
    // const ss = this.model.predict(batched)
    const result = await this.model.executeAsync(batched);
    console.log(result);

    const scores = result[2].dataSync() as Float32Array;
    const boxes = result[4].dataSync() as Float32Array;
    const clas = result[1].dataSync() as Float32Array;

    // const boxes0 = result[0].dataSync() as Float32Array;
    // const boxes1 = result[1].dataSync() as Float32Array;
    // const boxes2 = result[2].dataSync() as Float32Array;
    // const boxes3 = result[3].dataSync() as Float32Array;
    // const boxes4 = result[4].dataSync() as Float32Array;
    // const boxes5 = result[5].dataSync() as Float32Array;
    // const boxes6 = result[6].dataSync() as Float32Array;
    // const boxes7 = result[7].dataSync() as Float32Array;

    this.out3 = { Image: i,ImageName: '', minX: boxes[0]*width, minY: boxes[1]*height, maxX: boxes[2]*width, maxY: boxes[3]*height, class: this.ClassName[clas[0]].toString(), score: scores[0] }
   
  }


  getMaxiumScore(scores: Float32Array, numBoxes: number, numClasses: number) {

    const maxes = [];
    const classes = [];
    for (let i = 0; i < numBoxes; i++) {
      let max = Number.MIN_VALUE;
      let index = -1;
      for (let j = 0; j < numClasses; j++) {
        if (scores[i * numClasses + j] > max) {
          max = scores[i * numClasses + j];
          index = j;
        }
      }
      maxes[i] = max;
      classes[i] = index;
    }
    return [maxes, classes];
  }



  title = 'ml-demo';
  @ViewChild('videoCamera', { static: true }) videoCamera: ElementRef;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  model: tf.GraphModel;
  ngOnInit() {
  }



}
