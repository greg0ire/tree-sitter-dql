import XCTest
import SwiftTreeSitter
import TreeSitterDql

final class TreeSitterDqlTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_dql())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Doctrine Query Language grammar")
    }
}
