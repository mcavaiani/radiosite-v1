$(document).ready(function() {
  $(".menu-button").click(function() {
    $(this).siblings().removeClass("active");
    $(this).addClass("active");

    var filterValue = $(this).attr('data-filter');
    $(".menu-item").css("display","none");
    $(".menu-item"+filterValue).css("display","inline");


  });
});

//
// $('#inputGroupSelect option').on('click', function (e) {
//   e.preventDefault()
//   $(this).tab('show')
// })
