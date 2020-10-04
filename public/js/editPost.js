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

  $('#postContent').richText({

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
      ol: true,
      ul: true,

      // title
      heading: true,

      // fonts
      fonts: true,
      fontColor: true,
      fontSize: false,

      // uploads
      imageUpload: false,
      fileUpload: false,

      // media
      videoEmbed: true,

      // link
      urls: true,

      // tables
      table: true,

      // code
      removeStyles: true,
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
      maxlength: 10000,
      callback: undefined
  });
});
