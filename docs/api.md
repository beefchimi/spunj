# API

The `Spunj` object is a “Map-like” data structure for managing a set of unique “filter keys”, each paired with an `array` of `string | number | true` values.

By using `Spunj`, you inherit the same API as `new Map()`.

## Inherited API

For more information on how to use a `Map`, please see the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

```ts
// Assume an initialization like:
const filters = new Spunj();

///
/// Standard Map instance methods

// Replaces or sets the exact `value`, and creates the `key` if missing.
filters.set('key', ['value1', 'value2']);

// Get the value for the given `key`.
filters.get('key');

// Determine if the `key` already exists in the `Spunj`.
filters.has('key');

// Removes the `key` and its `value`.
filters.delete('key');

// Quickly remove all `key + value` pairs from the `Spunj`.
filters.clear();

///
/// Standard Map iteration methods

// Get an iterable of each `key`.
filters.keys();

// Get an iterable of each `value`.
filters.values();

// Get an iterable of each `key + value` pair.
filters.entries();

// Iterate over each entry.
filters.forEach();

///
/// Standard Map properties

// Get number of `keys`.
filters.size;
```

## Enhanced API

Additional properties and methods are added for convienence.

```ts
///
/// Spunj instance methods

// Merge new `values` with existing `values` for the given `key`.
// Create the `key` and “set” `values` if not already present.
filters.append('key', 'value1', 'value2', 'etc');

// The “append” equivalent to `new Spunj(<SpunjIterable>)`.
// Iterate over each entry and `.append()` the `key + value`.
filters.appendBulk([
  ['pureNumber', [1, 2, 3]],
  ['pureString', ['un', 'deux', 'trois']],
  ['mixedValues', ['one', 2, true]],
]);

// Removes all matched values from the `key`.
// Delete `key` if the result is empty.
filters.remove('key', 'value1', 'value2', 'etc');

// The “remove” equivalent to `.appendBulk(<SpunjIterable>)`.
// Iterate over each entry and `.remove()` the `key + value`.
filters.removeBulk([
  ['pureNumber', [1, 2, 3]],
  ['pureString', ['un', 'deux', 'trois']],
  ['mixedValues', ['one', 2, true]],
]);

// Returns the last value added to the `key`.
filters.getLastValue('key');

// Determine if at least one `value` exists on the `key`.
filters.hasSomeValue('key', 'value1', 'value2', 'etc');

// Determine if a single `value` (or all of a set) exists on the `key`.
filters.hasEachValue('key', 'value1', 'value2', 'etc');

// Conveniently merge `filters.urlSearchParams` with another set of
// `URLSearchParams`. This method will retain `key` order from the
// provided `searchParams`, but will consider `filters` to be the
// “latest set of values”. Any matching `searchParams[key]` will
// have it’s `value` replaced by the corresponding `filters[key]`.
// In other words: `keys` are merged while `values` are replaced.
filters.getQueryString(searchParams);

///
/// Spunj properties

// Get an object representation of `Spunj`.
filters.parse;

// Get a JSON stringified representation of `Spunj`.
filters.serialize;

// Get a `URLSearchParams` representation of `Spunj`.
filters.urlSearchParams;

// Get a “total count” of every individual `value` in the `Spunj`.
filters.total;
```

## Usage

Just like a `Map`, it can be initialized empty, or pre-populated by passing an `Iterable` of the correct “shape”. A `SpunjIterable` type is provided to help TypeScript when it cannot correctly reconcile the argument’s implicit type.

Below are a few recipes to help get started.

### Initialization

Most `Spunj` initializations will be “starting fresh” without passing an argument to the constructor.

```tsx
import {Spunj} from 'spunj';

const emptyFilter = new Spunj();

emptyFilter.set('firstEntry', ['value1', 'value2', 'etc']);
emptyFilter.append(
  'keyWithStringValues',
  'first string',
  'second string',
  ...(emptyFilter.get('firstEntry') ?? []),
);
```

