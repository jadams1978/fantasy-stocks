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
  $.ajax({
    type:"GET",
    url: "https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=RHAbp4b2msadmufSJuzn"
    ,
    success: function(data) {
      
      let open = data.dataset_data.data[0][1];
      let close = data.dataset_data.data[0][4];
      let profit = close - open;
      console.log(profit);
    },
    dataType: 'json',
  });
  
  
  

 $(window).load(function(){
  $('#search').keyup(function(){
      var searchField = $('#search').val();
      var regex = new RegExp(searchField, "i");
      var output = '<div class="row">';
      var count = 1;
      $.getJSON('../convertcsv.json', function(data) {
        $.each(data, function(key, val){
          if ((val.FIELD1.search(regex) != -1) || (val.FIELD2.search(regex) != -1)) {
            output += `<div class="stock" data-stockname="${val.FIELD1}" data-stockdescription="${val.FIELD2}">`;
            output += '<h5 class="stock-name">' + val.FIELD1 + '<button class="add" type="button">' + 'Add' + '</button>';'</h5>';
            output += '<p class="stock-description">' + val.FIELD2 + '</p>';
            output += '</div>';
            output += '</div>';
            output += '</div><div class="row">';
         
            count++;
          }
        });
        output += '</div>';
        $('#results').html(output);
      }); 
  });
  $('#results').on('click', '.stock', function() {
   let stockname = $(this).data('stockname');
   let stockdescription = $(this).data('stockdescription');
    $.post( "", { stockname: stockname, stockdescription: stockdescription});
    console.log($(this).data('stockname'));
    location.reload();
    
    
    
    
  });
  $('.drop').on('click', function() {
    let stockname = { 'stockname':$(this).data('stockname')};
    let stockdescription = $(this).data('stockdescription');
     //$.delete( "", { stockname: stockname, stockdescription: stockdescription});
     console.log($(this).data('stockname'));
     $.ajax({
      url: '',
      type: 'DELETE',
      data: stockname,
      dataType: 'json',
      success: function(result) {console.log(result);},
      error: function(result){console.log(result);}
  });
     location.reload();
})




$('.schedule').on('click', function() {

  
   $.ajax({
    url: '',
    type: 'PUT',
    data: "stockname",
    dataType: 'json',
    success: function(result) {console.log(result);},
    error: function(result){console.log(result);}
});
   //location.reload();
})





 })
 function myFunction() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
      x.className += " responsive";
  } else {
      x.className = "topnav";
  }
}
