# Contributing

You will need to get the
[tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/creating-parsers/1-getting-started.html#installation)
to work on this project.

## Doing changes

Most code is generated from the grammar definition in `grammar.js`. To make changes:
1. Edit `grammar.js` to modify the grammar rules.
2. Run `tree-sitter generate` to regenerate the parser code.
3. Update query files in the `queries/` directory as needed for syntax highlighting and other features.
4. Test your changes using the test suite.

## Testing

Run the test suite:

```bash
tree-sitter test      # Grammar tests
npm test              # Node.js binding tests
```

Test highlighting in the CLI:

```bash
echo "SELECT * FROM User" | tree-sitter highlight
```
