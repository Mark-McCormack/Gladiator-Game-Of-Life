import { Component, OnInit } from '@angular/core';
import * as tf from '@tensorflow/tfjs';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {
  grid: any[];
  nextGrid: any[];
  canvas: CanvasRenderingContext2D;
  red: boolean;
  horizontal: any;
  vertical: any;
  turns: number;
  spawnrate: any;
  loop: any;

  // Training state
  isTraining: boolean = false;
  trainingStatus: string = '';

  constructor() {}

  ngOnInit(): void {
    this.turns = 2;
    this.spawnrate = 0.3;
    this.canvas = this.createCanvas();
    this.grid = this.createGrid();
  }

  createCanvas() {
    var canvas = <HTMLCanvasElement>document.getElementById('board');
    var context = canvas.getContext('2d');
    this.vertical = 500;
    this.horizontal = 500;

    for (let index = 0; index < this.vertical * 20; index += 20) {
      context.moveTo(0, index);
      context.lineTo(this.vertical, index);
      context.stroke();
    }
    for (let index = 0; index < this.horizontal * 20; index += 20) {
      context.moveTo(index, 0);
      context.lineTo(index, this.horizontal);
      context.stroke();
    }
    return context;
  }

  createGrid() {
    clearInterval(this.loop);
    this.grid = [];
    this.nextGrid = [];

    for (var i = 0; i < this.vertical / 20; i++) {
      this.grid[i] = [];
      this.nextGrid[i] = [];
    }

    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        let isRed = Math.random() < 0.5; // 50% chance for red or blue
        let isAlive = Math.random() < this.spawnrate; // Based on spawn rate

        if (isAlive) {
          this.grid[i][j] = [1, isRed]; // Red = true, Blue = false
        } else {
          this.grid[i][j] = [0, false]; // Dead cell
        }
      }
    }

    this.applyGrid();
    return this.grid;
  }

  resetGrid() {
    clearInterval(this.loop);
    this.applyGrid();
  }

  applyGrid() {
    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        if (
          JSON.stringify(this.grid[i][j]) == JSON.stringify([0, true]) ||
          JSON.stringify(this.grid[i][j]) == JSON.stringify([0, false])
        ) {
          this.canvas.fillStyle = '#FFFFFF';
        } else if (
          JSON.stringify(this.grid[i][j]) == JSON.stringify([1, true])
        ) {
          this.canvas.fillStyle = '#F22B29';
        } else if (
          JSON.stringify(this.grid[i][j]) == JSON.stringify([1, false])
        ) {
          this.canvas.fillStyle = '#0077B6';
        }
        this.canvas.fillRect(i * 20, j * 20, 19, 19);
      }
    }
  }

  async trainModel() {
    try {
      this.isTraining = true;
      this.trainingStatus = 'Training in progress...';
      console.log('Training started');

      // Generate training data
      const { inputs, labels } = await this.generateTrainingData();
      console.log(
        `Training data generated. Number of examples: ${inputs.length}`
      );

      // Convert training data to tensors
      const inputTensor = tf.tensor2d(inputs);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);
      console.log('Data converted to tensors');

      // Build the model
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          units: 64,
          activation: 'relu',
          inputShape: [inputs[0].length],
        })
      );
      model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

      model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy'],
      });
      console.log('Model compiled');

      // Training the model
      await model.fit(inputTensor, labelTensor, {
        epochs: 10,
        batchSize: 32,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(
              `Epoch ${epoch + 1} ended. Loss: ${logs.loss.toFixed(
                4
              )}, Accuracy: ${logs.acc.toFixed(4)}`
            );
            this.trainingStatus = `Epoch ${
              epoch + 1
            } / 10: Loss = ${logs.loss.toFixed(
              4
            )}, Accuracy = ${logs.acc.toFixed(4)}`;
          },
          onTrainEnd: () => {
            this.isTraining = false;
            this.trainingStatus = 'Training complete!';
            console.log('Training complete');
          },
        },
      });
    } catch (error) {
      this.isTraining = false;
      this.trainingStatus = 'Training failed!';
      console.error('Training failed: ', error);
    }
  }

  async predictOutcome() {
    try {
      const model = await tf.loadLayersModel(
        'localstorage://game-of-life-model'
      );
      console.log('Model loaded for prediction');

      let flattenedGrid = this.flattenGrid(this.grid);
      const inputTensor = tf.tensor2d([flattenedGrid]);

      const prediction = model.predict(inputTensor) as tf.Tensor;
      const predictedWinner = prediction.dataSync()[0] > 0.5 ? 'Red' : 'Blue';

      console.log(`Predicted Winner: ${predictedWinner}`);
      this.isTraining = true;
      this.trainingStatus = `Predicted Winner: ${predictedWinner}`;
    } catch (error) {
      console.error('Prediction failed: ', error);
    }
  }

  // Step function to advance one step in the Game of Life
  step() {
    console.log('Executing step...');
    this.grid = this.stepGame(this.grid);
    this.applyGrid(); // Refresh the canvas with the new grid state
  }

  // Loop function to keep advancing the grid at regular intervals
  loopBoard() {
    if (this.loop) {
      clearInterval(this.loop);
      this.loop = null;
      console.log('Game loop stopped.');
    } else {
      this.loop = setInterval(() => {
        this.step();
      }, 500); // Run the step function every 500ms
      console.log('Game loop started.');
    }
  }

  // Helper function that simulates one step of the game
  stepGame(grid: any[]) {
    let newGrid = JSON.parse(JSON.stringify(grid));

    for (let i = 0; i < this.vertical / 20; i++) {
      for (let j = 0; j < this.horizontal / 20; j++) {
        if (grid[i] && grid[i][j] && grid[i][j].length > 0) {
          let neighbors = this.neighbour(i, j);

          if (grid[i][j][0] === 1 && (neighbors < 2 || neighbors > 3)) {
            newGrid[i][j][0] = 0; // Cell dies
          } else if (grid[i][j][0] === 0 && neighbors === 3) {
            newGrid[i][j][0] = 1; // Cell is born
          }
        }
      }
    }

    return newGrid;
  }

  flattenGrid(grid: any[]): number[] {
    let flattened = [];
    for (let row of grid) {
      for (let cell of row) {
        flattened.push(cell[0]);
      }
    }
    return flattened;
  }

  async generateTrainingData(): Promise<{
    inputs: number[][];
    labels: number[];
  }> {
    let inputs = [];
    let labels = [];

    console.log('Generating training data...');

    // Simulate a large number of games
    for (let i = 0; i < 1000; i++) {
      this.grid = this.createGrid(); // Random grid
      let winner = this.checkWin(this.grid); // Determine the winner
      let flattenedGrid = this.flattenGrid(this.grid); // Flatten grid for input

      inputs.push(flattenedGrid);
      labels.push(winner === true ? 1 : winner === false ? 0 : 0); // 1 for red, 0 for blue
    }

    console.log(`Generated ${inputs.length} training examples.`);
    return { inputs, labels };
  }

  // Helper function to count the neighbors of a cell
  neighbour(positionX: number, positionY: number): number {
    let count = 0;
    for (let x = positionX - 1; x <= positionX + 1; x++) {
      for (let y = positionY - 1; y <= positionY + 1; y++) {
        if (x === positionX && y === positionY) continue;
        if (x < 0 || y < 0 || x >= this.grid.length || y >= this.grid[x].length)
          continue;
        if (this.grid[x][y][0] === 1) count++;
      }
    }
    return count;
  }

  checkWin(grid) {
    var red = 0;
    var blue = 0;
    for (let i = 0; i < this.vertical / 20; i++) {
      for (let j = 0; j < this.horizontal / 20; j++) {
        if (JSON.stringify(grid[i][j]) === JSON.stringify([1, true])) red++;
        else if (JSON.stringify(grid[i][j]) === JSON.stringify([1, false]))
          blue++;
      }
    }
    let winner =
      red > 0 ? (blue === 0 ? true : null) : red === 0 ? false : null;
    return winner;
  }
}
