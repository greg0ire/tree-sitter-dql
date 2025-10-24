; DQL Local Variables and Scoping
; Defines variable scopes for aliases and parameters

; Entity aliases create a local scope
(range_variable_declaration
  (abstract_schema_name) @definition.type
  (alias_identification_variable) @definition.variable) @scope

; Field aliases in SELECT clause
(alias_result_variable) @definition.variable

; Variable references
(identification_variable) @reference

; Parameters are global references
(named_parameter) @reference
(positional_parameter) @reference