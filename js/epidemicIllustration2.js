


var runAfricaDataMap = function(){
  var self = this;
  self.playing = false;
  self.containerDiv = $("#africa-map-container");

  self.rChartsCtrl = function($scope){
    $scope.Day = 1;
    $scope.$watch('Day', function(newDay){
      self.zoom.updateChoropleth(alldata[newDay]);
      $("#zoom-map-day-counter").text(dayLabels[newDay]);
    });
  }

  self.initializeText = function(){
    var yoffs = 10;
    var xoffs = 10;
    var epiData = [
      { "x": 130-xoffs, "y": 250-yoffs, "name":"GIN"},
      { "x": 200-xoffs, "y": 305-yoffs, "name":"LBR"},
      { "x": 165-xoffs, "y": 280-yoffs, "name":"SLE"},
      { "x": 430-xoffs, "y": 250-yoffs, "name":"NGA"},
      { "x": 100-xoffs, "y": 200-yoffs, "name":"SEN"},
      { "x": 250-xoffs, "y": 200-yoffs, "name":"MLI"}];

    self.text = self.zoom.svg.selectAll("text").data(epiData).enter().append("text");
    self.zoom.svg.selectAll("text").data(epiData).enter().append("text");
    self.textLabels = self.text
                     .attr("x", function(d) { return d.x; })
                     .attr("y", function(d) { return d.y; })
                     .text( function (d) { return("0"); })
                             .attr("font-family", "sans-serif")
                     .attr("font-size", "20px")
                     .attr("fill", "red");

  }

  self.buildDatamap = function(){
    console.log("Building DM.")
    self.containerDiv =  $("#africa-map-container");
    self.playing = false;
    if (self.containerDiv.length == 0){
      console.log("Deleting zoom");
      delete self.zoom;
      return;
    }
    if (self.zoom == null){
      console.log("Creating New DM");
      self.chartParams={"dom": "zoom_map",
      "scope": "world",
      "legend":true,
      "geographyConfig":{
        "borderColor":"#cccccc",
        "borderWidth":"2px"},
      "fills":
      {
       "defaultFill": "#ffffef",
      "<68": "#ffffef",
      "<137": "#fff7bf",
      "<206": "#fee39f",
      "<275": "#fec45f",
      "<345": "#fe993f",
      "<414": "#ec702f",
      "<483": "#cc4c1f",
      "<552": "#993402",
      "<621": "#662520"
      }
      ,
      "data":
      {
       "GIN": {
       "fillKey": "<68",
      "caseCount":     18
      },
      "LBR": {
       "fillKey": "<68",
      "caseCount":      0
      },
      "SLE": {
       "fillKey": "<68",
      "caseCount":      0
      },
      "NGA": {
       "fillKey": "<68",
      "caseCount":      0
      },
      "SEN": {
       "fillKey": "<68",
      "caseCount":      0
      },
      "MLI": {
       "fillKey": "<68",
      "caseCount":      0
      }
      }
      ,"setProjection": function( element, options ) {
          var path;
          var projection = d3.geo.equirectangular()
              .center([-23, 28])
              .rotate([4.4, 0])
          	  .scale(700)
        		  .translate([element.offsetWidth / 2, element.offsetHeight / 2]);

          path = d3.geo.path()
            .projection( projection );

          return {path: path, projection: projection};
        }
      }

      self.chartParams.element = document.getElementById('zoom_map')


      self.zoom = new Datamap(self.chartParams);

      if (self.chartParams.labels){
        self.zoom.labels();
      }

      if (self.chartParams.legend){
        self.zoom.legend();
      }

      self.initializeText();

    }
    else{
      self.zoom.draw();
    }
  }

  self.resize = function(){
    var svg = $("svg");
    if (svg != null){
      var newWidth = svg.parent().width();
      var newHeight = svg.parent().height();
      svg.height(400);
      svg.width(780);
    }
  }


  self.intervalFunction = function(slider,counter,sliderVal){
      if (eval(slider.val()) >= eval(slider.attr("max")))
      {
        console.log("Exit Case 1.");
        slider.val(1);
        counter.text(dayLabels[1]);
        self.zoom.updateChoropleth(alldata[1]);
        self.playing = false;
        clearInterval(self.intervalVariable);
        $("#zoom-map-play").text("Play");

        var txt = self.zoom.svg.selectAll("text");
        if (txt == null || txt.length == 0){
          console.log("Didn't find txt instance.");
          self.initializeText();
          txt = self.zoom.svg.selectAll("text");
        }


        txt[0][0].textContent = alldata[1].GIN.caseCount;
        txt[0][1].textContent = alldata[1].LBR.caseCount;
        txt[0][2].textContent = alldata[1].SLE.caseCount;
        txt[0][3].textContent = alldata[1].NGA.caseCount;
        txt[0][4].textContent = alldata[1].SEN.caseCount;
        txt[0][5].textContent = alldata[1].MLI.caseCount;
      }
      else if (!self.playing)
      {
        console.log("Exit Case 2.");
        clearInterval(self.intervalVariable);
        $("#zoom-map-play").text("Play");
      }
      else
      {
        sliderVal = eval(slider.val()) + 1;
        console.log("Run Case: " + sliderVal);
        slider.val(sliderVal);
        counter.text(dayLabels[sliderVal]);
        self.zoom.updateChoropleth(alldata[sliderVal]);


        var txt = self.zoom.svg.selectAll("text");
        if (txt == null || txt.length == 0){
          console.log("Didn't find txt instance while running.");
          self.initializeText();
          txt = self.zoom.svg.selectAll("text");
        }

        txt[0][0].textContent = alldata[sliderVal].GIN.caseCount;
        txt[0][1].textContent = alldata[sliderVal].LBR.caseCount;
        txt[0][2].textContent = alldata[sliderVal].SLE.caseCount;
        txt[0][3].textContent = alldata[sliderVal].NGA.caseCount;
        txt[0][4].textContent = alldata[sliderVal].SEN.caseCount;
        txt[0][5].textContent = alldata[sliderVal].MLI.caseCount;

      }
  }

  self.wireUpControls = function(){
    if (self.containerDiv.length == 0){return;}
    var zmp = $("#zoom-map-play");
    if (zmp != null){
      zmp.unbind();
      zmp.click(function(){
          var slider = $("#zoom-map-slider");
          var counter = $("#zoom-map-day-counter");
          var sliderVal = 0;
          if (self.playing)
          {
            self.playing = false;
          }
          else
          {
            self.playing = true;
            $("#zoom-map-play").text("Pause");
            self.intervalVariable = setInterval(function(){self.intervalFunction(slider,counter,sliderVal)},100);
          }
      });
    }
    self.data_app = angular.module('data_app', []);
  }
}



var dataMapInstance = new runAfricaDataMap();

var activateDatamap = function(){
  console.log("Activate Data Map");
  dataMapInstance.buildDatamap();
  dataMapInstance.wireUpControls();
  dataMapInstance.resize();
}
