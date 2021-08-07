import {DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';

export class CardModel {
  constructor({images, url, usd, tix, eur}) {
    this.images = images || [];
    this.url = url;
    this.usd = new PriceModel({...usd});
    this.tix = new PriceModel({...tix});
    this.eur = new PriceModel({...eur});
  }

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

  prices() {
    return [
      this.usd,
      this.eur,
      this.tix,
    ];
  }
}

export class PriceModel {
  constructor({price, url, symbol}) {
    this.price = price;
    this.url = url;
    this.symbol = symbol;
  }
}