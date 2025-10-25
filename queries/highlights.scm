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
] @function.builtin

; Entity/Class names (PHP-style - these are the Doctrine entities)
(AbstractSchemaName
  (identifier) @type)

; Field references
(SingleValuedAssociationPathExpression
  (IdentificationVariable) @variable
  (SingleValuedAssociationField) @property)

(StateFieldPathExpression
  (IdentificationVariable) @variable
  (StateField
    (SimpleStateField) @property))

; Variables and aliases
(IdentificationVariable) @variable
(AliasIdentificationVariable) @variable
(ResultVariable) @variable
(AliasResultVariable) @variable

; String literals
(string) @string
(char) @string

; Numeric literals
(integer) @number
(float) @number

; Boolean literals
(boolean) @boolean
"true" @boolean
"false" @boolean

; Parameters
(NamedParameter) @parameter
(PositionalParameter) @parameter
(InputParameter) @parameter

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