#### Constructor argument

```tsx
const basicFilter = new Spunj([
  ['first', ['all', 'strings']],
  ['middle', ['un', 'deux', 'trois']],
  ['last', ['single value']],
  // Keys are unique, so any repeat `key`
  // will overwrite the previous identical `key`.
  ['last', ['hello', 'world']],
]);

basicFilter.append('middle', 'quatre', 'cinq');
```

#### Complex initial filter

```tsx
import type {SpunjIterable} from 'spunj';

// Use of the `SpunjIterable` type is sometimes
// required to help TypeScript understand the typing.
// `SpunjIterable` can also accept generic arguments.
const mixedIterable: SpunjIterable = [
  ['pureNumber', [1, 2, 3]],
  ['pureString', ['un', 'deux', 'trois']],
  ['pureTrue', [true]],
  ['mixedValues', ['one', 2, true]],
];

const mixedFilter = new Spunj(mixedIterable);
mixedFilter.remove('pureString', 'trois', 'un');
```

### Generics

The `Spunj` class makes use of some generic typing to help you further scope the data you intend to work with.

#### `key` argument

```tsx
enum ValidFilter {
  Collections = 'collections',
  Members = 'members',
}

// Passing `ValidFilter` as the “key argument” to the generic.
const customFilters = new Spunj<ValidFilter>();

// Works because each method restricts the `key` argument to a `ValidFilter`.
customFilters.set(ValidFilter.Collections, ['value1', 'value2']);
customFilters.remove(ValidFilter.Members, 'value1', 'value2');

// Throws TypeError, because ‘myKey’ is not compatible with `ValidFilter`.
customFilters.set('myKey', ['value1', 'value2']);
```

#### `value` argument

```tsx
// Continue to accept any `string` as `key`,
// but restrict `value` to an array of `number` items.
const customFilters = new Spunj<string, number>();

// Works because each method restricts the `value` argument to be a `number`.
// Each `value` will ultimately be an `array`, but the generic argument
// specifies the “element type” of that array. Thus,
// passing `number` means we will store values of the type `number[]`.
customFilters.set('stringKey', [1, 2, 3, 4]);
customFilters.remove('stringKey', 4, 2);

// Throws TypeError, because ‘foo’ is not compatible with `number`.
customFilters.set('myKey', [1, 'foo', 3]);
```

### URL query params

It is common to represent filters as url query / search params. There are a few methods and properties to help with this.

#### Manual query navigation with React

```tsx
import {useLocation, useNavigation, useSearchParams} from 'react-router-dom';

const initialFilters = new Spunj([
  ['first', ['one']],
  ['last', ['deux', 'trois']],
]);

function MyComponent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Assume a URL of:
  // https://dulmage.me/home?foo=bar,baz&first=nope&something=true
  const [searchParams] = useSearchParams();

  function handleRedirect() {
    // Result will be:
    // ?foo=bar%2Cbaz&first=one&something=true&last=deux%2Ctrois
    const queryString = initialFilters.getQueryString(searchParams);

    if (queryString) {
      navigate(`${location.pathname}?${queryString}`);
    }
  }

  return (
    <button type="button" onClick={handleRedirect}>
      Navigate somewhere
    </button>
  );
}
```

#### Query with omissions

```tsx
// Assume the same `Spunj` instance from the last example.
const filtersWithOmissions = new Spunj(previousFilters);

// Now that we have safely cloned the `Spunj` instance we intend
// to send back to state, we can remove whatever `keys` we do not
// want to send to the URL search params.
filtersWithOmissions.delete('direction');
filtersWithOmissions.delete('members');
filtersWithOmissions.delete('ownership');

// Now we can generate a query string with only the filters we want.
const queryString = filtersWithOmissions.getQueryString(searchParams);

// Alternatively, I could have used regex:
const altQueryString = previousFilters
  .getQueryString(searchParams)
  .replace(someRegEx, '');
```
