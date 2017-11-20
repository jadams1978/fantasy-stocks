$.ajax({
	type: "GET",
	//url: "../../convertcsv.json",
	url: "https://fantasy-stock.herokuapp.com/convertcsv.json",
	success: function(data) {
		console.log(data);
		window.stocks = data;
		/*$('.text').text(JSON.stringify(data));*/
	},
	dataType: 'json',
});

//gets data from quandl.com api to find profit.
$.ajax({
	type: "GET",
	url: "https://www.quandl.com/api/v3/datasets/WIKI/FB/data.json?api_key=RHAbp4b2msadmufSJuzn",
	success: function(data) {
		let open = data.dataset_data.data[0][1];
		let close = data.dataset_data.data[0][4];
		let profit = close - open;
		console.log(profit);
	},
	dataType: 'json',
});

//allows users to search for stocks and return search results by outputting HTML.
$(window).load(function() {
	$('#search').keyup(function() {
		var searchField = $('#search').val();
		var regex = new RegExp(searchField, "i");
		var output = '<div class="row">';
		var count = 1;
		$.getJSON('../convertcsv.json', function(data) {
			$.each(data, function(key, val) {
				if ((val.FIELD1.search(regex) != -1) || (val.FIELD2.search(regex) != -1)) {
					output += `<div class="stock" data-stockname="${val.FIELD1}" data-stockdescription="${val.FIELD2}">`;
					output += '<h5 class="stock-name">' + val.FIELD1 + '<button class="glyphicon glyphicon-plus" type="button"></button>';
					'</h5>';
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
	
	//makes stock search results clickable to add stock to team.
	$('#results').on('click', '.stock', function() {
		let stockname = $(this).data('stockname');
		let stockdescription = $(this).data('stockdescription');
		$.post("", {
			stockname: stockname,
			stockdescription: stockdescription
		});
		console.log($(this).data('stockname'));
		location.reload();
	});

	//drop button to remove stock from team.
	$('.drop').on('click', function() {
		let stockname = {
			'stockname': $(this).data('stockname')
		};
		let stockdescription = $(this).data('stockdescription');
		console.log($(this).data('stockname'));

		//drops stock from team and reloads page showing the stock has been removed.
		$.ajax({
			url: '',
			type: 'DELETE',
			data: stockname,
			dataType: 'json',
			success: function(result) {
				console.log(result);
			},
			error: function(result) {
				console.log(result);
			}
		});
		location.reload();
	})

	//starts league and renders league schedule.
	$('.schedule').on('click', function(e) {
		console.log('dffafafda');
		$.ajax({
			url: '',
			type: 'PUT',
			data: "stockname",
			dataType: 'json',
			success: function(result) {
				console.log("adfa");
				console.log(result);
				console.log('dffafafda');
				console.log(e);
			},
			error: function(result) {
				console.log(result);
			}
		});
		location.reload();
		console.log('sched reload');
	})
})

//if screen is very small, this shows 3 horizontal lines. if you click the lines, login and register appear.
function myFunction() {
	var x = document.getElementById("myTopnav");
	if (x.className === "topnav") {
		x.className += " responsive";
	} else {
		x.className = "topnav";
	}
}