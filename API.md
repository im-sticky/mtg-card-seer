# API documentation

Find each component with what attributes and events are available to them here. It's important to note that these are [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components) and some of them use the [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) so they will not use global CSS for elements.

## Using the components

Components from the library are used the same as an other normal HTML element. HTML attributes can be used to specify information to the component directly, generally all are optional. Each component has a set of JavaScript event listeners you can hook into. The component use the Shadow DOM and require to be styled using specific [::part selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/::part), all of which are documented.

### Table of contents

- [card-link](#card-link)
- [card-inline](#card-inline)
- [deck-list](#deck-list)
- [seer-loader](#seer-loader)

## card-link

The \<card-link\> component is used for rendering given text as a link to Scryfall for the card and will display the card image when hovering over or focusing the link.

### Attributes

```html
<!-- example -->
<card-link name="lightning bolt">bolt</card-link>
```

| Attribute | Type | Description |
|---|---|---|
| name | String | Specifies the fuzzy search term. Has priority in being used over text directly specified in the component. |
| set | String | The 3-5 letter magic set code to search within. Sets and their codes can be found [here](https://scryfall.com/sets). |
| collector | Number | The specific collector number of the card to find. the `set` attribute is required if using this. |
| face | Number | Specific card image to show for double sided cards. 1 is front and 2 is back. |
| price-info | Boolean | Shows any available pricing information and links to purchase sites. |

### Events

```js
// example
document.querySelector('#selector').addEventListener('fetchCard', e => console.log('fetched card', e));
```

| Event | Description |
|---|---|
| fetchCard | Fired after querying the Scryfall API and getting a successful response. |
| fetchError | Fired after attempting to query the Scryfall API and getting an 404 not found error. |
| displayCard | Fired when hovering the link and the card image displays. |
| hideCard | Fired when moving off the link and the card image hides. |
| touchCard | Fired when touching the `card-link` component on any touch enabled device. Can be used with `displayCard` / `hideCard` to determine mobile display and hide events. |

### Styling

```css
/* example */
.element-selector::part(link) {
  color: red;
  text-decoration: none;
}
```

| Part | Matching Element | Description |
|---|---|---|
| link | \<a\> | The wrapping anchor for the child text and all component's elements. Image will be relative to this. |
| container | \<div\> | Container element for all children elements that appear in card popup. Positioned based on mouse cursor and parent anchor. |
| image | \<img\> | The image that is retrieved from Scryfall. May be multiple images for double-faced cards. |
| price-list | \<ul\> | List container for all of the prices. |
| price-item | \<li\> | Individual list item for a price. |
| price-link | \<a\> | Link which contains pricing text. |

## card-inline

The \<card-inline\> component is used to render an image of the card directly to the page. It will also be a link to the Scryfall page of the card (optionally disabled).

### Attributes

```html
<!-- example -->
<card-inline static>Whir of Invention</card-inline>
```

| Attribute | Type | Description |
|---|---|---|
| name | String | Specifies the fuzzy search term. Has priority in being used over text directly specified in the component. |
| set | String | The 3-5 letter magic set code to search within. Sets and their codes can be found [here](https://scryfall.com/sets). |
| collector | Number | The specific collector number of the card to find. the `set` attribute is required if using this. |
| face | Number | Specific card image to show for double sided cards. 1 is front and 2 is back. |
| price-info | Boolean | Shows any available pricing information and links to purchase sites. |
| static | Boolean | The rendered images will not be links leading to Scryfall. |

### Events

```js
// example
document.querySelector('#selector').addEventListener('fetchCard', e => console.log('fetched card', e));
```

| Event | Description |
|---|---|
| fetchCard | Fired after querying the Scryfall API and getting a successful response. |
| fetchError | Fired after attempting to query the Scryfall API and getting an 404 not found error. |

### Styling

```css
/* example */
.element-selector::part(link) {
  color: red;
  text-decoration: none;
}
```

| Part | Matching Element | Description |
|---|---|---|
| container | \<div\> | Container element for all inline images. |
| image | \<img\> | The image that is retrieved from Scryfall. May be multiple images for double-faced cards. |
| price-list | \<ul\> | List container for all of the prices. |
| price-item | \<li\> | Individual list item for a price. |
| price-link | \<a\> | Link which contains pricing text. |

## deck-list

The \<deck-list\> component is used for rendering a sorted list of cards given in a recognizable MTG Arena or Online deck list format. It has a static card preview image location when hovering over each rendered card link.

### Attributes

```html
<!-- example -->
<deck-list src="/example/deck/file.txt"></deck-list>
```

| Attribute | Type | Description |
|---|---|---|
| heading | String | Title of the decklist to be displayed. |
| hideExport | Boolean | Hides the export buttons that are shown by default. |
| hidePreview | Boolean | Hides the card image preview that is included by default. |
| inlineSideboard | Boolean | Renders the sideboard in the same column layout as the rest of the deck. Is separated by a horizontal rule by default. |
| src | String | Source path of a decklist file. Supports `txt` and MTGO `dek` formats. |

### Events

```js
// example
document.querySelector('#selector').addEventListener('fetchList', e => console.log('fetched decklist', e));
```

| Event | Description |
|---|---|
| deckExported | Fired after exporting the decklist from one of the buttons being used. |
| fetchList | Fired after querying the Scryfall API and getting a successful response. |
| fetchError | Fired after attempting to query the Scryfall API and getting an 404 not found error. |
| previewChange | Fired after the preview image shown changes. |
| touchCard | Fired when touching the a card's link on any touch enabled device. |

### Styling

```css
/* example */
.element-selector::part(container) {
  max-width: 600px;
}
```

| Part | Matching Element | Description |
|---|---|---|
| container | \<div\> | Container that wraps entire component, holds `header` and `body` as direct children. |
| header | \<div\> | Holds the title and export buttons displayed above the actual decklist. |
| heading | \<h2\> | The text title defined by the `heading` attribute. |
| export | \<button\> | A button for exporting the decklist. |
| export-notification | \<p\> | Text notification that is briefly displayed when clicking on an export button. |
| body | \<div\> | Holds the decklist contents using a column layout. |
| preview-container | \<div\> | Container for `preview` which defines size and 3D perspective. |
| preview | \<div\> | Container for `preview-image`(s) and handles flipping if multiple faces. |
| preview-image | \<img\> | Image of currently selected card face. |
| flip-preview | \<button\> | Button for flipping `preview` to show back card face if one exists. |
| section | \<dl\> | List of cards containing `section-title` and `section-item`. |
| section-title | \<dt\> | Unique title of card list. |
| section-item | \<dd\> | List item holding `link`. |
| link | \<a\> | External link to Scryfall page of card. |
| separator | \<hr\> | Horizontal rule separating main body sections from sideboard. |

## seer-loader

The \<seer-loader\> component is a simple loading animation that is used in some other components in the library. It is publicly exposed for you to use if you need a simple loader.

### Styling

```css
/* example */
.element-selector::part(loader-item) {
  background: red;
  width: 20px;
}
```

| Part | Matching Element | Description |
|---|---|---|
| loader | \<div\> | Container that holds animated loading dots. |
| loader-item | \<div\> | Individual animated loading dots. |