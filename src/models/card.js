import {DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';

/**
 * Model used for managing card object data in various components.
 */
export class CardModel {
  /**
   * Initializes the model with all relevant card data.
   * @param {Array} faces All card faces containing image URL and name.
   * @param {String} url URL to Scryfall page for specific card.
   * @param {Object} usd Contains all relevant price data in US dollars.
   * @param {Object} tix Contains all relevant price data in MTGO tix.
   * @param {Object} eur Contains all relevant price data in Euros.
   */
  constructor({faces, url, usd, tix, eur}) {
    this.faces = faces || [];
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
      faces: DOUBLE_SIDED_LAYOUTS.includes(scryfall.layout) ?
        scryfall.card_faces.map(face => FaceModel.fromApi(face)) :
        [FaceModel.fromApi(scryfall)],
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

/**
 * Model for card face object to be used within the CardModel.
 */
export class FaceModel {
  /**
   * initializes model properties.
   * @param {String} name Name of the card.
   * @param {String} image URL of card image.
   */
  constructor({name, image}) {
    this.name = name;
    this.image = image;
  }

  /**
   * Static method to be used for creating a new FaceModel from a Scryfall API response object.
   * @param {any} scryfall
   * @returns {any}
   */
  static fromApi(scryfall) {
    return new this({
      name: scryfall.name,
      image: scryfall.image_uris.normal,
    });
  }
}