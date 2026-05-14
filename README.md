# Base Rollup

Base Rollup is an Obsidian plugin that registers a custom Bases view type (`rollup-table`).

The view renders Base query results in a table with grouping, links, and column resizing, and writes an aggregate value back to the frontmatter of the note that embeds the Base. This is useful for keeping frontmatter properties, such as `sources`, in sync with the current Base result set.

## Features

- Custom Bases view type: `rollup-table`.
- Configurable target frontmatter property on the embedding note (defaults to `rollup`).
- Aggregations (`aggregation` option):
  - `rowCount` — number of rows (default)
  - `sum` — sum of numeric values
  - `avg` — average of numeric values
  - `min` — minimum of numeric values
  - `max` — maximum of numeric values
- Optional `sourceProperty` for numeric aggregations (hidden automatically when `rowCount` is selected).
- Table rendering with group headings, wikilinks, and resizable columns.

## Usage

In a `.base` file, set a view to use `rollup-table`:

```yaml
views:
  - type: rollup-table
    name: Sources for This Page
    targetProperty: sources
    aggregation: rowCount
    order:
      - file.name
      - note.Author
      - note.Date
      - note.Type
```

For numeric aggregations, set `aggregation` and `sourceProperty`:

```yaml
aggregation: sum
sourceProperty: note.score
```

If `targetProperty` is omitted, it defaults to `rollup`. The target property is written to the frontmatter of the note that embeds the Base.
