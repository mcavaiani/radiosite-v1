$(document).ready(function(){
  $.ajax({
    type: 'GET',
    url: '/api/podcastList',
    success: function(data){
      console.log('success', data);
    }

  });
});
