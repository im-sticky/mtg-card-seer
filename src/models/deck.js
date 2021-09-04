import {CardModel} from './card';
import {CardCache} from 'helpers/cache';
import {CARD_TYPES, CARD_TYPE_PRECEDENCE, DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';

/**
 * Model used for managing deck object data in decklist based components.
 */
export class DeckModel {
  /**
   * Initializes the model with all relevant deck list section data.
   * @param {Array} instant Array of CardModels in the Instant section.
   * @param {Array} sorcery Array of CardModels in the Sorcery section.
   * @param {Array} artifact Array of CardModels in the Artifact section.
   * @param {Array} creature Array of CardModels in the Creature section.
   * @param {Array} enchantment Array of CardModels in the Enchantment section.
   * @param {Array} land Array of CardModels in the Land section.
   * @param {Array} planeswalker Array of CardModels in the Planeswalker section.
   * @param {CardModel} commander
   * @param {CardModel} companion
   * @param {Array} sideboard Array of CardModels in the Sideboard section.
   */
  constructor({instant, sorcery, artifact, creature, enchantment, land, planeswalker, commander, companion, sideboard}) {
    this.instant = this.toSection(CARD_TYPES.instant, instant);
    this.sorcery = this.toSection(CARD_TYPES.sorcery, sorcery);
    this.artifact = this.toSection(CARD_TYPES.artifact, artifact);
    this.creature = this.toSection(CARD_TYPES.creature, creature);
    this.enchantment = this.toSection(CARD_TYPES.enchantment, enchantment);
    this.land = this.toSection(CARD_TYPES.land, land);
    this.planeswalker = this.toSection(CARD_TYPES.planeswalker, planeswalker);
    this.companion = this.toSection('Companion', companion);
    this.commander = this.toSection('Commander', commander);
    this.sideboard = this.toSection('Sideboard', sideboard);
  }

  /**
   * Static method to be used for creating a new DeckModel based on the results from the Scryfall API and the raw deck input.
   * @param {Array} scryfallList List of card response data from Scryfall.
   * @param {Array} parserList List of models from mtg-decklist-parser.
   * @returns {DeckModel} new DeckModel with all sections initialized.
   */
  static fromApi(scryfallList, parserList) {
    const sections = {
      [CARD_TYPES.creature]: [],
      [CARD_TYPES.planeswalker]: [],
      [CARD_TYPES.instant]: [],
      [CARD_TYPES.sorcery]: [],
      [CARD_TYPES.artifact]: [],
      [CARD_TYPES.enchantment]: [],
      [CARD_TYPES.land]: [],
    };

    const toCard = card => {
      const cacheKey = CardCache.createKey(card.name, card.set, card.collectors);

      if (CardCache.has(cacheKey)) {
        const cacheCard = CardCache.get(cacheKey, true);

        cacheCard.amount = card.amount;
        return cacheCard;
      }

      const cardModel = CardModel.fromApi(scryfallList.find(x => x.name.match(new RegExp(`^${card.name}`, 'i'))), card.amount);

      CardCache.set(cacheKey, cardModel);
      return cardModel;
    };

    parserList.deck.forEach(card => {
      const cacheKey = CardCache.createKey(card.name, card.set, card.collectors);
      let cacheCard;

      if (CardCache.has(cacheKey)) {
        cacheCard = CardCache.get(cacheKey, true);
      }

      const scryfallCard = scryfallList.find(x => x.name.match(new RegExp(`^${card.name}`, 'i')));

      if (!scryfallCard && !cacheCard) {
        return;
      }

      CARD_TYPE_PRECEDENCE.some(type => {
        // for double faced cards use the front face to determine type
        var matchAgainst = cacheCard ?
          cacheCard.type :
          DOUBLE_SIDED_LAYOUTS.includes(scryfallCard.layout) ?
            scryfallCard.card_faces[0].type_line :
            scryfallCard.type_line;

        if (matchAgainst.match(new RegExp(type, 'i'))) {
          if (cacheCard) {
            cacheCard.amount = card.amount;
            sections[type].push(cacheCard);

            return true;
          }

          const cardModel = CardModel.fromApi(scryfallCard, card.amount);

          sections[type].push(cardModel);
          CardCache.set(cacheKey, cardModel);

          return true;
        }
      });
    });

    const sideboard = parserList.sideboard.map(card => toCard(card));
    const commander = parserList.commander ? toCard(parserList.commander) : null;
    const companion = parserList.companion ? toCard(parserList.companion) : null;

    return new this({
      instant: sections.Instant.length ? sections.Instant : null,
      sorcery: sections.Sorcery.length ? sections.Sorcery : null,
      artifact: sections.Artifact.length ? sections.Artifact : null,
      creature: sections.Creature.length ? sections.Creature : null,
      enchantment: sections.Enchantment.length ? sections.Enchantment : null,
      land: sections.Land.length ? sections.Land : null,
      planeswalker: sections.Planeswalker.length ? sections.Planeswalker : null,
      sideboard: sideboard.length ? sideboard : null,
      commander,
      companion,
    });
  }

  /**
   * Creates a new deck section from a list of cards.
   * @param {String} title Title of the section.
   * @param {Array} cards Cards within the section. May be empty.
   * @returns {DeckSectionModel} New model or undefined.
   */
  toSection(title, cards) {
    return cards ? new DeckSectionModel({title, cards}) : undefined;
  }
}

/**
 * Model for a deck section to be used with DeckModel.
 */
export class DeckSectionModel {
  /**
   * Initializes the model with all relevant section data.
   * @param {String} title Title that represents the section.
   * @param {Array} cards List of CardModels.
   */
  constructor({title, cards}) {
    this.title = title;
    this.cards = Array.isArray(cards) ? cards.sort((a, b) => a.name > b.name ? 1 : -1) : [cards];
  }
}