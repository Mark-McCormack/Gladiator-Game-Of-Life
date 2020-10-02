import { Component, OnInit } from '@angular/core';

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
  monteCarloSimulations: number;
  turns: number;
  prediction: any;
  spawnrate: any;
  loop: any;

  constructor() {}

  ngOnInit(): void {
    //Initialise Grid and Canvas
    this.monteCarloSimulations = 10;
    this.turns = 2;
    this.spawnrate = 0.20;
    this.canvas = this.createCanvas();
    this.grid = this.createGrid();
      
  }

  createCanvas() {
    //Create Canvas & Context to Draw On
    var canvas = <HTMLCanvasElement>document.getElementById('board');
    var context = canvas.getContext('2d');

    this.vertical = 500;
    this.horizontal = 500;

    //Vertical Lines
    for (let index = 0; index < this.vertical * 20; index += 20) {
      context.moveTo(0, index);
      context.lineTo(this.vertical, index);
      context.stroke();
    }

    //Horizontal Lines
    for (let index = 0; index < this.horizontal * 20; index += 20) {
      context.moveTo(index, 0);
      context.lineTo(index, this.horizontal);
      context.stroke();
    }

    return context;
  }

  createGrid() {
    clearInterval(this.loop);
    //Make Current & Next Grid
    this.grid = [];
    this.nextGrid = [];

    //Create 2D Array
    for (var i = 0; i < this.vertical / 20; i++) {
      this.grid[i] = [];
    }

    for (var i = 0; i < this.horizontal / 20; i++) {
      this.nextGrid[i] = [];
    }

    //Randomly Populate the Current Grid for Player **CAN BE HALVED**
    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        if (i < this.horizontal / 40) {
          this.grid[i][j] = [Math.round(Math.random() - this.spawnrate), true];
        }
      }
    }

    //Monte Carlo populates the current grid with its best guess
    for(var k = 0; k < this.monteCarloSimulations; k++){
      for (var i = 0; i < this.vertical / 20; i++) {
        for (var j = 0; j < this.horizontal / 20; j++) {
          if (i > this.horizontal / 40) {
            this.grid[i][j] = [Math.round(Math.random() - this.spawnrate), false];
          }
        }
      }

      //Monte Carlo: If Blue wins, use this setup. Else, try another config
      if(this.monteCarlo(this.turns, this.grid)){ 
        break;
      }
    }
    this.applyGrid();
    return this.grid;
  }

  applyGrid() {
    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        if (
          //If the Cell is Dead, Colour it White
          JSON.stringify(this.grid[i][j]) == JSON.stringify([0, true]) ||
          JSON.stringify(this.grid[i][j]) == JSON.stringify([0, false])
        ) {
          this.canvas.fillStyle = '#FFFFFF';
          this.canvas.fillRect(i * 20, j * 20, 19, 19);
        } else if (
          //If the Cell is Alive & Red, Colour it Red
          JSON.stringify(this.grid[i][j]) == JSON.stringify([1, true])
        ) {
          this.canvas.fillStyle = '#F22B29';
          this.canvas.fillRect(i * 20, j * 20, 19, 19);
        } else if (
          //If the Cell is Alive & Blue, Colour it Blue
          JSON.stringify(this.grid[i][j]) == JSON.stringify([1, false])
        ) {
          this.canvas.fillStyle = '#0077B6';
          this.canvas.fillRect(i * 20, j * 20, 19, 19);
        }
      }
    }
  }

  loopBoard(){
    this.loop = setInterval(() => { this.step(this.grid);}, 500);
  }

  resetGrid() {
    //Kill all Cells in the Table
    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        this.grid[i][j] = [0, false];
      }
    }

    //Restore the Grid Lines
    this.applyGrid();
    clearInterval(this.loop);
  }

  step(grid) {
    //Check cells using rules
    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        //If Dead and Has 3 Neighbours, Cell Lives
        if ((JSON.stringify(grid[i][j]) == JSON.stringify([0, true]) || JSON.stringify(grid[i][j]) == JSON.stringify([0, false])) && this.neighbour(i, j) === 3) {
          this.nextGrid[i][j] = [1, this.red];
        }
        //If Alive and Has < 3 or > 2 Neighbours, Cell Dies
        else if ((JSON.stringify(grid[i][j]) == JSON.stringify([1, true]) || JSON.stringify(grid[i][j]) == JSON.stringify([1, false])) && (this.neighbour(i, j) < 2 || this.neighbour(i, j) > 3)) {
          this.nextGrid[i][j] = [0, this.red];
        }
        //If Alive and Has 2 Neighbours, Cell Lives
        else if ((JSON.stringify(grid[i][j]) == JSON.stringify([1, true]) || JSON.stringify(grid[i][j]) == JSON.stringify([1, false])) && (this.neighbour(i, j) === 2 || this.neighbour(i, j) === 3)) {
          this.nextGrid[i][j] = [1, this.red];
        }
      }
    }

    //Update the Grid and check Results
    this.grid = this.nextGrid.slice(0);
    this.checkWin(this.grid);

    this.applyGrid();
    return this.nextGrid.slice(0);
  }

  monteCarloStep(grid) {

    var nextGrid = [];

    //Create 2D Array
    for (var i = 0; i < this.vertical / 20; i++) {
      nextGrid[i] = [];
    }

    //Check cells using rules
    for (var i = 0; i < this.vertical / 20; i++) {
      for (var j = 0; j < this.horizontal / 20; j++) {
        //If Dead and Has 3 Neighbours, Cell Lives
        if ((JSON.stringify(grid[i][j]) == JSON.stringify([0, true]) || JSON.stringify(grid[i][j]) == JSON.stringify([0, false])) && this.neighbour(i, j) === 3) {
          nextGrid[i][j] = [1, this.red];
        }
        //If Alive and Has < 3 or > 2 Neighbours, Cell Dies
        else if ((JSON.stringify(grid[i][j]) == JSON.stringify([1, true]) || JSON.stringify(grid[i][j]) == JSON.stringify([1, false])) && (this.neighbour(i, j) < 2 || this.neighbour(i, j) > 3)) {
          nextGrid[i][j] = [0, this.red];
        }
        //If Alive and Has 2 Neighbours, Cell Lives
        else if ((JSON.stringify(grid[i][j]) == JSON.stringify([1, true]) || JSON.stringify(grid[i][j]) == JSON.stringify([1, false])) && (this.neighbour(i, j) === 2 || this.neighbour(i, j) === 3)) {
          nextGrid[i][j] = [1, this.red];
        }
      }
    }

    //Return the Next Step
    return nextGrid.slice(0);
  }

  checkWin(grid) {
    var red = 0;
    var blue = 0;

    for (let i = 0; i < this.vertical / 20; i++) {
      for (let j = 0; j < this.horizontal / 20; j++) {
        //If A Red Cell Is Found, Increase Its Count
        if (JSON.stringify(grid[i][j]) === JSON.stringify([0, true]) || JSON.stringify(grid[i][j]) === JSON.stringify([1, true])) {
          red++;
        }
        //If A Blue Cell Is Found, Increase Its Count
        else if (JSON.stringify(grid[i][j]) === JSON.stringify([0, false]) || JSON.stringify(grid[i][j]) === JSON.stringify([1, false])) {
          blue++;
        }
      }
    }

    //If A Cell Type is Extinct, The Other Wins
    if (red == 0) { console.log('Blue Wins!'); return true; } 
    else if (blue == 0) { console.log('Red Wins!'); return false; } 
    else if(JSON.stringify(this.nextGrid) === JSON.stringify(this.grid)){ console.log('Draw'); }
  }

  neighbour(positionX, positionY) {
    let count = 0;
    let red = 0;
    let blue = 0;

    for (var x = positionX - 1; x <= positionX + 1; x++) {
      for (var y = positionY - 1; y <= positionY + 1; y++) {
        //If we are on the current cell, do nothing
        if (x == positionX && y == positionY) {continue;}

        //If we are out of bounds, do nothing
        if (x < 0 || y < 0 || x >= this.grid.length || y >= this.grid[x].length) {continue;}

        //If cells are alive and red, increment appropriately
        if (JSON.stringify(this.grid[x][y]) === JSON.stringify([1, true])) {
          count++;
          red++;
        } 
        
        //If cells are alive and blue, increment appropriately
        else if (JSON.stringify(this.grid[x][y]) === JSON.stringify([1, false])) {
          count++;
          blue++;
        }
      }
    }

    if (red > blue) {
      this.red = true;
    } else if (red < blue) {
      this.red = false;
    } else if (red === blue) {
    }

    return count;
  }

  monteCarlo(depth, grid) {
    if (this.checkWin(grid)) {
      return true;
    }
    if (depth === 0) {
      return false;
    } else {
      //step the local grid alone
      var clone = Object.assign({}, grid);
      clone = this.monteCarloStep(clone);

      //Run this but stepped
      this.monteCarlo(depth - 1, clone);
    }
  }
}
