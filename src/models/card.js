import {DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';

/**
 * Model used for managing card object data in various components.
 */
export class CardModel {
  /**
   * Initializes the model with all relevant card data.
   * @param {String} name Complete name of card.
   * @param {Array} faces All card faces containing image URL and name.
   * @param {String} url URL to Scryfall page for specific card.
   * @param {Object} usd Contains all relevant price data in US dollars.
   * @param {Object} tix Contains all relevant price data in MTGO tix.
   * @param {Object} eur Contains all relevant price data in Euros.
   * @param {Number} amount The number of cards that would be within a deck.
   */
  constructor({name, faces = [], url, usd, tix, eur, amount = 1}) {
    this.name = name;
    this.faces = faces;
    this.url = url;
    this.amount = amount;
    this.usd = new PriceModel({...usd});
    this.tix = new PriceModel({...tix});
    this.eur = new PriceModel({...eur});
  }

  /**
   * Static method to be used for creating a new CardModel based on result from Scryfall API.
   * @param {Object} scryfall Scryfall API response object.
   * @param {Number} amount The number of cards that would be within a deck.
   * @returns {CardModel} New CardModel with Scryfall data.
   */
  static fromApi(scryfall, amount = 1) {
    return new this({
      name: scryfall.name,
      url: scryfall.scryfall_uri,
      amount,
      faces: DOUBLE_SIDED_LAYOUTS.includes(scryfall.layout) ?
        scryfall.card_faces.map(face => FaceModel.fromApi(face)) :
        [FaceModel.fromApi(scryfall)],
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
   * Getter that constructs an array of all related price info.
   * @returns {Array} All price info.
   */
  get prices() {
    return [
      this.usd,
      this.eur,
      this.tix,
    ];
  }

  /**
   * Getter for retrieving type of card based on front face.
   * @returns {String} Type of card.
   */
  get type() {
    return this.faces[0].type;
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
   * @param {String} name Name of the card face.
   * @param {String} image URL of card face image.
   * @param {String} type Typeline of the face.
   */
  constructor({name, image, type}) {
    this.name = name;
    this.image = image;
    this.type = type;
  }

  /**
   * Static method to be used for creating a new FaceModel from a Scryfall API response object.
   * @param {Object} scryfall Scryfall API response object.
   * @returns {FaceModel} New FaceModel object.
   */
  static fromApi(scryfall) {
    return new this({
      name: scryfall.name,
      image: scryfall.image_uris.normal,
      type: scryfall.type_line,
    });
  }
}