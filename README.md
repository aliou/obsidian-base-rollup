# Base Rollup

Base Rollup is an Obsidian plugin that registers a custom Bases table view.

The view renders Base query results in a table-like layout and writes an aggregate value back to the note that embeds the Base. This is useful for keeping frontmatter properties, such as `sources`, in sync with the current Base result set.

## Features

- Custom Bases view type: `rollup-table`.
- Configurable target frontmatter property on the embedding note.
- Aggregations:
  - number of rows
  - sum
  - average
  - minimum
  - maximum
- Optional source property for numeric aggregations.
- Basic table rendering with grouping, links, and column resizing.

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
      - Author
      - Date
      - Type
```

For numeric aggregations, set `aggregation` and `sourceProperty`:

```yaml
aggregation: sum
sourceProperty: formula.score
```

The target property is written to the note that embeds the Base.
