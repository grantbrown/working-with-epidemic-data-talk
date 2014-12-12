
generateCarouselIndicators = function(){
  //<ol class="carousel-indicators">
  //  <li data-target="#carousel-generic" data-slide-to="0" class="active"></li>
  //  <li data-target="#carousel-generic" data-slide-to="1"></li>
  //  <li data-target="#carousel-generic" data-slide-to="2"></li>
  //</ol>

  var list = $("#carouselIndicatorsList");
  var items = $(".item");
  list.empty();
  for (i = 0; i < items.length; i++){
    var content = '<li data-target="#carousel-generic" data-slide-to="' + i + '"></li>';
    list.append(content);
  }
  list.children().first().addClass("active");

}
