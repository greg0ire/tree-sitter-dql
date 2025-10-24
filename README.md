# DQL Tree-Sitter Grammar

A tree-sitter grammar for Doctrine Query Language (DQL), the object-oriented
query language used by Doctrine ORM in PHP.

## Usage

### PHP Integration
The most common use case is DQL embedded in PHP using heredoc/nowdoc syntax:

```php
<?php
$dql = <<<DQL
SELECT u.name, COUNT(a) as articleCount
FROM User u 
LEFT JOIN u.articles a 
WHERE u.active = true
GROUP BY u.name
HAVING COUNT(a) > 5
DQL;
```

To enable DQL highlighting in PHP heredoc/nowdoc blocks:

1. **Add injection rules**: Add the contents of `php-dql-injections.scm` to
   your PHP tree-sitter grammar's `queries/injections.scm` file
2. **Install DQL parser**: Ensure your tree-sitter setup can find the DQL grammar
3. **Copy query files**: Copy `queries/highlights.scm` and `queries/locals.scm`
   to your editor's DQL queries directory
   - For Neovim: `~/.config/nvim/queries/dql/highlights.scm` and `~/.config/nvim/queries/dql/locals.scm`


## Testing

Run the test suite:
```bash
tree-sitter test      # Grammar tests
npm test             # Node.js binding tests
```

## Installation

1. Clone this repository
2. Build the grammar: `tree-sitter generate`
3. Test: `tree-sitter test`
4. For PHP integration: Follow the PHP Integration steps above
