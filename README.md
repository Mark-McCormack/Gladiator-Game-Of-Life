

<div style = "text-align: center;">

# Gladiator "Game of Life"

![Angular](https://img.shields.io/badge/angular%20-%23DD0031.svg?&style=for-the-badge&logo=angular&logoColor=white) ![Node.JS](https://img.shields.io/badge/node.js%20-%2343853D.svg?&style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript%20-%23007ACC.svg?&style=for-the-badge&logo=typescript&logoColor=white)

</div>

#### Introduction

Gladiator "Game of Life" was developed to examine the emergent strategies a group of cells would develop in order to survive. Building on ["Conways Game of Life"](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), the goals of this project were to:

- Implement Conways Game of Life, and build in the concept of teams, where the neighbours of a cell influence its team status.
- Investigate what behaviours emerge that allow teams the best probability of surviving in future generations.
- Develop a heuristic which can influence the choices each team makes.

<h4>Table of Contents</h4>

- [Introduction](#introduction)
- [Description](#description)
- [Usage](#usage)
- [Links](#links)

#### Description

- This project uses the AngularJS Framework. The project is broken up into individual components for each of the play styles. Much of the choices need minimal input from the player and run themselves. 

#### Usage

- After downloading this project, be sure to install the required node modules. Be sure that you have NPM installed on your machine.

```shell
npm install
```

- This project will be hosted on Github Pages soon. Settings for the methods will be displayed on screen. The game will be displayed on a HTML Canvas in the center of the screen, with controls below. A detailed explanation is provided for each method beside the settings.

##### Player Choice
- Selecting the "Player Choice" method will have the player setup the left side of the simulation. After confirming their choice, the A.I will use its experience from past games to play what it thinks to be the best strategy against its component.

#### Links
<h5>- Further Readings</h5>

- [Inventing Game of Life with John Conway](https://www.youtube.com/watch?v=R9Plq-D1gEk): Game explained by its inventor.

<h5>- References</h5>

- [Conway's "Game of Life"](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) via Wikipedia

- [Monte Carlo Algorithm](https://en.wikipedia.org/wiki/Monte_Carlo_algorithm) via Wikipedia

- [Machine Learning](https://en.wikipedia.org/wiki/Machine_learning) via Wikipedia

- [Tensorflow.JS](https://www.tensorflow.org/js) used for Machine Learning