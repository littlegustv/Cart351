$(document).ready(function () {

	function do_filter(value, compareto, compareas) {
		if (compareas == "greater") {
			return value > compareto;
		} else if (compareas == "less") {
			return value < compareto;
		} else {
			return value == compareto;
		}
	}

	function unit (key) {
		switch (key) {
			case 'water':
				return 'ml';
				break;
			case 'sunlight':
				return 'hours';
				break;
			case 'temperature':
				return 'C';
				break;
			case 'growth':
				return 'cm';
				break;
		}
		return '';
	}

	$('#filter').submit(function (e) {
		e.preventDefault();
		$.getJSON('data.json')
		.done(function (results) {
			$('.result').remove();
			for (let i = 0; i < results.length; i++) {
				let r = $('<div class="result"></div>');
				var d = new Date();
				d.setDate(d.getDate() - 5 + i);
				r.append($('<h4>' + d.toDateString() + '</h4>'))
				for (let key in results[i]) {
					let row = $('<p><strong>' + key + '</strong>' + results[i][key] + ' ' + unit(key) + '</p>');
					if (!do_filter(results[i][key], $('#' + key).val(), $('#' + key + '-compare').val())) {
						r.addClass('disabled');
						row.addClass('outofrange');
					}
					r.append(row);
				}
				$('#results').append(r);
			}
		})
		.fail(function (request, status, error) {
			console.log(status, error);
		});		
	});
});