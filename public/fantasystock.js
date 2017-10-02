 $.ajax({
    type:"GET",
    url: "convertcsv.json"
    ,
    success: function(data) {
      console.log(data);
      window.stocks = data;
      /*$('.text').text(JSON.stringify(data));*/
    },
    dataType: 'json',
  });
 