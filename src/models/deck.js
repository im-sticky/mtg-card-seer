import {CardModel} from './card';
import {CardCache} from 'helpers/cache';
import {CARD_TYPES, CARD_TYPE_PRECEDENCE, DOUBLE_SIDED_LAYOUTS} from 'helpers/constants';

/**
 * Model used for managing deck object data in decklist based components.
 */
export class DeckModel {
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
      return CardModel.fromApi(scryfallList.find(x => x.name.startsWith(card.name)), card.amount);
    };

    parserList.deck.forEach(card => {
      const scryfallCard = scryfallList.find(x => x.name.startsWith(card.name));

      if (!scryfallCard) {
        return;
      }

      CARD_TYPE_PRECEDENCE.some(type => {
        // for double faced cards use the front face to determine type
        var matchAgainst = DOUBLE_SIDED_LAYOUTS.includes(scryfallCard.layout) ?
          scryfallCard.card_faces[0].type_line :
          scryfallCard.type_line;

        if (matchAgainst.match(new RegExp(type, 'i'))) {
          sections[type].push(CardModel.fromApi(scryfallCard, card.amount));

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

  toSection(title, cards) {
    return cards ? new DeckSectionModel({title, cards}) : undefined;
  }
}

/**
 * Model for a deck section to be used with DeckModel.
 */
export class DeckSectionModel {
  constructor({title, cards}) {
    this.title = title;
    this.cards = Array.isArray(cards) ? cards : [cards];
  }
}