package tree_sitter_dql_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_dql "github.com/greg0ire/dql-treesitter/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_dql.Language())
	if language == nil {
		t.Errorf("Error loading Doctrine Query Language grammar")
	}
}
