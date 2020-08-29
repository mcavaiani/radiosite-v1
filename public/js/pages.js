$(function(){
  $("#dashboard-nav-item").removeClass("active");
  $("#user-nav-item").removeClass("active");
  $("#pages-nav-item").addClass("active");
  $("#posts-nav-item").removeClass("active");
});



$(document).ready(function() {
    // Get the form.

    $('#inputGroupSelect').on('change', function() {
      var pageId = this.value;
      alert( this.value );
      localStorage.setItem("pageId", pageId);
  });
});

$(document).ready(function() {
    // Get the form.
    var form = $('#update-page-info');

    // Set up an event listener for the contact form.
    $(form).submit(function(event) {
    // Stop the browser from submitting the form.
      event.preventDefault();
      event.stopImmediatePropagation();

      // Serialize the form data.
      var formData = $(form).serialize();
      // Submit the form using AJAX.
      var request = $.ajax({
        type: 'PUT',
        url: $(form).attr('action')+"/"+localStorage.getItem("pageId"),
        data: formData
      });
      request.done(function(response) {
        // Make sure that the formMessages div has the 'success' class.
        alert("Informazioni aggiornate!");

        // Clear the form.
        $('#description').val('');
        $('#sourceLink').val('');

      });
      request.fail(function(data) {
        // Make sure that the formMessages div has the 'error' class.
        alert("Qualcosa è andato storto! Riprova!");
      });
    });
});

$(document).ready(function() {
    // Get the form.
    var form = $('#create-page-form');

    // Set up an event listener for the contact form.
    $(form).submit(function(event) {
    // Stop the browser from submitting the form.
      event.preventDefault();
      event.stopImmediatePropagation();

      // Serialize the form data.
      var formData = $(form).serialize();
      // Submit the form using AJAX.
      var request = $.ajax({
        type: 'POST',
        url: $(form).attr('action'),
        data: formData
      });
      request.done(function(response) {
        // Make sure that the formMessages div has the 'success' class.
        alert("Informazioni aggiornate!");

        // Clear the form.
        $('#description').val('');
        $('#sourceLink').val('');

      });
      request.fail(function(data) {
        // Make sure that the formMessages div has the 'error' class.
        alert("Qualcosa è andato storto! Riprova!");
      });
    });
});
