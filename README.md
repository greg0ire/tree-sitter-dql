# DQL Tree-Sitter Grammar

A tree-sitter grammar for Doctrine Query Language (DQL), the object-oriented
query language used by Doctrine ORM in PHP.

## Usage

### PHP Integration

![DQL inside PHP inside markdown](https://github.com/user-attachments/assets/08f05d56-8d0b-4b9b-8fe1-b8163ad4b65f)

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

## Installation

1. Clone this repository
2. Build the grammar: `tree-sitter generate`
3. Test: `tree-sitter test`
4. For PHP integration: Follow the PHP Integration steps above

## Usage with nvim-treesitter (main branch)

⚠️ If you are still using the `master` branch, the syntax will be slightly
different I think.

Create the following autocommand in your Neovim config:

```lua
vim.api.nvim_create_autocmd('User', { pattern = 'TSUpdate',
callback = function()
  require('nvim-treesitter.parsers').dql = {
    install_info = {
      url = 'https://github.com/greg0ire/tree-sitter-dql',
      revision = 'v1.0.0',
      queries = 'queries',
    },
  }
end})
```

Run `:TSInstall dql` to install the parser.

After that, when you open a `.dql` file, and type `:set filetype=dql`, you
should see colors. That's pretty useless, but it's a nice check to perform.
Alternatively, you can open this very README with Neovim, and check that the
fence code block below is highlighted:

```dql
SELECT u.name, COUNT(a) as articleCount FROM User u
LEFT JOIN u.articles a
WHERE u.active = true
```

The final step is very manual for now: you need to add the injection rules to your
PHP queries. To do so, copy the contents of `php-dql-injections.scm` into your
`~/.config/nvim/queries/php/injections.scm` file (create it if it does not exist).

You should now have DQL highlighting in PHP heredoc/nowdoc blocks! 🎉

## Bindings

This parser cannot be used from other languages because I removed the default
bindings. If you think they could be useful, for your use case, please send a
PR restoring whichever bindings you need and I will publish them.
