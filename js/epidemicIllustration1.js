



activateCanvas = function()
{

  var height = $(document).height() - 200;
  var canvas = document.getElementById('epidemicCanvas');
  if (canvas == null){
    return;
  }
  //var items = $(".item");
  var parent = $("#epidemicCanvas").parent();
  canvas.width = parent.width();
  canvas.height = height;
  //canvas.height = parent.height();
  var context = canvas.getContext('2d');
  var centerX = canvas.width / 2;
  var centerY = canvas.height / 2;
  var radius = 70;

  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle = 'green';
  context.fill();
  context.lineWidth = 5;
  context.strokeStyle = '#003300';
  context.stroke();
}
