$(document).ready(function() {
  $(".menu-button").click(function() {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");

    var filterValue = $(this).attr('data-filter');
    console.log(filterValue);
    $(".menu-item").css("display","none");
    $(".menu-item"+filterValue).css("display","inline");


  });
});
