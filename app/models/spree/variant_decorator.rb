Spree::Variant.class_eval do
  
  include ActionView::Helpers::NumberHelper
  
  attr_accessible :option_values
  
  def to_hash
    actual_price  = self.price
    #actual_price += Calculator::Vat.calculate_tax_on(self) if Spree::Config[:show_price_inc_vat]
    { 
      :id    => self.id, 
      :count => Spree::StockItem.find_all_by_variant_id(self).sum(&:count_on_hand), 
      :price => number_to_currency(actual_price),
			:backorderable => Spree::StockItem.where({variant_id: self.id, backorderable: true})  ? true : false
    }
  end
    
end
