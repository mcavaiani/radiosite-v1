
$(document).ready(function(){
  $('#postPreview').richText({

    // text formatting
      bold: true,
      italic: true,
      underline: true,

      // text alignment
      leftAlign: false,
      centerAlign: false,
      rightAlign: false,
      justify: false,

      // lists
      ol: false,
      ul: false,

      // title
      heading: true,

      // fonts
      fonts: false,
      fontColor: false,
      fontSize: false,

      // uploads
      imageUpload: false,
      fileUpload: false,

      // media
      videoEmbed: false,

      // link
      urls: true,

      // tables
      table: false,

      // code
      removeStyles: false,
      code: false,

      // colors
      colors: [],

      // dropdowns
      fileHTML: '',
      imageHTML: '',

      // privacy
      youtubeCookies: false,

      // developer settings
      useSingleQuotes: false,
      height: 0,
      heightPercentage: 0,
      id: "",
      class: "",
      useParagraph: false,
      maxlength: 5000,
      callback: undefined
  });

  $('#postContent').richText();
});



$(document).ready(function() {
    // Get the form.

    $('#inputGroupSelect').on('change', function() {
      var pageId = this.value;
      var selectedText = $(this).find('option:selected').text();

      if(selectedText.includes("blog")){
        $("#div-upload-pics").show();
        $("#div-editor-content").show();
      }else{
        $("#div-upload-pics").hide();
        $("#div-editor-content").hide();
      }

      localStorage.setItem("pageId", pageId);

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

$(document).ready(function() {
    // Get the form.

    $(".delete-button").on("click",function(){
      event.preventDefault();
      event.stopImmediatePropagation();

      var request = $.ajax({
        type: 'DELETE',
        url: "/api/page/"+$(this).attr('id')
      });

      request.done(function(response) {
        // Make sure that the formMessages div has the 'success' class.
        alert("Informazioni aggiornate!");
        window.location = '/console/admin-console/pages';

      });
      request.fail(function(data) {
        // Make sure that the formMessages div has the 'error' class.
        alert("Qualcosa è andato storto! Riprova!");
      });

    });

});
