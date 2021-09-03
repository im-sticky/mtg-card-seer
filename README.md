# MTG Card Seer

A set of easy to use HTML Web Components that use the [Scryfall API](https://scryfall.com/) to display MTG card images automatically on hover.

## Basic usage

Each component has a rich and flexible API that are easy to use out of the box. Basic usage would be wrapping whatever text you would want to function as a card image popover in the `card-link` element like you would with a `span`. This will automatically search and display the specified card when hovering the link. Note that the text does not have to be the card name exactly, it performs a fuzzy search so partial names or spelling errors will work if no cards have a similar name.

Example:
```html
<card-link>Viscera Seer</card-link>
```

You can read more about specific component APIs below or view more in depth examples [here](example/index.html).

### Features

- Made for modern browsers
- Mobile ready
- Supports external customization

## Installation

The library is available as a package on [npm](https://www.npmjs.com/package/mtg-card-seer). Currently there is no static location for a production file to hotlink to.

```
npm install mtg-card-seer --save
```

After that import the library in your code and all components will now be usable in your HTML.

```js
import 'mtg-card-seer';
```

### Dev setup

To get the project up and running with a test page and hot reloading, clone the repo and run the following:

```
npm install
npm start
```

To build the project for production code:

```
npm build
```

## API documentation

API documentation is available in the repo [here](API.md).

## Feature roadmap

- [x] ~~add search by collector number to `card-link`~~
- [x] ~~add ability to specify card face to display for `card-link`~~
- [x] ~~add optional display for price info to `card-link` preview~~
- [x] ~~add proper mobile support for `card-link`~~
- [x] ~~add inline card preview component~~
- [x] ~~add decklist component~~
- [ ] decklist component visual view
- [ ] add sideboard cuts/adds component
- [ ] add a11y mode for cards
- [ ] multilingual support

Discovered a bug? Log it [here](https://github.com/im-sticky/mtg-card-seer/issues) with browser details and steps to replicate it.

Have an idea for a feature? Recommend it [here](https://github.com/im-sticky/mtg-card-seer/issues).