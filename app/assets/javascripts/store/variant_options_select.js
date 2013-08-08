$.extend({
  keys: function(obj){
    return $.map(obj, function(el, ix) {return ix});
  }
});

if (!Array.indexOf) Array.prototype.indexOf = function(obj) {
  for(var i = 0; i < this.length; i++){
    if(this[i] == obj) {
      return i;
    }
  }
  return -1;
}

if (!Array.find_matches) Array.find_matches = function(a) {
  var i, m = [];
  a = a.sort();
  i = a.length
  while(i--) {
    if (a[i - 1] == a[i]) {
      m.push(a[i]);
    }
  }
  if (m.length == 0) {
    return false;
  }
  return m;
}

function VariantOptionsSelect(params) {
  var options = params['options'];
  var track_inventory_levels = params['track_inventory_levels'];
  var allow_select_outofstock = params['allow_select_outofstock'];
  var default_instock = params['default_instock'];

  var variants = {}, divs, inputs, selection = [];

  function init() {
    divs = $('#product-variants .variant-options');
    inputs = divs.find('select');
    inputs.on('change', update);
    $('#quantity').on( "spinstop", update);
    update();
  }

  function update() {
    // x = data[option_type_id][option_value_id][id]
    // selection = {"2" => 1, "4" => 1, "2" => 0}

    selection = {};
    $(inputs).each(function(ix, el) {
      $myElem = $(el).find('option[selected]');
      if ( $myElem.val() != null ) {
        selection[get_type_id($(el).attr('id'))] = $myElem.val();
      }
    });
    var $button = $('#add-to-cart-button');
    console.log("selection:");
    console.log(selection);
    var matches = get_variants_from_selection(selection);

    if(matches.length > 0 && matches[0].count > 0) {
      $('#backbone').html("")
      $button.removeAttr('disabled')
             .removeClass('disabled');

      $( "#quantity" ).spinner( "option", "max", matches[0].count );

      var splitter = matches[0].price.split(/\$|\€/);
      // var quantity = 1 // Reset quantity whenever you change the product
      var quantity = $('#quantity').val();

      // Ugly hack for currency, not proud :(
      if (splitter[0] == "") {
        var new_price = "$" + (splitter[1] * quantity).toFixed(2);
      } else {
        var new_price = (splitter[1] * quantity).toFixed(2) + "€";
      }

      $('.price').html(new_price);
      $('#variant_id').val(matches[0].id);
      $('#listener').trigger("matcher", [matches.length]);
    } else {
      // $('#backbone').html("No products in stock")
      $button.attr('disabled', 'disabled')
             .addClass('disabled');
    }
  }

  function get_type_id(str) {
    var tmp = str.split("_");
    return tmp[tmp.length-1];
  }

  function get_variants_with_option(otid ,ovid) {
    return options[otid][ovid];
  }

  function get_variants_from_selection(selection) {
    var candidates = {};
    var keys = [];
    var option_type_ids = $.keys(selection);
    $.each(option_type_ids, function(key, otid) {
      var ovid = selection[otid];
      var vars = get_variants_with_option(otid,ovid);
      $.merge(keys, $.keys(vars));
      $.extend(candidates, vars);
    });

    var matches = []
    $.each(candidates, function(key, value) {
      if(element_count(key, keys) >= option_type_ids.length) {
        matches.push(value);
      }
    });
    console.log("Matches:")
    console.log(matches)
    return matches;
  }

  function element_count(item, array) {
      var count = 0;
      $.each(array, function(i,v) { if (v === item) count++; });
      return count;
  }

  $(document).ready(init);

};
