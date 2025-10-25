; DQL Syntax Highlighting
; SQL-style highlighting with PHP-style class names

; Keywords (SQL-style) - only keywords that exist in our grammar
[
  "SELECT"
  "FROM" 
  "WHERE"
  "JOIN"
  "LEFT"
  "INNER"
  "OUTER"
  "GROUP"
  "BY"
  "HAVING"
  "ORDER"
  "ASC"
  "DESC"
  "UPDATE"
  "SET"
  "DELETE"
  "AND"
  "OR"
  "NOT"
  "IN"
  "BETWEEN"
  "LIKE"
  "IS"
  "NULL"
  "AS"
  "DISTINCT"
  "ALL"
  "ANY"
  "SOME"
  "EXISTS"
  "CASE"
  "WHEN"
  "THEN"
  "ELSE"
  "END"
  "WITH"
  "ON"
  "NEW"
  "INSTANCE"
  "OF"
  "MEMBER"
  "EMPTY"
  "IDENTITY"
  "PARTIAL"
  "HIDDEN"
  "INDEX"
  "ESCAPE"
  "LEADING"
  "TRAILING"
  "BOTH"
] @keyword

; Aggregate and built-in functions (SQL-style) - only functions in our grammar
[
  "COUNT"
  "SUM"
  "AVG"
  "MIN"
  "MAX"
  "CONCAT"
  "SUBSTRING"
  "TRIM"
  "UPPER"
  "LOWER"
  "LENGTH"
  "ABS"
  "SQRT"
  "COALESCE"
  "NULLIF"
  "SIZE"
  "DATE_ADD"
  "DATE_SUB"
  "DATE_DIFF"
  "CURRENT_DATE"
  "CURRENT_TIME"
  "CURRENT_TIMESTAMP"
  "LOCATE"
  "MOD"
  "BIT_AND"
  "BIT_OR"
  "NAMED"
] @function.builtin

; Entity/Class names (PHP-style - these are the Doctrine entities)
(abstract_schema_name
  (identifier) @type)

; Field references
(single_valued_association_path_expression
  (identification_variable) @variable
  (field_identification_variable) @property)

(state_field_path_expression
  (identification_variable) @variable
  (state_field
    (field_identification_variable) @property))

; Variables and aliases
(identification_variable) @variable
(alias_identification_variable) @variable
(result_variable) @variable
(alias_result_variable) @variable

; String literals
(string_literal) @string
(char_literal) @string

; Numeric literals
(integer_literal) @number
(float_literal) @number

; Boolean literals
(boolean_literal) @boolean
"true" @boolean
"false" @boolean

; Parameters
(named_parameter) @parameter
(positional_parameter) @parameter
(input_parameter) @parameter

; Comments
(comment) @comment

; Operators
[
  "="
  "!="
  "<>"
  "<"
  "<="
  ">"
  ">="
  "+"
  "-"
  "*"
  "/"
] @operator

; Punctuation
[
  "("
  ")"
  ","
  "."
  ":"
  "?"
  "{"
  "}"
] @punctuation.delimiter

; NULL constant
"NULL" @constant.builtin