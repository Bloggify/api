# Bloggify API
Bloggify official api plugin.

# Installation

```js
{
  "name": "_api",
  "source": "git@github.com:Bloggify/api.git",
  "version": "master"
}
```

# Rest API

<table>
    <thead>
        <tr>
            <th>Method</th>
            <th>Url</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>GET|POST</code></td>
            <td><code>/api/articles</code></td>
            <td>Lists summary details of articles.</td>
        </tr>
        <tr>
            <td><code>GET|POST</code></td>
            <td><code>/api/article/:id</code></td>
            <td>Lists summary details of an article.</td>
        </tr>
        <tr>
            <td><code>POST</code></td>
            <td><code>/api/save/article</code></td>
            <td>Saves an article</td>
        </tr>
        <tr>
            <td><code>POST</code></td>
            <td><code>/api/delete/article</code></td>
            <td>Deletes an article</td>
        </tr>
        <tr>
            <td><code>GET|POST</code></td>
            <td><code>/api/pages</code></td>
            <td>Lists summary details of pages.</td>
        </tr>
        <tr>
            <td><code>GET|POST</code></td>
            <td><code>/api/page/:slug</code></td>
            <td>Lists summary details of a page.</td>
        </tr>
        <tr>
            <td><code>POST</code></td>
            <td><code>/api/save/page</code></td>
            <td>Saves anpage</td>
        </tr>
        <tr>
            <td><code>POST</code></td>
            <td><code>/api/delete/page</code></td>
            <td>Deletes a page</td>
        </tr>
        <tr>
            <td><code>GET</code></td>
            <td><code>/api/sync</code></td>
            <td>Sync remote data with local data.</td>
        </tr>
    </tbody>
</table>

# Accessing API functions

## Articles

### `list(data, callback)`
Lists summary details about articles.

#### Params
- **Object** `data`: An object containing the following fields:
 - `Object` *query* The query applied to find request (Default: `{}`).
 - `Object` *m_options* The options applied to find request (Default: `{}`).
 - `Object` *options* An object containing the following fields:
   - `Boolean` *noContent* If `false`, the content of articles will be fetched (Default: true).
   - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).

- **Function** `callback`: The callback function (err, responseObj).

### `get(id, data, callback)`
Gets summary details of an article.

#### Params
- **Integer|String** `id`: The article id.
- **Object** `data`: An object containing the following fields:
 - `Object` *m_options* The options applied to find request (Default: `{}`).
 - `Object` *options* An object containing the following fields:
   - `Boolean` *noContent* If `false`, the content of articles will be fetched (Default: true).
   - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).

- **Function** `callback`: The callback function (err, responseObj).

### `save(data, callback)`
Creates or updates an article.

#### Params
- **Object** `data`: An object that must containin valid fields, following article schema.
- **Function** `callback`: The callback function (err, responseObj).

### `delete(data, callback)`
Deletes an article.

### Params
- **Object** `data`: An object containing the following fields:
 - `String|Integer` id: The article id that should be deleted.

- **Function** `callback`: The callback function (err, responseObj).

## Pages

### `list(data, callback)`
Lists summary details about pages.

#### Params
- **Object** `data`: An object containing the following fields:
 - `Object` *query* The query applied to find request (Default: `{}`).
 - `Object` *m_options* The options applied to find request (Default: `{}`).
 - `Object` *options* An object containing the following fields:
   - `Boolean` *noContent* If `false`, the content of pages will be fetched (Default: true).
   - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).
   - `Boolean` *noBlog* If `true`, the Blog page (that is special) will not be fetched.

- **Function** `callback`: The callback function (err, responseObj).

### `get(slug, data, callback)`
Gets summary details of a page.

#### Params
- **Integer|String** `slug`: The page slug.
- **Object** `data`: An object containing the following fields:
 - `Object` *m_options* The options applied to find request (Default: `{}`).
 - `Object` *options* An object containing the following fields:
   - `Boolean` *noContent* If `false`, the content of pages  will be fetched (Default: true).
   - `Boolean` *markdown* If `true`, the content will be parsed as Markdown (Default: true).

- **Function** `callback`: The callback function (err, responseObj).

### `save(data, callback)`
Creates or updates a page.

#### Params
- **Object** `data`: An object that must containin valid fields, following page schema.
- **Function** `callback`: The callback function (err, responseObj).

### `delete(data, callback)`
Deletes a page.

#### Params
- **Object** `data`: An object containing the following fields:
 - `String|Integer` id: The page slug that should be deleted.

- **Function** `callback`: The callback function (err, responseObj).

## Git Handlers

### `update(message, callback)`
Adds all the files and makes the commit.

#### Params
- **String** `message`: The commit message.
- **Function** `callback`: The callback function (err, data).

### `remote(callback)`
Pulls data from remote and then pushes.

#### Params
- **Function** `callback`: The callback function (err, data).

## Utils
### `sync(callback)`
Syncs the remote data with the local data.

#### Params
- **Function** `callback`: The callback function (err, data).


## How to contribute

1. File an issue in the repository, using the bug tracker, describing the
   contribution you'd like to make. This will help us to get you started on the
   right foot.
2. Fork the project in your account and create a new branch:
   `your-great-feature`.
3. Commit your changes in that branch.
4. Open a pull request, and reference the initial issue in the pull request
   message.

## License
See the [LICENSE](./LICENSE) file.
