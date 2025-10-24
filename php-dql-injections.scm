; DQL Language Injections for PHP
; This file should be added to the PHP tree-sitter grammar's injections.scm
; or used as a standalone injection configuration

; Heredoc with DQL delimiter
(heredoc
  (heredoc_body) @injection.content
  (heredoc_end) @_delimiter
  (#match? @_delimiter "^DQL$")
  (#set! injection.language "dql"))

; Nowdoc with DQL delimiter  
(nowdoc
  (nowdoc_body) @injection.content
  (heredoc_end) @_delimiter
  (#match? @_delimiter "^DQL$")
  (#set! injection.language "dql"))

; Also support lowercase 'dql'
(heredoc
  (heredoc_body) @injection.content
  (heredoc_end) @_delimiter
  (#match? @_delimiter "^dql$")
  (#set! injection.language "dql"))

(nowdoc
  (nowdoc_body) @injection.content
  (heredoc_end) @_delimiter
  (#match? @_delimiter "^dql$")
  (#set! injection.language "dql"))