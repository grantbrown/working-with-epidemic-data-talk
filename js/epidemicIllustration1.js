

var nodeRadius = 10;
var agentSpeed = 10;
var agentChangeDirFrac = 0.1;
var canvasIsActive = false;
var collisionFrames = 1;
var p_ei = 0.08;
var p_ir = 0.05;
var infectProb = 0.5;
var travelProbability = 0.01;

function getMousePos(canvas, evt) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
      };
    }

function absDist(a,b){
  return(Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)));
}


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

  self.infect = function(){
    if (self.status == 1){
      self.status = 2;
      self.draw();
    }
  }

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
    if (self.status == 1){return('blue')}
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
    self.cityRadius = Math.sqrt(self.numAgents*nodeRadius)*nodeRadius;
    self.cityRadiusSq = self.cityRadius*self.cityRadius;

    self.teleport = function(){
      for (var l = 0; l<self.agents.length; l++){
        self.agents[l].x = self.randCoord() + self.x;
        self.agents[l].y = self.randCoord() + self.y;
      }
    }

    self.randCoord = function(){
      return((Math.random() - 0.5)*self.cityRadius);
    }

    for (var i = 0; i < self.numAgents; i++){
      var newX = self.randCoord() + self.x;
      var newY = self.randCoord() + self.y;
      var newAg = new agent(newX, newY,
                            0,0,1, nodeRadius, self.context, self);
      self.agents.push(newAg);
    }

    self.moveAgents = function(){
      for (var i = 0; i < self.numAgents; i++)
      {
        self.agents[i].move();
      }
    }

    self.drawAgents = function(){
      for (var i = 0; i < self.numAgents; i++)
      {
        self.agents[i].draw();
      }
    }

    self.updateContext = function(context){
      self.context = context;
      for (var z = 0; z < self.agents.length; z++){
        self.agents[z].context = self.context;
      }
    }

    self.resetSimulation = function(){
      for (var h = 0; h < self.agents.length; h++){
          self.agents[h].status = self.agents[h].originalStatus;
      }
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
  self.agents = [];
  self.infectionEvents = [];
  self.quadTree = null;
  self.collisionCounter = 0;
  self.timeElapsed = 0;

  self.buildCanvas = function(){
    self.canvas = document.getElementById('epidemicCanvas');
    if (self.canvas != null){
      self.context = self.canvas.getContext('2d');
      self.context.lineWidth = 1;
      self.context.font = '24pt Calibri';
      self.context.textAlign = 'left';
      self.initialize();

      self.canvas.addEventListener('click', function(evt) {
          self.infectSomebody(evt);
      }, false);
    }
    self.resize();
    self.wireUpQuadTree();
  }

  self.legend = function(){
    var radius = 20;
    var xpad = 25;
    var x;
    var y;

    self.context.font = '24pt Calibri';
    x = radius + xpad;
    y = self.canvas.height - radius - xpad;
    self.context.beginPath();
    self.context.arc(x,y, radius, 0, 2 * Math.PI, false);
    self.context.fillStyle = "blue";
    self.context.fill();
    self.context.stroke();
    self.context.fillStyle = "black";

    self.context.fillText("S",x - 0.5*radius,y + 0.5*radius)

    x = 2*radius + 2*xpad;
    self.context.beginPath();
    self.context.arc(x,y, radius, 0, 2 * Math.PI, false);
    self.context.fillStyle = "yellow";
    self.context.fill();
    self.context.stroke();
    self.context.fillStyle = "black";
    self.context.fillText("E",x - 0.5*radius,y + 0.5*radius)

    x = 3*radius + 3*xpad;
    self.context.beginPath();
    self.context.arc(x,y,radius, 0, 2 * Math.PI, false);
    self.context.fillStyle = "red";
    self.context.fill();
    self.context.stroke();
    self.context.fillStyle = "black";
    self.context.fillText("I",x - 0.5*radius,y + 0.5*radius)

    x = 4*radius + 4*xpad;
    self.context.beginPath();
    self.context.arc(x,y, radius, 0, 2 * Math.PI, false);
    self.context.fillStyle = "grey";
    self.context.fill();
    self.context.stroke();
    self.context.fillStyle = "black";
    self.context.fillText("R",x - 0.5*radius,y + 0.5*radius)

  }

  self.resize = function(){
    console.log("resizing");
    if (self.canvas != null){
      var height = $(document).height() - 400;
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
      for (var k = 0; k < self.cityList.length; k++){self.cityList[k].teleport();}
    }
  }

  self.updateCities = function(){
    var ag;
    var totalAgents = self.agents.length;
    var cumProb ;
    var cityDraw;
    for (var k = 0; k < totalAgents; k++){
      ag = self.agents[k];
      if (Math.random() < travelProbability){
          cumProb =0;
          // Traveling;
          cityDraw = Math.random();
          for (var j = 0; j < self.cityList.length; j++){
              cumProb += self.cityList[j].numAgents;
              if (cityDraw < cumProb/totalAgents){
                ag.city = self.cityList[j];
                ag.isTraveling = true;
                break;
              }
          }
      }
    }
  }

  self.moveAndPlotAgents = function(){
    self.timeElapsed += 1;
    if (self.canvas != null){
      for (var j = 0; j < self.agents.length; j++)
      {
        self.agents[j].move();
      }
      self.context.clearRect(0, 0, self.canvas.width, self.canvas.height);
      for (var k = 0; k < self.agents.length; k++)
      {
        self.agents[k].draw();
      }
      self.legend();
      self.collisionCounter +=  1;

      if (self.collisionCounter > collisionFrames)
      {
         self.collisionCounter = 0;
         self.resolveCollisions();
         self.updateInfections();
         self.updateCities();
      }
    }
  }

  self.getInfectionSummaryData = function(){
    var outEvents = [];
    var outArray = [];
    var i;
    for (i = 0; i<self.infectionEvents.length; i++){
      outEvents.push(self.infectionEvents[i] - self.infectionEvents[0]);
    }
    var maxTime = outEvents[outEvents.length-1];

    // Remove duplicate times
    var cumulativeCases = 0;
    var previousTpt = -1;
    var tmp;
    for (i = 0; i < outEvents.length; i++){
      cumulativeCases += 1;
      if (previousTpt == outEvents[i]){
        tmp=outArray[outArray.length - 1];
        tmp[1] = cumulativeCases;
      }
      else{
        outArray.push([outEvents[i], cumulativeCases]);
      }
      previousTpt = outEvents[i];
    }
    return(outArray);
  }

  self.updateInfections = function(){
    var ag;
    for (var i = 0; i < self.agents.length ; i++){
      ag = self.agents[i];
      if (ag.status == 2 && (Math.random() < p_ei)){
        ag.status = 3;
        self.infectionEvents.push(self.timeElapsed);
      }
      else if (ag.status == 3 && Math.random() < p_ir){
        ag.status =4;
      }
    }
  }

  self.wireUpQuadTree = function(){
    delete self.quadTree;
    if (self.canvas != null){
      var pointQuad = true;
      var bounds = {
            x:0,
            y:0,
            width:self.canvas.width,
            height:self.canvas.height
      }
      self.quadTree = new QuadTree(bounds, pointQuad);
      self.quadTree.insert(self.agents);
    }
  }

  self.updateQuadTree = function(){
    self.quadTree.clear();
    self.quadTree.insert(self.agents);
  }

  self.resolveCollisions = function(){
    self.updateQuadTree();
    var a;
    var items;
    var item;
    var len;
    var randomDraw;
    for (var j = 0; j < self.agents.length; j++)
    {
      a = self.agents[j];
      items = self.quadTree.retrieve(a);
      len = items.length;
      for (var k = 0; k < len; k++)
      {
          item = items[k];
          if (a == item){continue;}
          if ((a.status == 3 || item.status == 3) && Math.abs(a.x - item.x) < a.radius && Math.abs(a.y-item.y) < a.radius)
          {
              randomDraw = Math.random();
              if (randomDraw < infectProb)
              {
                  if (a.status == 3 && item.status == 1)
                  {
                      item.status = 2;
                  }
                  else if (a.status == 1 && item.status == 3)
                  {
                      a.status = 2;
                  }
              }
          }
      }
    }
  }

  self.initialize = function(){
    if (self.hasInit){
      for (var k = 0; k < self.cityList.length; k++){
        self.cityList[k].updateContext(self.context);
      }
    }
    else{
      self.hasInit = true;
      self.cityList = [new city(self.canvas.width/4, self.canvas.height/4, 20, self.context),
                       new city(self.canvas.width - self.canvas.width/4, self.canvas.height - self.canvas.height/4, 25, self.context),
                       new city(self.canvas.width - self.canvas.width/3, self.canvas.height/4 , 10, self.context)]
      // Keep a global reference.
      for (var l = 0; l < self.cityList.length; l++){
        for (var g =0; g< self.cityList[l].agents.length; g++){
          self.agents.push(self.cityList[l].agents[g]);
        }
      }

      // Wire up the quad tree for collision
      self.wireUpQuadTree();
    }

  }

  self.resetSimulation = function(){
    self.infectionEvents = [];
    self.timeElapsed = 0;
    var ag;
      for (var l = 0; l<self.agents.length; l++){
        ag = self.agents[l];
        ag.x = ag.city.x + ag.city.randCoord();
        ag.y = ag.city.y + ag.city.randCoord();
        ag.status = 1;
      }
      self.moveAndPlotAgents();
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

  self.infectSomebody = function(evt){
    if (self.canvas != null){
       self.updateQuadTree();
       var rect = self.canvas.getBoundingClientRect();
       var clickx = evt.clientX - rect.left;
       var clicky = evt.clientY - rect.top;
       var click = {x:clickx, y:clicky};

       console.log("Trying to infect somebody at (" + clickx + ", " + clicky + ")");
       var items = self.quadTree.retrieve({x:clickx, y:clicky});
       console.log(items.length + " items found");
       if (items.length == 1){
         items[0].infect();
       }
       else if (items.length > 1){
         var minDist = 1000000;
         var minItem = items[0];
         var dist;
         for (var u = 0; u < items.length; u++){
           var dist = absDist(items[u], click);
           if (dist <= minDist){
             minDist = dist;
             minItem = items[u];
           }
         }
         minItem.infect();
       }
    }
  }

  self.wireUpControls = function(){
    var playPauseButton = $("#epidemic-startbutton");
    var resetButton = $("#epidemic-resetbutton");
    var plotButton = $("#epidemic-plotbutton");
    var infectivitySlider = $("#infectivity-slider");
    var infectiousTimeSlider = $("#infectious-time-slider");
    var travelSlider = $("#travel-slider");

    if (playPauseButton != null){
      playPauseButton.unbind();
      resetButton.unbind();
      plotButton.unbind();


      //travelSlider.unbind();
      //infectiousTimeSlider.unbind();
      //infectivitySlider.unbind();

     $(function() {
        infectivitySlider.slider({
          range: "min",
          value:50,
          min: 0,
          max: 100,
          slide: function( event, ui ) {
            infectProb = ui.value/100;
          }
        });
      });

    $(function() {
       infectiousTimeSlider.slider({
         range: "min",
         value:50,
         min: 1,
         max: 100,
         slide: function( event, ui ) {
           p_ir = (1-ui.value/100)*0.1;
         }
       });
     });

    $(function() {
       travelSlider.slider({
         range: "min",
         value:20,
         min: 0,
         max: 40,
         slide: function( event, ui ) {
           travelProbability = (ui.value/40)*0.02;
         }
       });
     });


      playPauseButton.click(function(){
        self.isPaused = !self.isPaused;
        self.playPause();
        if (self.isPaused){playPauseButton.text("Play");}
        else {playPauseButton.text("Pause");}
      });
      resetButton.click(function(){
        self.resetSimulation();
      });
      plotButton.click(function(){
        if (self.infectionEvents.length == 0){
          $("#modaltextmessage").text("Not enough simulated data - infect a few agents by clicking on them, then run the simulation.");
          $("#modal-div").modal({ keyboard: true, show: true });
        }
        else{
          var rows = self.getInfectionSummaryData();
          var data = new google.visualization.DataTable();
          data.addColumn("number", "X");
          data.addColumn("number", "Y");
          data.addRows(rows);
           var options = {
            width: $(window).width()*0.6,
            height: $(window).height()*0.6,
            pointShape:1,
            pointSize:10,
            legend: 'none',
            hAxis: {
              title: 'Time Units'
            },
            vAxis: {
              title: 'Cumulative Infections'
            }
          };

          var chart = new google.visualization.LineChart(
            document.getElementById('main-modal-body'));

          chart.draw(data, options);
          $("#modaltextmessage").text("Successfully generated plot.");
          $("#modal-div").modal({ keyboard: true, show: true });
          $("#main-modal-body").width("100%");
        }
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
  epidemicCanvasInstance.moveAndPlotAgents();
}
