import {DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';

/**
 * Model used for managing card object data in various components.
 */
export class CardModel {
  /**
   * Initializes the model with all relevant card data.
   * @param {Array} images All card face image URLs.
   * @param {String} url URL to Scryfall page for specific card.
   * @param {Object} usd Contains all relevant price data in US dollars.
   * @param {Object} tix Contains all relevant price data in MTGO tix.
   * @param {Object} eur Contains all relevatn price data in Euros.
   */
  constructor({images, url, usd, tix, eur}) {
    this.images = images || [];
    this.url = url;
    this.usd = new PriceModel({...usd});
    this.tix = new PriceModel({...tix});
    this.eur = new PriceModel({...eur});
  }

  /**
   * Static method to be used for creating a new CardModel based on result from Scryfall API.
   * @param {Object} scryfall Scryfall API response object.
   * @returns {CardModel} New CardModel with Scryfall data.
   */
  static fromApi(scryfall) {
    return new this({
      images: DOUBLE_SIDED_LAYOUTS.includes(scryfall.layout) ?
        scryfall.card_faces.map(face => face.image_uris.normal) :
        [scryfall.image_uris.normal],
      url: scryfall.scryfall_uri,
      usd: {
        price: scryfall.prices.usd,
        url: scryfall.purchase_uris.tcgplayer,
        symbol: '$',
      },
      eur: {
        price: scryfall.prices.eur,
        url: scryfall.purchase_uris.cardmarket,
        symbol: '€',
      },
      tix: {
        price: scryfall.prices.tix,
        url: scryfall.purchase_uris.cardhoarder,
        symbol: 'TIX ',
      },
    });
  }

  /**
   * Constructs an array of all related price info.
   * @returns {Array} All price info.
   */
  prices() {
    return [
      this.usd,
      this.eur,
      this.tix,
    ];
  }
}

/**
 * Model for pricing data to be used within the CardModel.
 */
export class PriceModel {
  /**
   * Initializes model properties.
   * @param {Number} price Current market price of a card.
   * @param {String} url External URL for website to purchase card from.
   * @param {String} symbol Symbol used for currency.
   */
  constructor({price, url, symbol}) {
    this.price = price;
    this.url = url;
    this.symbol = symbol;
  }
}