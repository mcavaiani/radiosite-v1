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

    $(".delete-button").on("click",function(){

      event.preventDefault();
      event.stopImmediatePropagation();

      if (confirm('Sei sicuro di voler cancellare questo post? Una volta cliccato OK non sarà possibile tornare indietro!')) {
        var request = $.ajax({
          type: 'DELETE',
          url: window.location.href+"/"+$(this).attr('id')
        });

        request.done(function(response) {
          // Make sure that the formMessages div has the 'success' class.
          alert("Post cancellato!");
          window.location.reload();

        });

        request.fail(function(data) {
          // Make sure that the formMessages div has the 'error' class.
          alert("Qualcosa è andato storto! Riprova!");
        });

      } else {
        alert('Sei stato saggio');
      }

    });

});
