; DQL Local Variables and Scoping
; Defines variable scopes for aliases and parameters

; Entity aliases create a local scope
(RangeVariableDeclaration
  (AbstractSchemaName) @definition.type
  (AliasIdentificationVariable) @definition.variable) @scope

; Field aliases in SELECT clause
(AliasResultVariable) @definition.variable

; Variable references
(IdentificationVariable) @reference

; Parameters are global references
(NamedParameter) @reference
(PositionalParameter) @reference