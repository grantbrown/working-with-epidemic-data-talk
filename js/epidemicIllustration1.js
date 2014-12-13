

var nodeRadius = 5;
var agentSpeed = 4;
var agentChangeDirFrac = 0.2;
var canvasIsActive = false;

function agent(agentx, agenty, agentdx, agentdy, status, radius, context, city){
  var self = this;
  self.x = agentx;
  self.y = agenty;
  self.dx = agentdx;
  self.dy = agentdy;
  self.originalStatus = status;
  self.status = status;
  self.context = context;
  self.radius = radius;
  self.isTraveling = false;
  self.city = city;

  self.getCityDist = function(){
    return((Math.pow(self.city.x - self.x, 2) + Math.pow(self.city.y - self.y,2)));
  }

  self.setNewDestination = function()
  {
    var newx = self.city.randCoord() + self.city.x;
    var newy = self.city.randCoord() + self.city.y;
    var newVec = [(newx - self.x), (newy - self.y)]
    var norm = Math.abs(newVec[0]) + Math.abs(newVec[1])
    self.dx = newVec[0]/norm*agentSpeed;
    self.dy = newVec[1]/norm*agentSpeed;
  }

  self.getFillStyle = function(){
    if (self.status == 1){return('green')}
    if (self.status == 2){return('yellow')}
    if (self.status == 3){return('red')}
    if (self.status == 4){return('grey')}
  }

  self.getStrokeStyle = function(){
    if (self.status == 1){return('#003300')}
    if (self.status == 2){return('#333300')}
    if (self.status == 3){return('#330000')}
    if (self.status == 4){return('#333333')}
  }

  self.draw = function(){
    self.context.beginPath();
    self.context.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, false);
    self.context.fillStyle = self.getFillStyle();
    self.context.fill();
    //self.context.strokeStyle = self.getStrokeStyle();
    self.context.stroke();
  }

  self.move = function(){
    self.x += self.dx;
    self.y += self.dy;
    if (self.getCityDist() > self.city.cityRadiusSq || (Math.random() < agentChangeDirFrac))
    {
        self.setNewDestination();
    }
  }
  self.setNewDestination();
}


function city(cityx,cityy,nodes, context){
    var self = this;
    self.x = cityx;
    self.y = cityy;
    self.numAgents = nodes;
    self.agents = [];
    self.context = context;
    self.cityRadius = Math.sqrt(self.numAgents)*nodeRadius*nodeRadius;
    self.cityRadiusSq = self.cityRadius*self.cityRadius;

    self.teleport = function(){
      for (l = 0; l<self.agents.length; l++){
        self.agents[l].x = self.randCoord() + self.x;
        self.agents[l].y = self.randCoord() + self.y;
      }
    }

    self.randCoord = function(){
      return((Math.random() - 0.5)*self.cityRadius);
    }

    for (i = 0; i < self.numAgents; i++){
      var newX = self.randCoord() + self.x;
      var newY = self.randCoord() + self.y;
      var newAg = new agent(newX, newY,
                            0,0,1, nodeRadius, self.context, self);
      self.agents.push(newAg);
    }

    self.moveAgents = function(){
      for (i = 0; i < self.numAgents; i++)
      {
        self.agents[i].move();
      }
    }

    self.drawAgents = function(){
      for (i = 0; i < self.numAgents; i++)
      {
        self.agents[i].draw();
      }
    }

    self.updateContext = function(context){
      self.context = context;
      for (z = 0; z < self.agents.length; z++){
        self.agents[z].context = self.context;
      }
    }

    self.resetSimulation = function(){
      for (h = 0; h < self.agents.length; h++){
          self.agents[h].status = self.agents[h].originalStatus;
      }
      self.teleport();
    }
}


epidemicCanvas = function(nameVal)
{
  var self = this;
  self.name = nameVal;
  canvasIsActive = true;
  self.hasInit = false;
  self.isPaused = true;
  self.interval = null;

  self.buildCanvas = function(){
    self.canvas = document.getElementById('epidemicCanvas');
    if (self.canvas != null){
      self.context = self.canvas.getContext('2d');
      self.context.lineWidth = 1;
      self.initialize();
    }
    self.resize();
  }


  self.resize = function(){
    console.log("resizing");
    if (self.canvas != null){
      var height = $(document).height() - 200;
      var parent = $("#epidemicCanvas").parent();
      self.canvas.width = parent.width();
      self.canvas.height = height;

      // Update city coordinates;
      self.cityList[0].x = self.canvas.width/4;
      self.cityList[0].y = self.canvas.height/4;
      self.cityList[1].x = self.canvas.width - self.canvas.width/4;
      self.cityList[1].y = self.canvas.height - self.canvas.height/4;
      self.cityList[2].x = self.canvas.width - self.canvas.width/3;
      self.cityList[2].y = self.canvas.height/4;
      for (k = 0; k < self.cityList.length; k++){self.cityList[k].teleport();}
    }
  }

  self.moveAndPlotAgents = function(){
    for (j = 0; j < self.cityList.length; j++)
    {
      self.cityList[j].moveAgents();
    }
    self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
    for (k = 0; k < self.cityList.length; k++)
    {
      self.cityList[k].drawAgents();
    }

  }
  self.initialize = function(){
    if (self.hasInit){
      for (k = 0; k < self.cityList.length; k++){
        self.cityList[k].updateContext(self.context);
      }
    }
    else{
      self.hasInit = true;
      self.cityList = [new city(self.canvas.width/4, self.canvas.height/4, 10, self.context),
                       new city(self.canvas.width - self.canvas.width/4, self.canvas.height - self.canvas.height/4, 10, self.context),
                       new city(self.canvas.width - self.canvas.width/3, self.canvas.height/4 , 5, self.context)]
    }
  }

  self.resetSimulation = function(){
    for (h = 0; h < self.cityList.length; h++){
          self.cityList[h].resetSimulation();
    }
  }

  self.playPause = function(){
    if (self.interval == null){
          self.interval = setInterval(function(){
          self.moveAndPlotAgents();
      }, 10)
    }
    else{
      clearInterval(self.interval);
      self.interval = null;
    }
  }

  self.wireUpControls = function(){
    var playPauseButton = $("#epidemic-startbutton");
    var resetButton = $("#epidemic-resetbutton");

    if (playPauseButton != null){
      playPauseButton.unbind();
      resetButton.unbind();

      playPauseButton.click(function(){
        self.isPaused = !self.isPaused;
        self.playPause();
        if (self.isPaused){playPauseButton.text("Play");}
        else {playPauseButton.text("Pause");}
      });
      resetButton.click(function(){
        self.resetSimulation();
      });
    }
  }

  self.buildCanvas();
}

var epidemicCanvasInstance = new epidemicCanvas("MainCanvas");

var activateCanvas = function(){
  console.log("Activate Canvas");
  epidemicCanvasInstance.buildCanvas();
  epidemicCanvasInstance.wireUpControls();
}
