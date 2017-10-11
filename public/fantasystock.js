 $.ajax({
    type:"GET",
    url: "../../convertcsv.json"
    ,
    success: function(data) {
      console.log(data);
      window.stocks = data;
      /*$('.text').text(JSON.stringify(data));*/
    },
    dataType: 'json',
  });
  /*$.ajax({
    type:"GET",
    url: "https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=RHAbp4b2msadmufSJuzn"
    ,
    success: function(data) {
      console.log(data);
    
      
    },
    dataType: 'json',
  });*/
  

 $(window).load(function(){
  $('#search').keyup(function(){
      var searchField = $('#search').val();
      var regex = new RegExp(searchField, "i");
      var output = '<div class="row">';
      var count = 1;
      $.getJSON('../convertcsv.json', function(data) {
        $.each(data, function(key, val){
          if ((val.FIELD1.search(regex) != -1) || (val.FIELD2.search(regex) != -1)) {
            output += `<div class="col-md-6 well stock" data-stockname="${val.FIELD1}">`;
            output += '<div class="col-md-3"><img class="img-responsive" src="'+val.avatar+'" alt="'+ val.name +'" /></div>';
            output += '<div class="col-md-7">';
            output += '<h5>' + val.FIELD1 + '</h5>';
            output += '<p>' + val.FIELD2 + '</p>'
            output += '</div>';
            output += '</div>';
            output += '</div><div class="row">'
         
            count++;
          }
        });
        output += '</div>';
        $('#results').html(output);
      }); 
  });
  $('#results').on('click', '.stock', function() {
   let stockname = $(this).data('stockname');
    $.post( "", { stockname: stockname});
    console.log($(this).data('stockname'));
    
    
    
    
  });
  $('#results').on('click', '.stock', function() {
    let stockname = $(this).data('stockname');
    $('.stockPick').html(stockname);
    console.log('stockpick');
})})


