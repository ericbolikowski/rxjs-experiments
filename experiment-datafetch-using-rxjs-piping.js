/* Get required rxjs components */
const { Observable, pipe } = require('rxjs/Rx')
const { fromPromise, of, concat, merge } = Observable
const { map, mergeMap, filter, reduce } = require("rxjs/operators")
/* Get request for REST calls */
const request = require("request-promise");

/* Simple function constructing correct URL to jsonplaceholder given entity and id parameters */
const entityUrl = (entity, id) => `https://jsonplaceholder.typicode.com/${entity}/${id}`

/* Operators */
const plusOne = map(x => x + 1)
const convertToUrl = (entity) => map(id => entityUrl(entity, id))
const getUrlContents = mergeMap(url => fromPromise(request(url, { json: true })))
const addEntityType = (type) => map(x => Object.assign(x, { type }))

/* Entity stream factory */
const createEntityStream = (pullInterval, entity) => Observable.interval(pullInterval).pipe(
    plusOne, convertToUrl(entity), getUrlContents, addEntityType(entity)
)

/* Declare two entity streams: posts and photos */
const posts$ = createEntityStream(200, "posts")
const photos$ = createEntityStream(200, "photos")

/* Take X posts and photos, combine into one stream, and then another. First by concat, then by merge */
const X = 3
const concatCombined$ = concat(posts$.take(X), photos$.take(X))
const mergeCombined$ = merge(posts$.take(X), photos$.take(X))

/* Print all entities from concat stream, then all entities from merge stream. Afterwards print completion message */
concatCombined$
    .do(x => console.log("Concat-combined:", x))
    .switchMap(() => mergeCombined$)
    .do(x => console.log("Merge-combined:", x))
    .subscribe(null, null, () => console.log("complete"))
