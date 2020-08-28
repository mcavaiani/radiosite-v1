$(function(){
  $("#dashboard-nav-item").removeClass("active");
  $("#user-nav-item").removeClass("active");
  $("#pages-nav-item").addClass("active");
  $("#posts-nav-item").removeClass("active");
});

$(document).ready(function() {
    // Get the form.
    var form = $('#update-user-info');

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
        url: $(form).attr('action'),
        data: formData
      });
      request.done(function(response) {
        // Make sure that the formMessages div has the 'success' class.
        alert("Informazioni aggiornate!");

        // Clear the form.
        $('#nickName').val('');
        $('#description').val('');
        $('#pictureUrl').val('');
        $('#facebook').val('');
        $('#instagram').val('');
        $('#twitter').val('');
      });
      request.fail(function(data) {
        // Make sure that the formMessages div has the 'error' class.
        alert("Qualcosa è andato storto! Riprova!");
      });
    });
});

$(document).ready(function() {
    // Get the form.
    var form = $('#update-user-psw');

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
        url: $(form).attr('action'),
        data: formData
      });
      request.done(function(response) {
        // Make sure that the formMessages div has the 'success' class.
        alert("Informazioni aggiornate!");

        // Clear the form.
        $('#oldPassword').val('');
        $('#newPassword').val('');
        $('#newPasswordRepeat').val('');
      });
      request.fail(function(data) {
        // Make sure that the formMessages div has the 'error' class.
        alert("Qualcosa è andato storto! Riprova!");
      });
    });
});

$(document).ready(function() {
    // Get the form.
    var value = $('#inputGroupSelect').val();
    $( "#p-prova" ).append( value );
});
