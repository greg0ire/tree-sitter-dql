/**
 * @file Language used by Doctrine ORM to query PHP objects
 * @author Grégoire Paris <postmaster@greg0ire.fr>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "dql",

  extras: $ => [
    /\s+/,
    $.comment
  ],

  conflicts: $ => [
    [$.identification_variable, $.result_variable],
    [$.string_primary, $.literal],
    [$.boolean_primary, $.literal],
    [$.fully_qualified_name, $.abstract_schema_name],
    [$.state_field, $.single_valued_association_path_expression],
    [$.order_by_item, $.scalar_expression],
    [$.arithmetic_expression, $.string_expression],
    [$.state_field, $.single_valued_association_path_expression, $.collection_valued_path_expression],
    [$.exists_expression]
  ],

  rules: {
    // QueryLanguage ::= SelectStatement | UpdateStatement | DeleteStatement
    source_file: $ => repeat(choice(
      $.select_statement,
      $.update_statement,
      $.delete_statement
    )),

    // Comments - support SQL style comments
    comment: $ => choice(
      seq('--', /.*/),
      seq('/*', /[^*]*\*+([^/*][^*]*\*+)*/, '/')
    ),

    // === STATEMENTS ===

    // SelectStatement ::= SelectClause FromClause [WhereClause] [GroupByClause] [HavingClause] [OrderByClause]
    select_statement: $ => seq(
      $.select_clause,
      $.from_clause,
      optional($.where_clause),
      optional($.group_by_clause),
      optional($.having_clause),
      optional($.order_by_clause)
    ),

    // UpdateStatement ::= UpdateClause [WhereClause]
    update_statement: $ => seq(
      $.update_clause,
      optional($.where_clause)
    ),

    // DeleteStatement ::= DeleteClause [WhereClause]
    delete_statement: $ => seq(
      $.delete_clause,
      optional($.where_clause)
    ),

    // === CLAUSES ===

    // SelectClause ::= "SELECT" ["DISTINCT"] SelectExpression {"," SelectExpression}*
    select_clause: $ => seq(
      field('keyword', alias(/select/i, 'SELECT')),
      optional(field('distinct', alias(/distinct/i, 'DISTINCT'))),
      field('expressions', commaSep1($.select_expression))
    ),

    // FromClause ::= "FROM" IdentificationVariableDeclaration {"," IdentificationVariableDeclaration}*
    from_clause: $ => seq(
      field('keyword', alias(/from/i, 'FROM')),
      field('declarations', commaSep1($.identification_variable_declaration))
    ),

    // WhereClause ::= "WHERE" ConditionalExpression
    where_clause: $ => seq(
      field('keyword', alias(/where/i, 'WHERE')),
      field('condition', $.conditional_expression)
    ),

    // GroupByClause ::= "GROUP" "BY" GroupByItem {"," GroupByItem}*
    group_by_clause: $ => seq(
      field('keyword', seq(
        alias(/group/i, 'GROUP'),
        alias(/by/i, 'BY')
      )),
      field('items', commaSep1($.group_by_item))
    ),

    // HavingClause ::= "HAVING" ConditionalExpression
    having_clause: $ => seq(
      field('keyword', alias(/having/i, 'HAVING')),
      field('condition', $.conditional_expression)
    ),

    // OrderByClause ::= "ORDER" "BY" OrderByItem {"," OrderByItem}*
    order_by_clause: $ => seq(
      field('keyword', seq(
        alias(/order/i, 'ORDER'),
        alias(/by/i, 'BY')
      )),
      field('items', commaSep1($.order_by_item))
    ),

    // UpdateClause ::= "UPDATE" AbstractSchemaName ["AS"] AliasIdentificationVariable "SET" UpdateItem {"," UpdateItem}*
    update_clause: $ => seq(
      field('keyword', alias(/update/i, 'UPDATE')),
      field('entity', $.abstract_schema_name),
      optional(alias(/as/i, 'AS')),
      field('alias', $.alias_identification_variable),
      alias(/set/i, 'SET'),
      field('items', commaSep1($.update_item))
    ),

    // DeleteClause ::= "DELETE" ["FROM"] AbstractSchemaName ["AS"] AliasIdentificationVariable
    delete_clause: $ => seq(
      field('keyword', alias(/delete/i, 'DELETE')),
      optional(alias(/from/i, 'FROM')),
      field('entity', $.abstract_schema_name),
      optional(alias(/as/i, 'AS')),
      field('alias', $.alias_identification_variable)
    ),

    // === IDENTIFIERS ===

    // Basic identifier pattern: [a-z_][a-z0-9_]*
    identifier: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    // Fully qualified class name (PHP namespace style)
    fully_qualified_name: $ => seq(
      optional('\\'),
      $.identifier,
      repeat(seq('\\', $.identifier))
    ),

    // AbstractSchemaName ::= fully_qualified_name | identifier
    abstract_schema_name: $ => choice(
      $.fully_qualified_name,
      $.identifier
    ),

    // Alias identification variable (for FROM clause aliases)
    alias_identification_variable: $ => $.identifier,

    // Identification variable (for referencing aliases)
    identification_variable: $ => $.identifier,

    // Result variable (for SELECT clause aliases)
    alias_result_variable: $ => $.identifier,
    result_variable: $ => $.identifier,

    // Field identification variable
    field_identification_variable: $ => $.identifier,

    // === PATH EXPRESSIONS ===

    // StateFieldPathExpression ::= IdentificationVariable "." StateField
    state_field_path_expression: $ => seq(
      field('object', $.identification_variable),
      '.',
      field('field', $.state_field)
    ),

    // StateField ::= {EmbeddedClassStateField "."}* SimpleStateField
    state_field: $ => seq(
      repeat(seq($.field_identification_variable, '.')),
      $.field_identification_variable
    ),

    // SingleValuedAssociationPathExpression ::= IdentificationVariable "." SingleValuedAssociationField
    single_valued_association_path_expression: $ => seq(
      field('object', $.identification_variable),
      '.',
      field('field', $.field_identification_variable)
    ),

    // CollectionValuedPathExpression ::= IdentificationVariable "." CollectionValuedAssociationField
    collection_valued_path_expression: $ => seq(
      field('object', $.identification_variable),
      '.',
      field('field', $.field_identification_variable)
    ),

    // === FROM DECLARATIONS ===

    // IdentificationVariableDeclaration ::= RangeVariableDeclaration [IndexBy] {Join}*
    identification_variable_declaration: $ => seq(
      $.range_variable_declaration,
      optional($.index_by),
      repeat($.join)
    ),

    // RangeVariableDeclaration ::= AbstractSchemaName ["AS"] AliasIdentificationVariable
    range_variable_declaration: $ => seq(
      field('entity', $.abstract_schema_name),
      optional(alias(/as/i, 'AS')),
      field('alias', $.alias_identification_variable)
    ),

    // IndexBy ::= "INDEX" "BY" SingleValuedPathExpression
    index_by: $ => seq(
      alias(/index/i, 'INDEX'),
      alias(/by/i, 'BY'),
      choice(
        $.state_field_path_expression,
        $.single_valued_association_path_expression
      )
    ),

    // Join ::= ["LEFT" ["OUTER"] | "INNER"] "JOIN" (JoinAssociationDeclaration | RangeVariableDeclaration) ["WITH" ConditionalExpression]
    join: $ => seq(
      optional(choice(
        seq(alias(/left/i, 'LEFT'), optional(alias(/outer/i, 'OUTER'))),
        alias(/inner/i, 'INNER')
      )),
      alias(/join/i, 'JOIN'),
      choice($.join_association_declaration, $.range_variable_declaration),
      optional(seq(alias(/with/i, 'WITH'), $.conditional_expression))
    ),

    // JoinAssociationDeclaration ::= JoinAssociationPathExpression ["AS"] AliasIdentificationVariable [IndexBy]
    join_association_declaration: $ => seq(
      $.join_association_path_expression,
      optional(alias(/as/i, 'AS')),
      $.alias_identification_variable,
      optional($.index_by)
    ),

    // JoinAssociationPathExpression ::= IdentificationVariable "." (CollectionValuedAssociationField | SingleValuedAssociationField)
    join_association_path_expression: $ => seq(
      $.identification_variable,
      '.',
      $.field_identification_variable
    ),

    // === SELECT EXPRESSIONS ===

    // SelectExpression ::= (IdentificationVariable | ScalarExpression | AggregateExpression | FunctionDeclaration | PartialObjectExpression | "(" Subselect ")" | CaseExpression | NewObjectExpression) [["AS"] ["HIDDEN"] AliasResultVariable]
    select_expression: $ => seq(
      choice(
        $.aggregate_expression,
        $.function_declaration,
        $.case_expression,
        $.new_object_expression,
        seq('(', $.select_statement, ')'), // Subselect
        $.partial_object_expression,
        $.identification_variable,
        $.scalar_expression
      ),
      optional(seq(
      optional(alias(/as/i, 'AS')),
        optional(alias(/hidden/i, 'HIDDEN')),
        $.alias_result_variable
      ))
    ),

    // PartialObjectExpression ::= "PARTIAL" IdentificationVariable "." PartialFieldSet
    partial_object_expression: $ => seq(
      alias(/partial/i, 'PARTIAL'),
      $.identification_variable,
      '.',
      $.partial_field_set
    ),

    // PartialFieldSet ::= "{" SimpleStateField {"," SimpleStateField}* "}"
    partial_field_set: $ => seq(
      '{',
      commaSep1($.field_identification_variable),
      '}'
    ),

    // NewObjectExpression ::= "NEW" AbstractSchemaName "(" NewObjectArg {"," NewObjectArg}* ")"
    new_object_expression: $ => seq(
      choice(
        alias(/new/i, 'NEW'),
        seq(alias(/new/i, 'NEW'), alias(/named/i, 'NAMED'))
      ),
      $.abstract_schema_name,
      '(',
      optional(commaSep1($.new_object_arg)),
      ')'
    ),

    // NewObjectArg ::= (ScalarExpression | "(" Subselect ")" | NewObjectExpression | EntityAsDtoArgumentExpression) ["AS" AliasResultVariable]
    new_object_arg: $ => seq(
      choice(
        $.scalar_expression,
        seq('(', $.select_statement, ')'),
        $.new_object_expression,
        $.identification_variable
      ),
      optional(seq(alias(/as/i, 'AS'), $.alias_result_variable))
    ),

    // === ITEMS ===

    // UpdateItem ::= SingleValuedPathExpression "=" NewValue
    update_item: $ => seq(
      choice(
        $.state_field_path_expression,
        $.single_valued_association_path_expression
      ),
      '=',
      $.new_value
    ),

    // NewValue ::= SimpleArithmeticExpression | "NULL"
    new_value: $ => choice(
      $.simple_arithmetic_expression,
      alias(/null/i, 'NULL')
    ),

    // OrderByItem ::= (SimpleArithmeticExpression | SingleValuedPathExpression | ScalarExpression | ResultVariable | FunctionDeclaration) ["ASC" | "DESC"]
    order_by_item: $ => seq(
      choice(
        $.simple_arithmetic_expression,
        $.state_field_path_expression,
        $.single_valued_association_path_expression,
        $.scalar_expression,
        $.result_variable,
        $.function_declaration
      ),
      optional(choice(
        alias(/asc/i, 'ASC'),
        alias(/desc/i, 'DESC')
      ))
    ),

    // GroupByItem ::= IdentificationVariable | ResultVariable | SingleValuedPathExpression
    group_by_item: $ => choice(
      $.identification_variable,
      $.result_variable,
      $.state_field_path_expression,
      $.single_valued_association_path_expression
    ),

    // === CONDITIONAL EXPRESSIONS ===

    // ConditionalExpression ::= ConditionalTerm {"OR" ConditionalTerm}*
    conditional_expression: $ => prec.left(1, choice(
      $.conditional_term,
      seq($.conditional_expression, alias(/or/i, 'OR'), $.conditional_term)
    )),

    // ConditionalTerm ::= ConditionalFactor {"AND" ConditionalFactor}*
    conditional_term: $ => prec.left(2, choice(
      $.conditional_factor,
      seq($.conditional_term, alias(/and/i, 'AND'), $.conditional_factor)
    )),

    // ConditionalFactor ::= ["NOT"] ConditionalPrimary
    conditional_factor: $ => seq(
      optional(alias(/not/i, 'NOT')),
      $.conditional_primary
    ),

    // ConditionalPrimary ::= SimpleConditionalExpression | "(" ConditionalExpression ")"
    conditional_primary: $ => choice(
      $.simple_conditional_expression,
      seq('(', $.conditional_expression, ')')
    ),

    // SimpleConditionalExpression ::= ComparisonExpression | BetweenExpression | LikeExpression | InExpression | NullComparisonExpression | ExistsExpression | EmptyCollectionComparisonExpression | CollectionMemberExpression | InstanceOfExpression
    simple_conditional_expression: $ => choice(
      $.comparison_expression,
      $.between_expression,
      $.like_expression,
      $.in_expression,
      $.null_comparison_expression,
      $.exists_expression,
      $.empty_collection_comparison_expression,
      $.collection_member_expression,
      $.instance_of_expression
    ),

    // === COMPARISON EXPRESSIONS ===

    // ComparisonExpression ::= ArithmeticExpression ComparisonOperator ( QuantifiedExpression | ArithmeticExpression )
    comparison_expression: $ => seq(
      $.arithmetic_expression,
      $.comparison_operator,
      choice($.quantified_expression, $.arithmetic_expression)
    ),

    // ComparisonOperator ::= "=" | "<" | "<=" | "<>" | ">" | ">=" | "!="
    comparison_operator: $ => choice('=', '<', '<=', '<>', '>', '>=', '!='),

    // BetweenExpression ::= ArithmeticExpression ["NOT"] "BETWEEN" ArithmeticExpression "AND" ArithmeticExpression
    between_expression: $ => seq(
      $.arithmetic_expression,
      optional(alias(/not/i, 'NOT')),
      alias(/between/i, 'BETWEEN'),
      $.arithmetic_expression,
      alias(/and/i, 'AND'),
      $.arithmetic_expression
    ),

    // LikeExpression ::= StringExpression ["NOT"] "LIKE" StringPrimary ["ESCAPE" char]
    like_expression: $ => seq(
      $.string_expression,
      optional(alias(/not/i, 'NOT')),
      alias(/like/i, 'LIKE'),
      $.string_primary,
      optional(seq(alias(/escape/i, 'ESCAPE'), $.char_literal))
    ),

    // InExpression ::= ArithmeticExpression ["NOT"] "IN" "(" (InParameter {"," InParameter}* | Subselect) ")"
    in_expression: $ => seq(
      $.arithmetic_expression,
      optional(alias(/not/i, 'NOT')),
      alias(/in/i, 'IN'),
      '(',
      choice(
        commaSep1($.in_parameter),
        $.select_statement
      ),
      ')'
    ),

    // InParameter ::= ArithmeticExpression | InputParameter
    in_parameter: $ => choice(
      $.arithmetic_expression,
      $.input_parameter
    ),

    // NullComparisonExpression ::= (InputParameter | NullIfExpression | CoalesceExpression | AggregateExpression | FunctionDeclaration | IdentificationVariable | SingleValuedPathExpression | ResultVariable) "IS" ["NOT"] "NULL"
    null_comparison_expression: $ => seq(
      choice(
        $.input_parameter,
        $.nullif_expression,
        $.coalesce_expression,
        $.aggregate_expression,
        $.function_declaration,
        $.identification_variable,
        $.state_field_path_expression,
        $.single_valued_association_path_expression,
        $.result_variable
      ),
      alias(/is/i, 'IS'),
      optional(alias(/not/i, 'NOT')),
      alias(/null/i, 'NULL')
    ),

    // ExistsExpression ::= ["NOT"] "EXISTS" "(" Subselect ")"
    exists_expression: $ => seq(
      optional(alias(/not/i, 'NOT')),
      alias(/exists/i, 'EXISTS'),
      '(',
      $.select_statement,
      ')'
    ),

    // EmptyCollectionComparisonExpression ::= CollectionValuedPathExpression "IS" ["NOT"] "EMPTY"
    empty_collection_comparison_expression: $ => seq(
      $.collection_valued_path_expression,
      alias(/is/i, 'IS'),
      optional(alias(/not/i, 'NOT')),
      alias(/empty/i, 'EMPTY')
    ),

    // CollectionMemberExpression ::= EntityExpression ["NOT"] "MEMBER" ["OF"] CollectionValuedPathExpression
    collection_member_expression: $ => seq(
      $.entity_expression,
      optional(alias(/not/i, 'NOT')),
      alias(/member/i, 'MEMBER'),
      optional(alias(/of/i, 'OF')),
      $.collection_valued_path_expression
    ),

    // InstanceOfExpression ::= IdentificationVariable ["NOT"] "INSTANCE" ["OF"] (InstanceOfParameter | "(" InstanceOfParameter {"," InstanceOfParameter}* ")")
    instance_of_expression: $ => seq(
      $.identification_variable,
      optional(alias(/not/i, 'NOT')),
      alias(/instance/i, 'INSTANCE'),
      optional(alias(/of/i, 'OF')),
      choice(
        $.instance_of_parameter,
        seq('(', commaSep1($.instance_of_parameter), ')')
      )
    ),

    // InstanceOfParameter ::= AbstractSchemaName | InputParameter
    instance_of_parameter: $ => choice(
      $.abstract_schema_name,
      $.input_parameter
    ),

    // QuantifiedExpression ::= ("ALL" | "ANY" | "SOME") "(" Subselect ")"
    quantified_expression: $ => seq(
      choice(
        alias(/all/i, 'ALL'),
        alias(/any/i, 'ANY'),
        alias(/some/i, 'SOME')
      ),
      '(',
      $.select_statement,
      ')'
    ),

    // === ARITHMETIC EXPRESSIONS ===

    // ArithmeticExpression ::= SimpleArithmeticExpression | "(" Subselect ")"
    arithmetic_expression: $ => choice(
      $.simple_arithmetic_expression,
      seq('(', $.select_statement, ')')
    ),

    // SimpleArithmeticExpression ::= ArithmeticTerm {("+" | "-") ArithmeticTerm}*
    simple_arithmetic_expression: $ => prec.left(3, choice(
      $.arithmetic_term,
      seq($.simple_arithmetic_expression, choice('+', '-'), $.arithmetic_term)
    )),

    // ArithmeticTerm ::= ArithmeticFactor {("*" | "/") ArithmeticFactor}*
    arithmetic_term: $ => prec.left(4, choice(
      $.arithmetic_factor,
      seq($.arithmetic_term, choice('*', '/'), $.arithmetic_factor)
    )),

    // ArithmeticFactor ::= [("+" | "-")] ArithmeticPrimary
    arithmetic_factor: $ => seq(
      optional(choice('+', '-')),
      $.arithmetic_primary
    ),

    // ArithmeticPrimary ::= SingleValuedPathExpression | Literal | "(" SimpleArithmeticExpression ")" | FunctionsReturningNumerics | AggregateExpression | FunctionsReturningStrings | FunctionsReturningDatetime | IdentificationVariable | ResultVariable | InputParameter | CaseExpression
    arithmetic_primary: $ => prec(2, choice(
      $.state_field_path_expression,
      $.single_valued_association_path_expression,
      $.literal,
      seq('(', $.simple_arithmetic_expression, ')'),
      $.functions_returning_numerics,
      $.aggregate_expression,
      $.functions_returning_strings,
      $.functions_returning_datetime,
      $.identification_variable,
      $.result_variable,
      $.input_parameter,
      $.case_expression
    )),

    // StringPrimary ::= StateFieldPathExpression | string | InputParameter | FunctionsReturningStrings | AggregateExpression | CaseExpression
    string_primary: $ => prec(1, choice(
      $.state_field_path_expression,
      $.string_literal,
      $.input_parameter,
      $.functions_returning_strings,
      $.aggregate_expression,
      $.case_expression
    )),

    // BooleanPrimary ::= StateFieldPathExpression | boolean | InputParameter
    boolean_primary: $ => choice(
      $.state_field_path_expression,
      $.boolean_literal,
      $.input_parameter
    ),

    // EntityExpression ::= SingleValuedAssociationPathExpression | SimpleEntityExpression
    entity_expression: $ => choice(
      $.single_valued_association_path_expression,
      $.simple_entity_expression
    ),

    // SimpleEntityExpression ::= IdentificationVariable | InputParameter
    simple_entity_expression: $ => choice(
      $.identification_variable,
      $.input_parameter
    ),

    // DatetimeExpression ::= DatetimePrimary | "(" Subselect ")"
    datetime_expression: $ => choice(
      $.datetime_primary,
      seq('(', $.select_statement, ')')
    ),

    // DatetimePrimary ::= StateFieldPathExpression | InputParameter | FunctionsReturningDatetime | AggregateExpression
    datetime_primary: $ => choice(
      $.state_field_path_expression,
      $.input_parameter,
      $.functions_returning_datetime,
      $.aggregate_expression
    ),

    // === SCALAR EXPRESSIONS ===

    // ScalarExpression ::= SimpleArithmeticExpression | StringPrimary | DateTimePrimary | StateFieldPathExpression | BooleanPrimary | CaseExpression | InstanceOfExpression
    scalar_expression: $ => choice(
      $.simple_arithmetic_expression,
      $.string_primary,
      $.datetime_primary,
      $.state_field_path_expression,
      $.boolean_primary,
      $.case_expression,
      $.instance_of_expression
    ),

    // StringExpression ::= StringPrimary | ResultVariable | "(" Subselect ")"
    string_expression: $ => choice(
      $.string_primary,
      $.result_variable,
      seq('(', $.select_statement, ')')
    ),

    // BooleanExpression ::= BooleanPrimary | "(" Subselect ")"

    // BooleanPrimary ::= StateFieldPathExpression | boolean | InputParameter
    boolean_primary: $ => choice(
      $.state_field_path_expression,
      $.boolean_literal,
      $.input_parameter
    ),

    // EntityExpression ::= SingleValuedAssociationPathExpression | SimpleEntityExpression
    entity_expression: $ => choice(
      $.single_valued_association_path_expression,
      $.simple_entity_expression
    ),

    // SimpleEntityExpression ::= IdentificationVariable | InputParameter
    simple_entity_expression: $ => choice(
      $.identification_variable,
      $.input_parameter
    ),

    // DatetimeExpression ::= DatetimePrimary | "(" Subselect ")"
    datetime_expression: $ => choice(
      $.datetime_primary,
      seq('(', $.select_statement, ')')
    ),

    // DatetimePrimary ::= StateFieldPathExpression | InputParameter | FunctionsReturningDatetime | AggregateExpression
    datetime_primary: $ => choice(
      $.state_field_path_expression,
      $.input_parameter,
      $.functions_returning_datetime,
      $.aggregate_expression
    ),

    // === LITERALS ===

    // Literal ::= string | char | integer | float | boolean
    literal: $ => choice(
      $.string_literal,
      $.char_literal,
      $.integer_literal,
      $.float_literal,
      $.boolean_literal
    ),

    // String literal with single quotes (DQL style)
    string_literal: $ => /'([^'\\]|\\.)*'/,

    // Character literal
    char_literal: $ => /'[^'\\]'/,

    // Integer literal
    integer_literal: $ => /-?\d+/,

    // Float literal
    float_literal: $ => /-?\d+\.\d+([eE][+-]?\d+)?/,

    // Boolean literal
    boolean_literal: $ => choice(
      alias(/true/i, 'true'),
      alias(/false/i, 'false')
    ),

    // === INPUT PARAMETERS ===

    // InputParameter ::= PositionalParameter | NamedParameter
    input_parameter: $ => choice(
      $.positional_parameter,
      $.named_parameter
    ),

    // PositionalParameter ::= "?" integer
    positional_parameter: $ => seq('?', /\d+/),

    // NamedParameter ::= ":" string
    named_parameter: $ => seq(':', $.identifier),

    // === AGGREGATE EXPRESSIONS ===

    // AggregateExpression ::= ("AVG" | "MAX" | "MIN" | "SUM" | "COUNT") "(" ["DISTINCT"] SimpleArithmeticExpression ")"
    aggregate_expression: $ => seq(
      choice(
        alias(token(prec(1, /avg/i)), 'AVG'),
        alias(token(prec(1, /max/i)), 'MAX'),
        alias(token(prec(1, /min/i)), 'MIN'),
        alias(token(prec(1, /sum/i)), 'SUM'),
        alias(token(prec(1, /count/i)), 'COUNT')
      ),
      '(',
      optional(alias(/distinct/i, 'DISTINCT')),
      choice($.simple_arithmetic_expression, '*'),
      ')'
    ),

    // === CASE EXPRESSIONS ===

    // CaseExpression ::= GeneralCaseExpression | SimpleCaseExpression | CoalesceExpression | NullifExpression
    case_expression: $ => choice(
      $.general_case_expression,
      $.simple_case_expression,
      $.coalesce_expression,
      $.nullif_expression
    ),

    // GeneralCaseExpression ::= "CASE" WhenClause {WhenClause}* "ELSE" ScalarExpression "END"
    general_case_expression: $ => seq(
      alias(token(prec(1, /case/i)), 'CASE'),
      repeat1($.when_clause),
      alias(token(prec(1, /else/i)), 'ELSE'),
      $.scalar_expression,
      alias(token(prec(1, /end/i)), 'END')
    ),

    // WhenClause ::= "WHEN" ConditionalExpression "THEN" ScalarExpression
    when_clause: $ => seq(
      alias(token(prec(1, /when/i)), 'WHEN'),
      $.conditional_expression,
      alias(token(prec(1, /then/i)), 'THEN'),
      $.scalar_expression
    ),

    // SimpleCaseExpression ::= "CASE" CaseOperand SimpleWhenClause {SimpleWhenClause}* "ELSE" ScalarExpression "END"
    simple_case_expression: $ => seq(
      alias(token(prec(1, /case/i)), 'CASE'),
      $.case_operand,
      repeat1($.simple_when_clause),
      alias(token(prec(1, /else/i)), 'ELSE'),
      $.scalar_expression,
      alias(token(prec(1, /end/i)), 'END')
    ),

    // CaseOperand ::= StateFieldPathExpression | TypeDiscriminator
    case_operand: $ => choice(
      $.state_field_path_expression,
      $.type_discriminator
    ),

    // TypeDiscriminator - not fully defined in EBNF, placeholder
    type_discriminator: $ => $.identifier,

    // SimpleWhenClause ::= "WHEN" ScalarExpression "THEN" ScalarExpression
    simple_when_clause: $ => seq(
      alias(/when/i, 'WHEN'),
      $.scalar_expression,
      alias(/then/i, 'THEN'),
      $.scalar_expression
    ),

    // CoalesceExpression ::= "COALESCE" "(" ScalarExpression {"," ScalarExpression}* ")"
    coalesce_expression: $ => seq(
      alias(/coalesce/i, 'COALESCE'),
      '(',
      commaSep1($.scalar_expression),
      ')'
    ),

    // NullifExpression ::= "NULLIF" "(" ScalarExpression "," ScalarExpression ")"
    nullif_expression: $ => seq(
      alias(/nullif/i, 'NULLIF'),
      '(',
      $.scalar_expression,
      ',',
      $.scalar_expression,
      ')'
    ),

    // === FUNCTIONS ===

    // FunctionDeclaration ::= FunctionsReturningStrings | FunctionsReturningNumerics | FunctionsReturningDateTime
    function_declaration: $ => choice(
      $.functions_returning_strings,
      $.functions_returning_numerics,
      $.functions_returning_datetime
    ),

    // FunctionsReturningNumerics
    functions_returning_numerics: $ => choice(
      // LENGTH
      seq(alias(/length/i, 'LENGTH'), '(', $.string_primary, ')'),
      // LOCATE
      seq(alias(/locate/i, 'LOCATE'), '(', $.string_primary, ',', $.string_primary, optional(seq(',', $.simple_arithmetic_expression)), ')'),
      // ABS
      seq(alias(/abs/i, 'ABS'), '(', $.simple_arithmetic_expression, ')'),
      // SQRT
      seq(alias(/sqrt/i, 'SQRT'), '(', $.simple_arithmetic_expression, ')'),
      // MOD
      seq(alias(/mod/i, 'MOD'), '(', $.simple_arithmetic_expression, ',', $.simple_arithmetic_expression, ')'),
      // SIZE
      seq(alias(/size/i, 'SIZE'), '(', $.collection_valued_path_expression, ')'),
      // DATE_DIFF
      seq(alias(/date_diff/i, 'DATE_DIFF'), '(', $.arithmetic_primary, ',', $.arithmetic_primary, ')'),
      // BIT_AND
      seq(alias(/bit_and/i, 'BIT_AND'), '(', $.arithmetic_primary, ',', $.arithmetic_primary, ')'),
      // BIT_OR
      seq(alias(/bit_or/i, 'BIT_OR'), '(', $.arithmetic_primary, ',', $.arithmetic_primary, ')')
    ),

    // FunctionsReturningStrings
    functions_returning_strings: $ => choice(
      // CONCAT
      seq(alias(/concat/i, 'CONCAT'), '(', $.string_primary, ',', $.string_primary, ')'),
      // SUBSTRING
      seq(alias(/substring/i, 'SUBSTRING'), '(', $.string_primary, ',', $.simple_arithmetic_expression, ',', $.simple_arithmetic_expression, ')'),
      // TRIM
      seq(alias(/trim/i, 'TRIM'), '(', optional(seq(optional(choice(alias(/leading/i, 'LEADING'), alias(/trailing/i, 'TRAILING'), alias(/both/i, 'BOTH'))), optional($.char_literal), alias(/from/i, 'FROM'))), $.string_primary, ')'),
      // LOWER
      seq(alias(/lower/i, 'LOWER'), '(', $.string_primary, ')'),
      // UPPER
      seq(alias(/upper/i, 'UPPER'), '(', $.string_primary, ')'),
      // IDENTITY
      seq(alias(/identity/i, 'IDENTITY'), '(', $.single_valued_association_path_expression, optional(seq(',', $.string_literal)), ')')
    ),

    // FunctionsReturningDateTime
    functions_returning_datetime: $ => choice(
      // CURRENT_DATE
      alias(/current_date/i, 'CURRENT_DATE'),
      // CURRENT_TIME
      alias(/current_time/i, 'CURRENT_TIME'),
      // CURRENT_TIMESTAMP
      alias(/current_timestamp/i, 'CURRENT_TIMESTAMP'),
      // DATE_ADD
      seq(alias(/date_add/i, 'DATE_ADD'), '(', $.arithmetic_primary, ',', $.arithmetic_primary, ',', $.string_primary, ')'),
      // DATE_SUB
      seq(alias(/date_sub/i, 'DATE_SUB'), '(', $.arithmetic_primary, ',', $.arithmetic_primary, ',', $.string_primary, ')')
    )
  }
});

// Helper function for comma-separated lists
function commaSep1(rule) {
  return seq(rule, repeat(seq(',', rule)));
}
